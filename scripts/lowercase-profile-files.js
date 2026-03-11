import { readdirSync, renameSync } from 'fs';
import { join } from 'path';

const profilesDir = new URL('../src/lib/data/profiles', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

const files = readdirSync(profilesDir).filter(f => f.endsWith('.json'));

let changed = 0;

for (const file of files) {
  const newName = file.toLowerCase();
  if (file === newName) continue;

  const oldPath = join(profilesDir, file);
  const tmpPath = join(profilesDir, `__tmp__${newName}`);
  const newPath = join(profilesDir, newName);

  // Two-step rename to handle Windows case-insensitive filesystem
  renameSync(oldPath, tmpPath);
  renameSync(tmpPath, newPath);

  console.log(`Renamed: ${file} → ${newName}`);
  changed++;
}

console.log(`\nDone. Renamed ${changed} file(s).`);