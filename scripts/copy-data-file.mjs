import { copyFile, constants, mkdir, readdir, stat, unlink, writeFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import * as readline from 'readline';

const source = path.resolve('data', 'consolidated_fetvas.jsonl');
const dataDir = path.resolve('data');
const publicDataDir = path.resolve('public', 'data');
const internalDataTarget = path.join(dataDir, 'processed_fetvas.jsonl');
const publicStableDataTarget = path.join(publicDataDir, 'processed_fetvas.jsonl');
const manifestTarget = path.join(publicDataDir, 'manifest.json');

async function computeSha256(filePath) {
  const hash = createHash('sha256');

  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', resolve);
  });

  return hash.digest('hex');
}

async function countJsonlRecords(filePath) {
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  const reader = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let count = 0;
  for await (const line of reader) {
    if (line.trim().length > 0) {
      count += 1;
    }
  }

  return count;
}

async function removePreviousVersionedArtifacts() {
  let entries = [];
  try {
    entries = await readdir(publicDataDir);
  } catch {
    return;
  }

  const staleFiles = entries.filter((entry) => /^processed_fetvas\.[a-f0-9]{12}\.jsonl$/i.test(entry));
  await Promise.all(
    staleFiles.map((fileName) => unlink(path.join(publicDataDir, fileName)).catch(() => undefined))
  );
}

async function copyWithCloneFallback(from, to) {
  await mkdir(path.dirname(to), { recursive: true });

  try {
    await copyFile(from, to, constants.COPYFILE_FICLONE_FORCE);
  } catch (cloneError) {
    if (cloneError.code === 'ENOSYS' || cloneError.code === 'ERR_FS_CP_DIR_TO_NON_DIR') {
      await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(from);
        const writeStream = fs.createWriteStream(to);
        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('close', resolve);
        readStream.pipe(writeStream);
      });
    } else {
      await copyFile(from, to);
    }
  }
}

async function run() {
  try {
    await mkdir(dataDir, { recursive: true });
    await mkdir(publicDataDir, { recursive: true });

    const stableTargets = [internalDataTarget, publicStableDataTarget];
    for (const target of stableTargets) {
      await copyWithCloneFallback(source, target);
      console.log(`[copy-data-file] Copied ${source} -> ${target}`);
    }

    const [sourceStats, sha256, recordCount] = await Promise.all([
      stat(source),
      computeSha256(source),
      countJsonlRecords(source),
    ]);

    const shortHash = sha256.slice(0, 12);
    const versionedFileName = `processed_fetvas.${shortHash}.jsonl`;
    const versionedTarget = path.join(publicDataDir, versionedFileName);

    await removePreviousVersionedArtifacts();
    await copyWithCloneFallback(source, versionedTarget);
    console.log(`[copy-data-file] Copied ${source} -> ${versionedTarget}`);

    const generatedAt = new Date().toISOString();
    const manifest = {
      version: shortHash,
      generatedAt,
      data: {
        fileName: versionedFileName,
        relativePath: `/data/${versionedFileName}`,
        fallbackPath: '/data/processed_fetvas.jsonl',
        sha256,
        size: sourceStats.size,
        recordCount,
        updatedAt: generatedAt,
      },
    };

    await writeFile(manifestTarget, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
    console.log(`[copy-data-file] Wrote manifest -> ${manifestTarget}`);
  } catch (error) {
    console.error('[copy-data-file] Failed to copy data file:', error);
    process.exitCode = 1;
  }
}

run();
