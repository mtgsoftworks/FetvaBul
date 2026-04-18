import { spawn } from 'child_process';

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed (${code}): ${command} ${args.join(' ')}`));
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  const syncBaseUrl = process.env.NEXT_PUBLIC_SYNC_BASE_URL || 'https://fetvabul.netlify.app';

  const buildEnv = {
    ...process.env,
    STATIC_EXPORT: '1',
    NEXT_PUBLIC_OFFLINE_BUILD: '1',
    NEXT_PUBLIC_ENABLE_DATA_SYNC: '1',
    NEXT_PUBLIC_SYNC_BASE_URL: syncBaseUrl,
  };

  console.log(`[mobile-android-sync] Using remote sync base URL: ${syncBaseUrl}`);

  await run('npm', ['run', 'build'], buildEnv);
  await run('npx', ['cap', 'sync', 'android']);
}

main().catch((error) => {
  console.error('[mobile-android-sync] Failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
