import { spawn } from 'child_process';
import path from 'path';

const root = process.cwd();

async function run() {
  try {
    const copyResult = await runCommand('node', [path.join('scripts', 'copy-data-file.mjs')]);
    if (!copyResult) {
      process.exitCode = 1;
      return;
    }

    const env = { ...process.env, NEXT_TYPESCRIPT_CHECK: 'false' };
    const nextBuildResult = await runCommand('npx', ['next', 'build'], env);
    if (!nextBuildResult) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('[build] Build script failed:', error);
    process.exitCode = 1;
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
