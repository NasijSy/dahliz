import { access, rm } from 'node:fs/promises';
import path from 'node:path';

const targetDir = path.resolve('.svelte-kit', 'cloudflare');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function removeWithRetry(p, attempts = 6) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await rm(p, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 150,
      });
      return true;
    } catch (error) {
      const code = error && typeof error === 'object' ? error.code : '';
      const retryable = code === 'EBUSY' || code === 'EPERM' || code === 'ENOTEMPTY';
      if (!retryable || i === attempts) {
        throw error;
      }
      await sleep(250 * i);
    }
  }

  return false;
}

async function main() {
  if (!(await exists(targetDir))) {
    console.log('Cloudflare build folder is already clean.');
    return;
  }

  await removeWithRetry(targetDir);

  if (await exists(targetDir)) {
    throw new Error(`Unable to clean ${targetDir}. It may still be locked by another process.`);
  }

  console.log('Cleaned .svelte-kit/cloudflare successfully.');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
