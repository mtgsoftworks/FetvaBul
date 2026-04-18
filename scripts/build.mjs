import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();
const apiDir = path.join(root, 'app', 'api');
const apiBackupDir = path.join(root, 'app', '__api_static_export_backup__');
const isStaticExport = process.env.STATIC_EXPORT === '1';

async function run() {
  let movedApiRoutes = false;

  try {
    if (isStaticExport) {
      const moved = await temporarilyDisableApiRoutes();
      if (moved === null) {
        process.exitCode = 1;
        return;
      }
      movedApiRoutes = moved;
    }

    const copyResult = await runCommand('node', [path.join('scripts', 'copy-data-file.mjs')]);
    if (!copyResult) {
      process.exitCode = 1;
      return;
    }

    const nextBuildResult = await runCommand('npx', ['next', 'build']);
    if (!nextBuildResult) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('[build] Build script failed:', error);
    process.exitCode = 1;
  } finally {
    if (movedApiRoutes) {
      const restored = await restoreApiRoutes();
      if (!restored) {
        process.exitCode = 1;
      }
    }
  }
}

async function temporarilyDisableApiRoutes() {
  try {
    if (!(await pathExists(apiDir))) {
      return false;
    }

    if (await pathExists(apiBackupDir)) {
      console.error('[build] Cannot run static export because backup API directory already exists.');
      return null;
    }

    await fs.rename(apiDir, apiBackupDir);
    console.log('[build] Temporarily moved app/api for static export build.');
    return true;
  } catch (error) {
    console.error('[build] Failed to move app/api before static export:', error);
    return null;
  }
}

async function restoreApiRoutes() {
  try {
    if (!(await pathExists(apiBackupDir))) {
      return true;
    }

    await fs.rename(apiBackupDir, apiDir);
    console.log('[build] Restored app/api after static export build.');
    return true;
  } catch (error) {
    console.error('[build] Failed to restore app/api after static export:', error);
    return false;
  }
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function runCommand(command, args, env = process.env) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd: root,
      env,
      shell: process.platform === 'win32'
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`[build] Command failed: ${command} ${args.join(' ')} (exit ${code})`);
        resolve(false);
      } else {
        resolve(true);
      }
    });

    child.on('error', (error) => {
      console.error(`[build] Failed to start command ${command}:`, error);
      resolve(false);
    });
  });
}

run();
