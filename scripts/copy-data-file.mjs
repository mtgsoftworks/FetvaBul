import { copyFile, constants } from 'fs/promises';
import fs from 'fs';
import path from 'path';

const source = path.resolve('data', 'consolidated_fetvas.jsonl');
const target = path.resolve('data', 'processed_fetvas.jsonl');

async function run() {
  try {
    try {
      await copyFile(source, target, constants.COPYFILE_FICLONE_FORCE);
    } catch (cloneError) {
      if (cloneError.code === 'ENOSYS' || cloneError.code === 'ERR_FS_CP_DIR_TO_NON_DIR') {
        await new Promise((resolve, reject) => {
          const readStream = fs.createReadStream(source);
          const writeStream = fs.createWriteStream(target);
          readStream.on('error', reject);
          writeStream.on('error', reject);
          writeStream.on('close', resolve);
          readStream.pipe(writeStream);
        });
      } else {
        await copyFile(source, target);
      }
    }
    console.log(`[copy-data-file] Copied ${source} -> ${target}`);
  } catch (error) {
    console.error('[copy-data-file] Failed to copy data file:', error);
    process.exitCode = 1;
  }
}

run();
