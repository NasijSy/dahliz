import { spawn } from 'node:child_process';
import path from 'node:path';

function runNodeScript(relativeScriptPath) {
  const scriptPath = path.resolve(relativeScriptPath);

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Script failed: ${relativeScriptPath} (exit code ${code ?? 'unknown'})`));
    });
  });
}

async function main() {
  await runNodeScript('scripts/clean-cloudflare-artifacts.mjs');
  await runNodeScript('scripts/sync-case-filenames.mjs');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
