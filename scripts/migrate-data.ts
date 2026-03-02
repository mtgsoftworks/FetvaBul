#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';

interface FetvaRecord {
  id: string;
  q_in_file: number;
  question: string;
  answer: string;
  categories: string[];
  source?: string;
  date?: string;
  views: number;
  likes: number;
  searchKeywords?: string[];
  arabicText?: string;
  normalizedText?: string;
}

interface RawFetvaData {
  q_in_file: number;
  question: string;
  answer: string;
  categories: string[];
  source?: string;
  date?: string;
  searchKeywords?: string[];
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[çğıöşü]/g, (match) => {
      const map: Record<string, string> = {
        'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'
      };
      return map[match] || match;
    })
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractKeywords(question: string, answer: string): string[] {
  const text = `${question} ${answer}`;
  const normalized = normalizeText(text);

  const stopWords = new Set([
    'bir', 'bu', 've', 'ile', 'de', 'da', 'mi', 'mu', 'mı', 'mü',
    'için', 'olan', 'olarak', 'gibi', 'kadar', 'daha', 'en', 'çok',
    'az', 'var', 'yok', 'ama', 'fakat', 'ancak', 'lakin', 'ki',
    'şu', 'o', 'ben', 'sen', 'biz', 'siz', 'onlar', 'kendi',
    'allah', 'peygamber', 'efendimiz', 'resulullah', 'hz', 'sav',
    'teala', 'cc', 'as', 'ra', 'hadis', 'rivayet', 'buhari',
    'etmek', 'olmak', 'yapmak', 'demek', 'gelmek', 'vermek',
    'almak', 'görmek', 'bilmek', 'söylemek', 'çıkmak', 'girmek'
  ]);

  const words = normalized
    .split(/\s+/)
    .filter(word => {
      if (word.length < 3 || word.length > 20) return false;
      if (stopWords.has(word)) return false;
      if (/^\d+$/.test(word)) return false;
      if (/(.)\1{2,}/.test(word)) return false;
      return true;
    })
    .slice(0, 25);

  return [...new Set(words)];
}

function extractArabicText(answer: string): string | undefined {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;
  const matches = answer.match(arabicRegex);

  if (matches && matches.length > 0) {
    const cleanedMatches = matches
      .map(match => match.trim())
      .filter(match => match.length > 1)
      .filter((match, index, arr) => arr.indexOf(match) === index);

    if (cleanedMatches.length > 0) {
      return cleanedMatches.join(' ');
    }
  }

  return undefined;
}

function generateFetvaId(question: string, qInFile: number): string {
  const hash = question.split('').reduce((acc, char) => {
    const code = char.charCodeAt(0);
    return ((acc << 5) - acc) + code;
  }, 0);

  return `fetva-${qInFile}-${Math.abs(hash).toString(36)}`;
}

async function migrateData() {
  console.log('🚀 Starting data transformation...');

  const sourcePath = path.join(process.cwd(), 'data', 'normalized_qa_with_keywords.jsonl');
  const targetPath = path.join(process.cwd(), 'data', 'processed_fetvas.jsonl');

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source data file not found: ${sourcePath}`);
    process.exit(1);
  }

  const readStream = fs.createReadStream(sourcePath, { encoding: 'utf-8' });
  const writeStream = fs.createWriteStream(targetPath, { encoding: 'utf-8' });
  const reader = readline.createInterface({ input: readStream, crlfDelay: Infinity });

  let successCount = 0;
  let skippedCount = 0;
  let lineNumber = 0;

  for await (const line of reader) {
    lineNumber += 1;
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    try {
      const rawData: RawFetvaData = JSON.parse(trimmed);

      const question = rawData.question?.trim();
      const answer = rawData.answer?.trim();
      const categories = Array.isArray(rawData.categories)
        ? rawData.categories.map(c => c.trim()).filter(Boolean)
        : [];

      if (!question || !answer || categories.length === 0) {
        console.warn(`⚠️  Skipping invalid record at line ${lineNumber}`);
        skippedCount += 1;
        continue;
      }

      const searchKeywords = rawData.searchKeywords && rawData.searchKeywords.length > 0
        ? Array.from(new Set(rawData.searchKeywords.map(k => k.trim()).filter(Boolean)))
        : extractKeywords(question, answer);

      const record: FetvaRecord = {
        id: generateFetvaId(question, rawData.q_in_file),
        q_in_file: rawData.q_in_file,
        question,
        answer,
        categories,
        source: rawData.source,
        date: rawData.date,
        views: 0,
        likes: 0,
        searchKeywords,
        arabicText: extractArabicText(answer),
        normalizedText: normalizeText(`${question} ${answer}`)
      };

      writeStream.write(`${JSON.stringify(record)}\n`);
      successCount += 1;

      if (successCount % 100 === 0) {
        console.log(`   📝 Processed ${successCount} records...`);
      }
    } catch (error) {
      console.error(`❌ Failed to process line ${lineNumber}:`, error);
      skippedCount += 1;
    }
  }

  writeStream.close();
  console.log('\n🎉 Transformation completed!');
  console.log(`✅ Records written: ${successCount}`);
  console.log(`⚠️ Skipped lines: ${skippedCount}`);
  console.log(`📄 Output file: ${targetPath}`);
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('\n✅ Transformation script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Transformation script failed:', error);
      process.exit(1);
    });
}