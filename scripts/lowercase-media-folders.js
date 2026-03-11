import { readdirSync, renameSync, existsSync } from 'fs';
import { join } from 'path';

const mediaDirs = [
  new URL('../static/media/profiles', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'),
];

function renameFolderAndContents(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const oldPath = join(dir, entry.name);
    const newName = entry.name.toLowerCase();
    const newPath = join(dir, newName);

    if (entry.isDirectory()) {
      // Recurse first (bottom-up)
      renameFolderAndContents(oldPath);

      if (entry.name !== newName) {
        // On Windows, rename is case-insensitive so we need a temp name
        const tmpPath = join(dir, `__tmp__${newName}`);
        renameSync(oldPath, tmpPath);
        renameSync(tmpPath, newPath);
        console.log(`Renamed folder: ${entry.name} → ${newName}`);
      }
    } else if (entry.isFile()) {
      if (entry.name !== newName) {
        const tmpPath = join(dir, `__tmp__${newName}`);
        renameSync(oldPath, tmpPath);
        renameSync(tmpPath, newPath);
        console.log(`Renamed file: ${entry.name} → ${newName}`);
      }
    }
  }
}

for (const dir of mediaDirs) {
  if (!existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    continue;
  }
  console.log(`Processing: ${dir}`);
  renameFolderAndContents(dir);
}

console.log('\nDone.');