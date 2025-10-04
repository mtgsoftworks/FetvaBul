import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import * as readline from 'readline';
import { createHash } from 'crypto';
import { SearchIndex, TurkishNormalizer } from './search-index';
import { incrementViewCount, getViewCount } from './firebase';
import {
  RawFetvaData,
  DataServiceError,
  isValidRawFetvaData,
  createCategorySlug,
  SiteStats,
  InternalSearchOptions,
  InternalSearchResult,
  Fetva,
  Category
} from '@/types';

const DATA_FILE_NAME = 'processed_fetvas.jsonl';

type RawFetvaRecord = RawFetvaData & Record<string, any>;

export class DataService {
  private static instance: DataService;

  private isInitialized = false;
  private initializePromise?: Promise<void>;

  private readonly dataFilePath = (() => {
    const envPath = process.env.DATA_FILE;
    if (envPath && typeof envPath === 'string' && envPath.trim()) {
      const p = envPath.trim();
      return path.isAbsolute(p) ? p : path.join(process.cwd(), p);
    }
    return path.join(process.cwd(), 'data', DATA_FILE_NAME);
  })();

  private fetvas: Fetva[] = [];
  private fetvaById: Map<string, Fetva> = new Map();
  private categories: Category[] = [];
  private categoryBySlug: Map<string, Category> = new Map();
  private keywordIndex: Map<string, Set<string>> = new Map();
  private keywordFrequency: Map<string, number> = new Map();
  private searchIndex = new SearchIndex();
  private viewsOverrides: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (!this.initializePromise) {
      this.initializePromise = this.loadDataFromFile()
        .then(() => {
          this.isInitialized = true;
        })
        .catch(error => {
          this.isInitialized = false;
          this.initializePromise = undefined;

          throw error instanceof DataServiceError
            ? error
            : new DataServiceError(
                'INITIALIZATION_FAILED',
                `Failed to initialize data service: ${error instanceof Error ? error.message : 'Unknown error'}`,
                500
              );
        });
    }

    await this.initializePromise;
  }

  public async search(options: InternalSearchOptions): Promise<InternalSearchResult[]> {
    this.ensureInitialized();

    const {
      query,
      category,
      sortBy = 'relevance',
      limit = 20,
      offset = 0,
      minScore = 0.1
    } = options;

    if (!query || query.trim().length < 2) {
      return await this.getAllFatvasForSearch({ ...options, limit, offset, sortBy });
    }

    try {
      const searchResults = this.searchIndex.search(query, {
        fuzzy: true,
        stemming: true,
        maxResults: Math.min(this.fetvas.length, limit * 5 + offset),
        minScore
      });

      const filtered: InternalSearchResult[] = [];

      for (const result of searchResults) {
        const fetva = this.fetvaById.get(result.documentId);
        if (!fetva) {
          continue;
        }

        if (category && category.trim() && !fetva.categories.includes(category)) {
          continue;
        }

        filtered.push({
          fetva: await this.withRuntimeViews(fetva),
          score: result.score,
          matchedTerms: result.matchedTerms,
          highlightedQuestion: this.highlightText(fetva.question, result.matchedTerms),
          highlightedAnswer: this.highlightText(fetva.answer, result.matchedTerms)
        });
      }

      const sorted = await this.sortResults(filtered, sortBy);
      return sorted.slice(offset, offset + limit);
    } catch (error) {
      console.error('Search error:', error);
      throw new DataServiceError(
        'SEARCH_ERROR',
        `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  public async searchByKeywords(
    keywords: string[],
    options: Omit<InternalSearchOptions, 'query'> = {}
  ): Promise<InternalSearchResult[]> {
    this.ensureInitialized();

    const { limit = 20, offset = 0, sortBy = 'views', category } = options;

    try {
      const normalizedKeywords = Array.from(
        new Set(
          keywords
            .map(keyword => this.normalizeKeyword(keyword))
            .filter((keyword): keyword is string => Boolean(keyword))
        )
      );

      if (normalizedKeywords.length === 0) {
        return [];
      }

      const matchedIds = new Set<string>();

      for (const keyword of normalizedKeywords) {
        const ids = this.keywordIndex.get(keyword);
        ids?.forEach(id => matchedIds.add(id));
      }

      const results: InternalSearchResult[] = [];

      for (const [id, fetva] of Array.from(this.fetvaById.entries())) {
        if (!matchedIds.has(id)) {
          continue;
        }

        if (category && category.trim() && !fetva.categories.includes(category)) {
          continue;
        }

        results.push({
          fetva: await this.withRuntimeViews(fetva),
          score: normalizedKeywords.length,
          matchedTerms: normalizedKeywords,
          highlightedQuestion: this.highlightText(fetva.question, normalizedKeywords),
          highlightedAnswer: this.highlightText(fetva.answer, normalizedKeywords)
        });
      }

      const sorted = await this.sortResults(results, sortBy);
      return sorted.slice(offset, offset + limit);
    } catch (error) {
      console.error('Keyword search error:', error);
      throw new DataServiceError(
        'KEYWORD_SEARCH_ERROR',
        `Keyword search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }
  }

  public async findSimilarQuestions(question: string, limit: number = 5): Promise<Fetva[]> {
    this.ensureInitialized();

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return this.getPopularFatwas(limit);
    }

    try {
      const results = await this.search({ query: trimmedQuestion, limit: limit * 2, sortBy: 'relevance' });
      const unique: Fetva[] = [];
      const seen = new Set<string>();

      for (const result of results) {
        if (seen.has(result.fetva.id)) {
          continue;
        }
        seen.add(result.fetva.id);
        unique.push(result.fetva);
        if (unique.length >= limit) {
          break;
        }
      }

      return unique.length > 0 ? unique : this.getPopularFatwas(limit);
    } catch (error) {
      console.error('Similar questions error:', error);
      return this.getPopularFatwas(limit);
    }
  }

  public async getAutocompleteSuggestions(query: string, limit: number = 10): Promise<string[]> {
    this.ensureInitialized();

    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length < 2) {
      return [];
    }

    try {
      const suggestions = new Set<string>();

      for (const fetva of this.fetvas) {
        if (fetva.question.toLowerCase().startsWith(normalizedQuery)) {
          suggestions.add(fetva.question);
          if (suggestions.size >= limit) {
            break;
          }
        }
      }

      if (suggestions.size < limit) {
        const keywordSuggestions = this.searchIndex.getSuggestions(normalizedQuery, limit * 2);
        keywordSuggestions.forEach(suggestion => {
          if (suggestions.size < limit) {
            suggestions.add(suggestion);
          }
        });
      }

      if (suggestions.size < limit) {
        for (const [keyword] of Array.from(this.keywordFrequency.entries()).sort((a, b) => b[1] - a[1])) {
          if (keyword.startsWith(normalizedQuery)) {
            suggestions.add(keyword);
          }
          if (suggestions.size >= limit) {
            break;
          }
        }
      }

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  public async getFetvaById(id: string): Promise<Fetva | null> {
    this.ensureInitialized();

    const fetva = this.fetvaById.get(id);
    return fetva ? this.withRuntimeViews(fetva) : null;
  }

  public async getAllFatwas(): Promise<Fetva[]> {
    this.ensureInitialized();
    return this.fetvas.map(fetva => this.withRuntimeViews(fetva));
  }

  public async getFatwasByCategory(categoryName: string): Promise<Fetva[]> {
    this.ensureInitialized();
    return this.fetvas
      .filter(fetva => fetva.categories.includes(categoryName))
      .map(fetva => this.withRuntimeViews(fetva));
  }

  public async getAllCategories(): Promise<Category[]> {
    this.ensureInitialized();
    return this.categories;
  }

  public async getCategoryBySlug(slug: string): Promise<Category | null> {
    this.ensureInitialized();
    return this.categoryBySlug.get(slug) ?? null;
  }

  public async getPopularFatwas(limit: number = 10): Promise<Fetva[]> {
    this.ensureInitialized();

    // Tüm fetvalar için görüntüleme sayılarını al
    const fetvasWithViews = await Promise.all(
      this.fetvas.map(async (fetva) => ({
        fetva,
        viewCount: await this.getViewCount(fetva.id)
      }))
    );

    return fetvasWithViews
      .sort((a, b) => b.viewCount - a.viewCount || b.fetva.likes - a.fetva.likes)
      .slice(0, limit)
      .map(item => this.withRuntimeViews(item.fetva));
  }

  public async incrementViews(id: string): Promise<void> {
    this.ensureInitialized();

    try {
      // Firebase Firestore'da görüntüleme sayısını artır
      await incrementViewCount(id);
    } catch (error) {
      console.error('Failed to increment view count in Firestore:', error);
      // Hata durumunda eski yönteme geri dön (geçici çözüm)
      const current = this.viewsOverrides.get(id) ?? 0;
      this.viewsOverrides.set(id, current + 1);
    }
  }

  public async getStats(): Promise<SiteStats> {
    this.ensureInitialized();

    try {
      const totalFatwas = this.fetvas.length;
      const totalCategories = this.categories.length;
      
      // Tüm fetvalar için görüntüleme sayılarını al
      const viewCounts = await Promise.all(
        this.fetvas.map(async (fetva) => await this.getViewCount(fetva.id))
      );
      const totalViews = viewCounts.reduce((sum, count) => sum + count, 0);
      
      const popularCategories = this.categories
        .slice()
        .sort((a, b) => b.fatwaCount - a.fatwaCount)
        .slice(0, 5)
        .map(category => category.name);

      return {
        totalFatwas,
        totalCategories,
        totalViews,
        popularCategories
      };
    } catch (error) {
      console.error('Get stats error:', error);
      return {
        totalFatwas: 0,
        totalCategories: 0,
        totalViews: 0,
        popularCategories: []
      };
    }
  }

  public async getSearchStats() {
    this.ensureInitialized();

    const totalFatwas = this.fetvas.length;
    const totalKeywords = Array.from(this.keywordFrequency.values()).reduce((sum, count) => sum + count, 0);
    const averageKeywordsPerFatva = totalFatwas > 0 ? totalKeywords / totalFatwas : 0;
    const mostCommonKeywords = Array.from(this.keywordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([keyword, count]) => ({ keyword, count }));

    return {
      totalFatwas,
      totalKeywords,
      averageKeywordsPerFatva,
      mostCommonKeywords
    };
  }

  private async loadDataFromFile(): Promise<void> {
    let stats;
    try {
      stats = await fs.stat(this.dataFilePath);
      if (!stats.isFile()) {
        throw new Error('Path is not a file');
      }
    } catch (error) {
      throw new DataServiceError(
        'DATA_FILE_NOT_FOUND',
        `Unable to access data file at ${this.dataFilePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500
      );
    }

    console.log(` Loading data from ${this.dataFilePath} (${stats.size} bytes)...`);

    const fileStream = createReadStream(this.dataFilePath, { encoding: 'utf-8' });
    const reader = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    const fetvas: Fetva[] = [];
    const fetvaById = new Map<string, Fetva>();
    const keywordIndex = new Map<string, Set<string>>();
    const keywordFrequency = new Map<string, number>();
    const categoryCounts = new Map<string, number>();

    let lineNumber = 0;

    for await (const line of reader) {
      lineNumber += 1;
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      let record: RawFetvaRecord;
      try {
        record = JSON.parse(trimmed);
      } catch (error) {
        throw new DataServiceError(
          'DATA_PARSE_ERROR',
          `Invalid JSON at line ${lineNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          500
        );
      }

      if (!isValidRawFetvaData(record)) {
        console.warn(`[DataService] Skipping invalid record at line ${lineNumber}`);
        continue;
      }

      const fetva = this.createFetvaFromRaw(record, lineNumber);
      fetvas.push(fetva);
      fetvaById.set(fetva.id, fetva);

      fetva.categories.forEach(category => {
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      });

      fetva.searchKeywords?.forEach(keyword => {
        const normalized = this.normalizeKeyword(keyword);
        if (!normalized) {
          return;
        }

        if (!keywordIndex.has(normalized)) {
          keywordIndex.set(normalized, new Set());
        }
        keywordIndex.get(normalized)!.add(fetva.id);

        keywordFrequency.set(normalized, (keywordFrequency.get(normalized) || 0) + 1);
      });
    }

    if (fetvas.length === 0) {
      throw new DataServiceError('DATA_EMPTY', 'No records found in data file', 500);
    }

    this.fetvas = fetvas;
    this.fetvaById = fetvaById;
    this.keywordIndex = keywordIndex;
    this.keywordFrequency = keywordFrequency;
    this.categories = this.buildCategories(categoryCounts);

    const categoryBySlug = new Map<string, Category>();
    this.categories.forEach(category => categoryBySlug.set(category.slug, category));
    this.categoryBySlug = categoryBySlug;

    this.viewsOverrides = new Map<string, number>();
    this.searchIndex.buildIndex(this.fetvas);

    console.log(` Loaded ${this.fetvas.length} fatwas across ${this.categories.length} categories.`);
  }

  private createFetvaFromRaw(raw: RawFetvaRecord, lineNumber: number): Fetva {
    const id = typeof raw.id === 'string' && raw.id
      ? raw.id
      : typeof raw._id === 'string' && raw._id
        ? raw._id
        : this.generateStableId(raw, lineNumber);

    const categories = Array.isArray(raw.categories)
      ? raw.categories.map((category: unknown) => String(category).trim()).filter(Boolean)
      : [];

    const baseKeywords = Array.isArray(raw.searchKeywords)
      ? raw.searchKeywords.map((keyword: unknown) => String(keyword).trim()).filter(Boolean)
      : [];

    const searchKeywords = baseKeywords.length > 0
      ? Array.from(new Set(baseKeywords))
      : TurkishNormalizer.extractKeywords(`${raw.question} ${raw.answer}`);

    const views = typeof raw.views === 'number' && raw.views >= 0 ? raw.views : 0;
    const likes = typeof raw.likes === 'number' && raw.likes >= 0 ? raw.likes : 0;

    const createdAt = raw.createdAt ? new Date(raw.createdAt) : undefined;
    const updatedAt = raw.updatedAt ? new Date(raw.updatedAt) : undefined;

    return {
      id,
      q_in_file: raw.q_in_file,
      question: raw.question,
      answer: raw.answer,
      categories,
      source: typeof raw.source === 'string' ? raw.source : undefined,
      date: typeof raw.date === 'string' ? raw.date : undefined,
      views,
      likes,
      searchKeywords,
      arabicText: typeof raw.arabicText === 'string' ? raw.arabicText : undefined,
      references: Array.isArray(raw.references) ? raw.references.map((ref: unknown) => String(ref)) : undefined,
      relatedFatwas: Array.isArray(raw.relatedFatwas) ? raw.relatedFatwas.map((ref: unknown) => String(ref)) : undefined,
      createdAt: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : undefined,
      updatedAt: updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt : undefined,
      normalizedText: typeof raw.normalizedText === 'string' ? raw.normalizedText : undefined
    };
  }

  private generateStableId(raw: RawFetvaRecord, lineNumber: number): string {
    const base = `${raw.q_in_file ?? lineNumber}-${raw.question}`;
    return createHash('sha1').update(base).digest('hex');
  }

  private buildCategories(counts: Map<string, number>): Category[] {
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr'))
      .map(([name, count], index) => {
        const slug = createCategorySlug(name);
        return {
          id: slug,
          name,
          slug,
          order: index,
          isActive: true,
          fatwaCount: count
        } as Category;
      });
  }

  private async sortResults(results: InternalSearchResult[], sortBy: InternalSearchOptions['sortBy']): Promise<InternalSearchResult[]> {
    switch (sortBy) {
      case 'date':
        return results.slice().sort((a, b) => {
          const dateA = a.fetva.date ? new Date(a.fetva.date).getTime() : 0;
          const dateB = b.fetva.date ? new Date(b.fetva.date).getTime() : 0;
          return dateB - dateA;
        });
      case 'popular':
      case 'views':
        // Görüntüleme sayılarına göre sıralama
        const resultsWithViews = await Promise.all(
          results.map(async (result) => ({
            result,
            viewCount: await this.getViewCount(result.fetva.id)
          }))
        );
        
        return resultsWithViews
          .sort((a, b) => b.viewCount - a.viewCount)
          .map(item => item.result);
      case 'relevance':
      default:
        return results.slice().sort((a, b) => b.score - a.score);
    }
  }

  private async withRuntimeViews(fetva: Fetva): Promise<Fetva> {
    try {
      // Firebase Firestore'dan güncel görüntüleme sayısını al
      const firestoreViews = await getViewCount(fetva.id);
      const overrides = this.viewsOverrides.get(fetva.id) ?? 0;
      
      // Firestore'da veri varsa onu kullan, yoksa yerel veriyi kullan
      const totalViews = firestoreViews > 0 ? firestoreViews : fetva.views + overrides;
      
      return { ...fetva, views: totalViews };
    } catch (error) {
      console.error('Failed to get view count from Firestore:', error);
      // Hata durumunda eski yönteme geri dön
      const overrides = this.viewsOverrides.get(fetva.id) ?? 0;
      if (!overrides) {
        return fetva;
      }
      return { ...fetva, views: fetva.views + overrides };
    }
  }

  private async getViewCount(id: string): Promise<number> {
    try {
      // Önce Firebase Firestore'dan görüntüleme sayısını al
      const firestoreViews = await getViewCount(id);
      const baseViews = this.fetvaById.get(id)?.views ?? 0;
      const overrides = this.viewsOverrides.get(id) ?? 0;
      
      // Firestore'daki sayı varsa onu kullan, yoksa yerel sayıyı kullan
      return firestoreViews > 0 ? firestoreViews : baseViews + overrides;
    } catch (error) {
      console.error('Failed to get view count from Firestore:', error);
      // Hata durumunda eski yönteme geri dön
      const baseViews = this.fetvaById.get(id)?.views ?? 0;
      const overrides = this.viewsOverrides.get(id) ?? 0;
      return baseViews + overrides;
    }
  }

  private normalizeKeyword(keyword: string): string {
    return keyword.trim().toLowerCase();
  }

  private highlightText(text: string, terms: string[]): string {
    if (!terms.length) {
      return text;
    }

    // Escape and de-duplicate terms; sort by length desc to prevent partial overrides
    const uniqueTerms = Array.from(
      new Set(terms.map(term => this.escapeRegExp(term.trim())).filter(Boolean))
    ).sort((a, b) => b.length - a.length);
    if (!uniqueTerms.length) {
      return text;
    }

    try {
      // Highlight prefixes to better align with stemmed matches: term + word-characters
      const prefixPatterns = uniqueTerms.map(t => `${t}\\w*`);
      const pattern = new RegExp(`(${prefixPatterns.join('|')})`, 'gi');
      return text.replace(pattern, '<mark>$1</mark>');
    } catch {
      return text;
    }
  }

  private escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async getAllFatvasForSearch(options: InternalSearchOptions): Promise<InternalSearchResult[]> {
    const { category, sortBy = 'views', limit = 20, offset = 0 } = options;

    const filteredPromises = this.fetvas
      .filter(fetva => (category ? fetva.categories.includes(category) : true))
      .map(async (fetva) => ({
        fetva: await this.withRuntimeViews(fetva),
        score: 0,
        matchedTerms: []
      }));

    const filtered = await Promise.all(filteredPromises);
    const sorted = await this.sortResults(filtered, sortBy);
    return sorted.slice(offset, offset + limit);
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new DataServiceError(
        'SERVICE_NOT_INITIALIZED',
        'DataService must be initialized before use',
        500
      );
    }
  }
}
