import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const profilesDir = new URL('../src/lib/data/profiles', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

const files = readdirSync(profilesDir).filter(f => f.endsWith('.json'));

let changed = 0;

for (const file of files) {
  const filePath = join(profilesDir, file);
  const raw = readFileSync(filePath, 'utf-8');
  const json = JSON.parse(raw);

  let modified = false;

  for (const locale of Object.keys(json)) {
    const profile = json[locale];

    if (profile.username && profile.username !== profile.username.toLowerCase()) {
      const oldUsername = profile.username;
      profile.username = profile.username.toLowerCase();

      // Update imagePath
      if (profile.imagePath) {
        profile.imagePath = profile.imagePath.replace(
          `/media/profiles/${oldUsername}/`,
          `/media/profiles/${profile.username}/`
        );
      }

      // Update platformLinks (no username references typically, but just in case)
      // Update cases mediaPaths
      if (Array.isArray(profile.cases)) {
        for (const c of profile.cases) {
          for (const arr of [c.source, c.analysis]) {
            if (!Array.isArray(arr)) continue;
            for (const item of arr) {
              if (item.mediaPath) {
                item.mediaPath = item.mediaPath.replace(
                  `/media/profiles/${oldUsername}/`,
                  `/media/profiles/${profile.username}/`
                );
              }
            }
          }
        }
      }

      console.log(`[${file}] username: ${oldUsername} → ${profile.username}`);
      modified = true;
    }
  }

  if (modified) {
    writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf-8');
    changed++;
  }
}

console.log(`\nDone. Modified ${changed} file(s).`);