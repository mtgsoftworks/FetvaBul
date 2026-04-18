import { createHash } from 'crypto';
import { createReadStream, promises as fs } from 'fs';
import path from 'path';
import * as readline from 'readline';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DataManifest = {
  version: string;
  generatedAt: string;
  data: {
    fileName: string;
    relativePath: string;
    fallbackPath: string;
    sha256: string;
    size: number;
    recordCount: number;
    updatedAt: string;
  };
};

const rootDir = process.cwd();
const manifestPath = path.join(rootDir, 'public', 'data', 'manifest.json');
const fallbackProcessedPath = path.join(rootDir, 'public', 'data', 'processed_fetvas.jsonl');
const fallbackConsolidatedPath = path.join(rootDir, 'data', 'consolidated_fetvas.jsonl');

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function computeSha256(filePath: string): Promise<string> {
  const hash = createHash('sha256');

  await new Promise<void>((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });

  return hash.digest('hex');
}

async function countJsonlRecords(filePath: string): Promise<number> {
  const stream = createReadStream(filePath, { encoding: 'utf-8' });
  const reader = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let count = 0;

  for await (const line of reader) {
    if (line.trim().length > 0) {
      count += 1;
    }
  }

  return count;
}

function isDataManifest(value: unknown): value is DataManifest {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  if (!record.data || typeof record.data !== 'object') {
    return false;
  }

  const data = record.data as Record<string, unknown>;

  return (
    typeof record.version === 'string' &&
    typeof record.generatedAt === 'string' &&
    typeof data.fileName === 'string' &&
    typeof data.relativePath === 'string' &&
    typeof data.fallbackPath === 'string' &&
    typeof data.sha256 === 'string' &&
    typeof data.size === 'number' &&
    typeof data.recordCount === 'number' &&
    typeof data.updatedAt === 'string'
  );
}

async function buildFallbackManifest(): Promise<DataManifest> {
  const now = new Date().toISOString();

  const selectedPath =
    (await pathExists(fallbackProcessedPath))
      ? fallbackProcessedPath
      : fallbackConsolidatedPath;

  const [fileStats, sha256, recordCount] = await Promise.all([
    fs.stat(selectedPath),
    computeSha256(selectedPath),
    countJsonlRecords(selectedPath),
  ]);

  const shortHash = sha256.slice(0, 12);
  const fileName = path.basename(selectedPath);
  const relativePath = selectedPath === fallbackProcessedPath
    ? '/data/processed_fetvas.jsonl'
    : '/data/consolidated_fetvas.jsonl';

  return {
    version: shortHash,
    generatedAt: now,
    data: {
      fileName,
      relativePath,
      fallbackPath: '/data/processed_fetvas.jsonl',
      sha256,
      size: fileStats.size,
      recordCount,
      updatedAt: now,
    },
  };
}

export async function GET() {
  try {
    if (await pathExists(manifestPath)) {
      const raw = await fs.readFile(manifestPath, 'utf-8');
      const parsed: unknown = JSON.parse(raw);

      if (isDataManifest(parsed)) {
        return NextResponse.json(parsed, {
          headers: {
            'Cache-Control': 'no-store',
          },
        });
      }
    }

    const fallbackManifest = await buildFallbackManifest();
    return NextResponse.json(fallbackManifest, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[manifest-api] Failed to resolve data manifest:', error);

    return NextResponse.json(
      { error: 'Unable to resolve data manifest' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
