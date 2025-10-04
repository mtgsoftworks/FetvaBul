import { 
  Fetva, 
  SearchIndexEntry, 
  SearchOptions,
  DataServiceError 
} from '../types';

export class TurkishNormalizer {
  private static readonly TURKISH_CHAR_MAP: Record<string, string> = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
  };

  // Genişletilmiş durak kelimeler listesi
  private static readonly STOP_WORDS = new Set([
    // Bağlaçlar
    've', 'ile', 'veya', 'ama', 'fakat', 'ancak', 'lakin', 'halbuki', 'hatta', 'ise',
    // Zarflar
    'çok', 'az', 'daha', 'en', 'pek', 'oldukça', 'az', 'biraz', 'fazla', 'hiç',
    'nasıl', 'ne', 'neden', 'niçin', 'nerede', 'ne zaman', 'kaç', 'kaçınca',
    // Zamirler
    'ben', 'sen', 'o', 'biz', 'siz', 'onlar', 'kendi', 'birbiri', 'birbirlerini',
    'bana', 'sana', 'ona', 'bize', 'size', 'onlara', 'beni', 'seni', 'onu',
    'bizi', 'sizi', 'onları', 'benim', 'senin', 'onun', 'bizim', 'sizin', 'onların',
    // Edatlar
    'için', 'göre', 'kadar', 'kadar', 'dolayı', 'yüzünden', 'itibaren', 'beri',
    'sonra', 'önce', 'hakkında', 'hakkında', 'sayesinde', 'rağmen',
    // Sıfat zamirleri
    'bu', 'şu', 'o', 'böyle', 'şöyle', 'öyle', 'aynı', 'farklı', 'çeşitli',
    'her', 'bütün', 'tüm', 'bazı', 'birkaç', 'birçok', 'birçok', 'pekçok',
    // Soru kelimeleri
    'mi', 'mu', 'mı', 'mü', 'mısın', 'musun', 'mısınız', 'musunuz',
    // Sayılar ve nicelik belirteçleri
    'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on',
    'yirmi', 'otuz', 'kırk', 'elli', 'altmış', 'yetmiş', 'seksen', 'doksan', 'yüz',
    'bin', 'milyon', 'milyar', 'kaç', 'kaçıncı', 'kaçar', 'kaçtane',
    // Zaman ifadeleri
    'dün', 'bugün', 'yarın', 'şimdi', 'şu anda', 'o zaman', 'o zamanlar',
    'geçen', 'gelecek', 'önceki', 'sonraki', 'eskiden', 'yeniden',
    // Genel ifadeler
    'var', 'yok', 'yoktur', 'vardır', 'olur', 'olmaz', 'olmalı', 'olmamalı',
    'etmek', 'olmak', 'yapmak', 'demek', 'gelmek', 'vermek', 'almak', 'görmek',
    'bilmek', 'söylemek', 'çıkmak', 'girmek', 'kalmak', 'durmak', 'gitmek',
    // İslami terimler (arama için değil, filtreleme için)
    'allah', 'cc', 'teala', 'c.c', 'c.c.', 'sallallahu', 'aleyhi', 've', 'sellem',
    'sallallahualeyhi', 'selam', 'aleyhisselam', 's.a.v', 's.a', 'sav',
    'peygamber', 'efendimiz', 'resulullah', 'hz', 'rasulullah', 'hadis',
    'rivayet', 'buhari', 'müslim', 'ebu', 'davud', 'tirmizi', 'nesai',
    'ibni', 'mace', 'darimi', 'malik', 'muwatta'
  ]);

  public static normalize(text: string): string {
    return text
      .toLowerCase()
      // Türkçe karakterleri normalize et
      .replace(/[çğıöşüÇĞİÖŞÜ]/g, (match) => this.TURKISH_CHAR_MAP[match] || match)
      // Noktalama işaretlerini ve özel karakterleri boşlukla değiştir
      .replace(/[^\w\s]/g, ' ')
      // Birden fazla boşluğu tek boşluğa indir
      .replace(/\s+/g, ' ')
      .trim();
  }

  public static tokenize(text: string): string[] {
    const normalized = this.normalize(text);
    return normalized
      .split(/\s+/)
      // 2 karakterden uzun ve durak kelime olmayanları filtrele
      .filter(token => token.length > 2 && !this.STOP_WORDS.has(token));
  }

  public static stem(word: string): string {
    // Gelişmiş Türkçe kök bulma - yaygın ekleri kaldır
    const suffixes = [
      // Çoğul ekleri
      'lar', 'ler',
      // Hal ekleri
      'dan', 'den', 'tan', 'ten', 'ndan', 'nden',
      // Yönelme ve bulunma hali
      'a', 'e', 'ya', 'ye',
      // Belirtme hali
      'ı', 'i', 'u', 'ü',
      // Tamlayan ekleri
      'nın', 'nin', 'nun', 'nün', 'mız', 'miz', 'muz', 'müz',
      // İyelik ekleri
      'ım', 'im', 'um', 'üm', 'sın', 'sin', 'sun', 'sün',
      'ız', 'iz', 'uz', 'üz', 'lar', 'ler',
      // Soru ekleri
      'mı', 'mi', 'mu', 'mü', 'mısın', 'misin', 'musun', 'müsün',
      // Fiil ekleri
      'mek', 'mak', 'di', 'dı', 'du', 'dü', 'yor', 'miş', 'mış', 'muş', 'müş',
      'ecek', 'acak', 'em', 'am', 'ar', 'er', 'erek', 'arak',
      // Sıfat ekleri
      'ci', 'cı', 'cu', 'cü', 'lik', 'lık', 'luk', 'lük', 'sel', 'sal',
      // Diğer yaygın ekler
      'ince', 'ince', 'ince', 'ecek', 'acak', 'diği', 'dığı', 'duğu', 'düğü',
      'diği', 'dığı', 'duğu', 'düğü', 'en', 'an'
    ];

    let stemmed = word;

    // Uzunluktan uzun olmayan ekleri sırayla dene
    for (const suffix of suffixes.sort((a, b) => b.length - a.length)) {
      if (stemmed.endsWith(suffix) && stemmed.length > suffix.length + 2) {
        stemmed = stemmed.slice(0, -suffix.length);
        break; // Sadece bir ek kaldır
      }
    }

    // Eğer kelime hala çok uzunsa, tekrar dene
    if (stemmed.length > 8) {
      for (const suffix of suffixes.sort((a, b) => b.length - a.length)) {
        if (stemmed.endsWith(suffix) && stemmed.length > suffix.length + 2) {
          stemmed = stemmed.slice(0, -suffix.length);
          break;
        }
      }
    }

    return stemmed;
  }

  public static extractKeywords(text: string, maxKeywords: number = 20): string[] {
    const tokens = this.tokenize(text);
    const stemmed = tokens.map(token => this.stem(token));
    
    // Frekansı say
    const frequency = new Map<string, number>();
    stemmed.forEach(token => {
      frequency.set(token, (frequency.get(token) || 0) + 1);
    });

    // Frekansa göre sırala ve en üst anahtar kelimeleri döndür
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([token]) => token);
  }
}

export class SearchIndex {
  private index: Map<string, SearchIndexEntry> = new Map();
  private documentCount = 0;
  private isBuilt = false;

  public buildIndex(fatwas: Fetva[]): void {
    console.log(`Building search index for ${fatwas.length} fatwas...`);
    
    this.index.clear();
    this.documentCount = fatwas.length;

    for (const fetva of fatwas) {
      this.addDocument(fetva);
    }

    this.isBuilt = true;
    console.log(`Search index built with ${this.index.size} unique terms`);
  }

  public addDocument(fetva: Fetva): void {
    // Process question field
    this.indexField(fetva.id, fetva.question, 'question', 3.0);
    
    // Process answer field
    this.indexField(fetva.id, fetva.answer, 'answer', 1.0);
    
    // Process categories field
    const categoriesText = fetva.categories.join(' ');
    this.indexField(fetva.id, categoriesText, 'categories', 2.0);

    // Process Arabic text if available
    if (fetva.arabicText) {
      this.indexField(fetva.id, fetva.arabicText, 'answer', 1.5);
    }
  }

  private indexField(
    documentId: string, 
    text: string, 
    field: 'question' | 'answer' | 'categories',
    weight: number
  ): void {
    const tokens = TurkishNormalizer.tokenize(text);
    const stems = tokens.map(t => TurkishNormalizer.stem(t));
    const positions = new Map<string, number[]>();

    // Track positions of each token
    stems.forEach((stemmed, index) => {
      if (!positions.has(stemmed)) positions.set(stemmed, []);
      positions.get(stemmed)!.push(index);
    });

    // Add unigrams to index
    for (const [term, termPositions] of Array.from(positions.entries())) {
      if (!this.index.has(term)) {
        this.index.set(term, {
          term,
          documents: new Map()
        });
      }

      const entry = this.index.get(term)!;
      const existingDoc = entry.documents.get(documentId);

      if (existingDoc) {
        // Update existing document entry
        existingDoc.frequency += termPositions.length;
        existingDoc.positions.push(...termPositions);
        existingDoc.fieldWeights[field] = Math.max(
          existingDoc.fieldWeights[field] || 0,
          weight
        );
      } else {
        // Create new document entry
        entry.documents.set(documentId, {
          id: documentId,
          frequency: termPositions.length,
          positions: [...termPositions],
          fieldWeights: {
            question: field === 'question' ? weight : 0,
            answer: field === 'answer' ? weight : 0,
            categories: field === 'categories' ? weight : 0,
          }
        });
      }
    }

    // Build and add bigrams
    if (stems.length >= 2) {
      const bigramMap = new Map<string, number[]>();
      for (let i = 0; i < stems.length - 1; i++) {
        const term = `${stems[i]} ${stems[i + 1]}`;
        if (!bigramMap.has(term)) bigramMap.set(term, []);
        bigramMap.get(term)!.push(i);
      }
      for (const [term, termPositions] of Array.from(bigramMap.entries())) {
        if (!this.index.has(term)) {
          this.index.set(term, { term, documents: new Map() });
        }
        const entry = this.index.get(term)!;
        const existingDoc = entry.documents.get(documentId);
        const w = weight + 0.5; // bigram slightly higher than unigram
        if (existingDoc) {
          existingDoc.frequency += termPositions.length;
          existingDoc.positions.push(...termPositions);
          existingDoc.fieldWeights[field] = Math.max(existingDoc.fieldWeights[field] || 0, w);
        } else {
          entry.documents.set(documentId, {
            id: documentId,
            frequency: termPositions.length,
            positions: [...termPositions],
            fieldWeights: {
              question: field === 'question' ? w : 0,
              answer: field === 'answer' ? w : 0,
              categories: field === 'categories' ? w : 0,
            }
          });
        }
      }
    }

    // Build and add trigrams
    if (stems.length >= 3) {
      const trigramMap = new Map<string, number[]>();
      for (let i = 0; i < stems.length - 2; i++) {
        const term = `${stems[i]} ${stems[i + 1]} ${stems[i + 2]}`;
        if (!trigramMap.has(term)) trigramMap.set(term, []);
        trigramMap.get(term)!.push(i);
      }
      for (const [term, termPositions] of Array.from(trigramMap.entries())) {
        if (!this.index.has(term)) {
          this.index.set(term, { term, documents: new Map() });
        }
        const entry = this.index.get(term)!;
        const existingDoc = entry.documents.get(documentId);
        const w = weight + 0.8; // trigram > bigram > unigram
        if (existingDoc) {
          existingDoc.frequency += termPositions.length;
          existingDoc.positions.push(...termPositions);
          existingDoc.fieldWeights[field] = Math.max(existingDoc.fieldWeights[field] || 0, w);
        } else {
          entry.documents.set(documentId, {
            id: documentId,
            frequency: termPositions.length,
            positions: [...termPositions],
            fieldWeights: {
              question: field === 'question' ? w : 0,
              answer: field === 'answer' ? w : 0,
              categories: field === 'categories' ? w : 0,
            }
          });
        }
      }
    }
  }

  public search(query: string, options: SearchOptions = {}): Array<{
    documentId: string;
    score: number;
    matchedTerms: string[];
  }> {
    if (!this.isBuilt) {
      throw new DataServiceError(
        'INDEX_NOT_BUILT',
        'Search index must be built before searching',
        500
      );
    }

    const {
      fuzzy = false,
      stemming = true,
      maxResults = 100,
      minScore = 0.1
    } = options;

    // Normalize and tokenize query
    const queryTerms = TurkishNormalizer.tokenize(query);
    const processedTerms = stemming 
      ? queryTerms.map(term => TurkishNormalizer.stem(term))
      : queryTerms;

    if (processedTerms.length === 0) {
      return [];
    }

    // Find matching documents
    const documentScores = new Map<string, {
      score: number;
      matchedTerms: Set<string>;
    }>();

    // Performans için terim sayısını sınırla
    const maxTermsToProcess = Math.min(processedTerms.length, 5);
    
    for (let i = 0; i < maxTermsToProcess; i++) {
      const term = processedTerms[i];
      const matches = this.findTermMatches(term, fuzzy);
      
      // Performans için eşleşme sayısını sınırla
      const maxMatchesPerTerm = Math.min(matches.length, 100);
      
      for (let j = 0; j < maxMatchesPerTerm; j++) {
        const matchedTerm = matches[j];
        const entry = this.index.get(matchedTerm);
        if (!entry) continue;

        for (const [docId, docData] of Array.from(entry.documents.entries())) {
          const termScore = this.calculateTermScore(
            docData,
            processedTerms.length,
            entry.documents.size
          );
          
          if (!documentScores.has(docId)) {
            documentScores.set(docId, {
              score: 0,
              matchedTerms: new Set()
            });
          }

          const docScore = documentScores.get(docId)!;
          docScore.score += termScore;
          docScore.matchedTerms.add(matchedTerm);
        }
      }
    }

    // Score exact bigram/trigram matches from the query
    if (processedTerms.length >= 2) {
      const buildNgrams = (arr: string[], n: number): string[] => {
        const out: string[] = [];
        for (let i = 0; i <= arr.length - n; i++) out.push(arr.slice(i, i + n).join(' '));
        return out;
      };
      const bigrams = buildNgrams(processedTerms, 2).slice(0, 5);
      const trigrams = buildNgrams(processedTerms, 3).slice(0, 4);
      for (const nterm of [...bigrams, ...trigrams]) {
        const entry = this.index.get(nterm);
        if (!entry) continue;
        for (const [docId, docData] of Array.from(entry.documents.entries())) {
          const termScore = this.calculateTermScore(
            docData,
            processedTerms.length,
            entry.documents.size
          );
          if (!documentScores.has(docId)) {
            documentScores.set(docId, {
              score: 0,
              matchedTerms: new Set()
            });
          }
          const docScore = documentScores.get(docId)!;
          docScore.score += termScore;
          docScore.matchedTerms.add(nterm);
        }
      }
    }

    // Phrase proximity bonus: reward documents where matched terms occur close together
    if (documentScores.size > 0) {
      for (const [docId, data] of Array.from(documentScores.entries())) {
        const terms = Array.from(data.matchedTerms);
        if (terms.length < 2) continue;
        // Limit number of terms considered for performance
        const limited = terms.slice(0, 4);
        let bestDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < limited.length; i++) {
          const entryA = this.index.get(limited[i]);
          const docA = entryA?.documents.get(docId);
          if (!docA) continue;
          for (let j = i + 1; j < limited.length; j++) {
            const entryB = this.index.get(limited[j]);
            const docB = entryB?.documents.get(docId);
            if (!docB) continue;
            // Compute minimal absolute distance between any position pair
            for (const pa of docA.positions) {
              for (const pb of docB.positions) {
                const d = Math.abs(pa - pb);
                if (d < bestDistance) bestDistance = d;
                if (bestDistance === 0) break;
              }
              if (bestDistance === 0) break;
            }
          }
        }
        if (bestDistance < Number.POSITIVE_INFINITY) {
          // Distance 0-1 strong bonus, decays up to window 8
          const window = 8;
          const proximity = Math.max(0, window - Math.min(bestDistance, window)); // 0..8
          const bonus = 1 + (proximity / window) * 0.5; // up to +50%
          data.score *= bonus;
        }
      }
    }

    // Convert to results array and sort by score
    const results = Array.from(documentScores.entries())
      .map(([documentId, data]) => ({
        documentId,
        score: data.score,
        matchedTerms: Array.from(data.matchedTerms)
      }))
      .filter(result => result.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return results;
  }

  private findTermMatches(term: string, fuzzy: boolean): string[] {
    const matches: string[] = [];

    // Exact match
    if (this.index.has(term)) {
      matches.push(term);
    }

    // Fuzzy matching (prefix + bounded edit distance)
    if (fuzzy && matches.length === 0) {
      const tLen = term.length;
      const threshold = tLen <= 4 ? 1 : tLen <= 7 ? 2 : 3;
      const first = term[0];

      for (const indexTerm of Array.from(this.index.keys())) {
        // Quick pruning: first char match and reasonable length diff
        if (indexTerm[0] !== first) continue;
        const lenDiff = Math.abs(indexTerm.length - tLen);
        if (lenDiff > threshold) continue;

        // Prefix boost: if either is prefix of the other, accept directly
        if (indexTerm.startsWith(term) || term.startsWith(indexTerm)) {
          matches.push(indexTerm);
          continue;
        }

        // Edit distance check within threshold
        const dist = this.computeEditDistance(indexTerm, term, threshold);
        if (dist <= threshold) {
          matches.push(indexTerm);
        }
      }
    }

    return matches;
  }

  private calculateTermScore(
    docData: {
      id: string;
      frequency: number;
      positions: number[];
      fieldWeights: {
        question: number;
        answer: number;
        categories: number;
      };
    },
    queryLength: number,
    documentFrequency: number
  ): number {
    // TF-IDF inspired scoring
    const tf = Math.log(1 + docData.frequency);
    // Per-term IDF with add-one smoothing
    const idf = Math.log((this.documentCount + 1) / (documentFrequency + 1)) + 1;
    
    // Field weight bonus
    const fieldWeight = Math.max(
      docData.fieldWeights.question,
      docData.fieldWeights.answer,
      docData.fieldWeights.categories
    );

    // Query coverage bonus
    const coverageBonus = 1 + (1 / queryLength);

    return tf * idf * fieldWeight * coverageBonus;
  }

  // Compute edit distance with early exit when exceeding maxDist
  private computeEditDistance(a: string, b: string, maxDist: number): number {
    const n = a.length;
    const m = b.length;
    if (Math.abs(n - m) > maxDist) return maxDist + 1;

    // Initialize previous row
    let prev = new Array(m + 1);
    for (let j = 0; j <= m; j++) prev[j] = j;

    for (let i = 1; i <= n; i++) {
      let curr = new Array(m + 1);
      curr[0] = i;
      let rowMin = curr[0];
      const ca = a.charCodeAt(i - 1);
      for (let j = 1; j <= m; j++) {
        const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
        const del = prev[j] + 1;
        const ins = curr[j - 1] + 1;
        const sub = prev[j - 1] + cost;
        const v = Math.min(del, ins, sub);
        curr[j] = v;
        if (v < rowMin) rowMin = v;
      }
      if (rowMin > maxDist) return maxDist + 1; // early exit
      prev = curr;
    }
    return prev[m];
  }

  public removeDocument(documentId: string): void {
    for (const entry of Array.from(this.index.values())) {
      entry.documents.delete(documentId);
      
      // Remove empty entries
      if (entry.documents.size === 0) {
        this.index.delete(entry.term);
      }
    }
  }

  public getIndexStats(): {
    termCount: number;
    documentCount: number;
    averageTermsPerDocument: number;
  } {
    const totalTermOccurrences = Array.from(this.index.values())
      .reduce((sum, entry) => sum + entry.documents.size, 0);

    return {
      termCount: this.index.size,
      documentCount: this.documentCount,
      averageTermsPerDocument: this.documentCount > 0 
        ? totalTermOccurrences / this.documentCount 
        : 0
    };
  }

  public getSuggestions(partialQuery: string, limit: number = 5): string[] {
    const normalized = TurkishNormalizer.normalize(partialQuery);
    const suggestions: Array<{ term: string; frequency: number }> = [];

    for (const [term, entry] of Array.from(this.index.entries())) {
      if (term.startsWith(normalized) && term !== normalized) {
        suggestions.push({
          term,
          frequency: entry.documents.size
        });
      }
    }

    return suggestions
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit)
      .map(s => s.term);
  }

  public isIndexBuilt(): boolean {
    return this.isBuilt;
  }
}