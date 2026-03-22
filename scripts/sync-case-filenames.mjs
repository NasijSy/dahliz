import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CASES_DIR = path.resolve('src/lib/data/cases');
const CASES_MEDIA_DIR = path.resolve('static/media/cases');

function getCaseSlug(data) {
  if (data && typeof data === 'object') {
    if (typeof data.slug === 'string' && data.slug.length > 0) {
      return data.slug;
    }

    if (data.ar && typeof data.ar.slug === 'string' && data.ar.slug.length > 0) {
      return data.ar.slug;
    }

    for (const localeData of Object.values(data)) {
      if (localeData && typeof localeData.slug === 'string' && localeData.slug.length > 0) {
        return localeData.slug;
      }
    }
  }

  return null;
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

function replaceCaseMediaPaths(node, nextSlug, oldSlugs) {
  if (!node || typeof node !== 'object') {
    return false;
  }

  let changed = false;

  if (Array.isArray(node)) {
    for (const item of node) {
      changed = replaceCaseMediaPaths(item, nextSlug, oldSlugs) || changed;
    }
    return changed;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'mediaPath' && typeof value === 'string') {
      const match = value.match(/^\/media\/cases\/([^/]+)(\/.*)?$/);
      if (match) {
        const currentSlug = match[1];
        const suffix = match[2] ?? '';
        if (currentSlug !== nextSlug) {
          oldSlugs.add(currentSlug);
          node[key] = `/media/cases/${nextSlug}${suffix}`;
          changed = true;
        }
      }
      continue;
    }

    changed = replaceCaseMediaPaths(value, nextSlug, oldSlugs) || changed;
  }

  return changed;
}

function addPlannedMediaMove(plannedMediaMoves, oldSlug, newSlug) {
  if (!oldSlug || oldSlug === newSlug) {
    return;
  }

  const existingTarget = plannedMediaMoves.get(oldSlug);
  if (existingTarget && existingTarget !== newSlug) {
    throw new Error(
      `Conflicting media migration targets for slug ${oldSlug}: ${existingTarget} and ${newSlug}`,
    );
  }

  plannedMediaMoves.set(oldSlug, newSlug);
}

async function moveDirectoryContents(fromDir, toDir) {
  await mkdir(toDir, { recursive: true });
  const entries = await readdir(fromDir, { withFileTypes: true });

  for (const entry of entries) {
    const fromPath = path.join(fromDir, entry.name);
    const toPath = path.join(toDir, entry.name);

    if (entry.isDirectory()) {
      await moveDirectoryContents(fromPath, toPath);
      await rm(fromPath, { recursive: true, force: true });
      continue;
    }

    if (await pathExists(toPath)) {
      throw new Error(`Cannot migrate media file because destination already exists: ${toPath}`);
    }

    await rename(fromPath, toPath);
  }
}

async function migrateMediaDirectory(oldSlug, newSlug) {
  if (!oldSlug || oldSlug === newSlug) {
    return;
  }

  const fromDir = path.join(CASES_MEDIA_DIR, oldSlug);
  const toDir = path.join(CASES_MEDIA_DIR, newSlug);

  if (!(await pathExists(fromDir))) {
    return;
  }

  if (!(await pathExists(toDir))) {
    await rename(fromDir, toDir);
    console.log(`Moved media folder ${oldSlug} -> ${newSlug}`);
    return;
  }

  await moveDirectoryContents(fromDir, toDir);
  await rm(fromDir, { recursive: true, force: true });
  console.log(`Merged media folder ${oldSlug} into ${newSlug}`);
}

async function syncCaseFileNames() {
  const names = await readdir(CASES_DIR);
  const jsonFiles = names.filter((name) => name.endsWith('.json'));

  const plannedRenames = [];
  const plannedMediaMoves = new Map();
  const currentNames = new Set(jsonFiles);

  for (const fileName of jsonFiles) {
    const absolutePath = path.join(CASES_DIR, fileName);
    const raw = await readFile(absolutePath, 'utf8');
    const parsed = JSON.parse(raw);
    const slug = getCaseSlug(parsed);

    if (!slug) {
      continue;
    }

    const currentSlug = fileName.replace(/\.json$/, '');
    const oldMediaSlugs = new Set();
    const mediaPathsChanged = replaceCaseMediaPaths(parsed, slug, oldMediaSlugs);
    if (mediaPathsChanged) {
      await writeFile(absolutePath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
      console.log(`Updated mediaPath entries in ${fileName}`);
    }

    addPlannedMediaMove(plannedMediaMoves, currentSlug, slug);
    for (const oldSlug of oldMediaSlugs) {
      addPlannedMediaMove(plannedMediaMoves, oldSlug, slug);
    }

    const expectedName = `${slug}.json`;
    if (fileName !== expectedName) {
      plannedRenames.push({ from: fileName, to: expectedName });
    }
  }

  const destinationCounts = new Map();
  for (const { to } of plannedRenames) {
    destinationCounts.set(to, (destinationCounts.get(to) ?? 0) + 1);
  }

  const duplicateDestinations = [...destinationCounts.entries()].filter(([, count]) => count > 1);
  if (duplicateDestinations.length > 0) {
    const duplicates = duplicateDestinations.map(([name]) => name).join(', ');
    throw new Error(`Multiple case files resolve to the same slug filename: ${duplicates}`);
  }

  for (const { from, to } of plannedRenames) {
    if (currentNames.has(to) && !plannedRenames.some((entry) => entry.from === to)) {
      throw new Error(`Cannot rename ${from} to ${to} because ${to} already exists.`);
    }
  }

  if (plannedRenames.length === 0 && plannedMediaMoves.size === 0) {
    console.log('Case filenames and media paths are already in sync.');
    return;
  }

  for (const { from, to } of plannedRenames) {
    const fromPath = path.join(CASES_DIR, from);
    const toPath = path.join(CASES_DIR, to);
    await rename(fromPath, toPath);
    console.log(`Renamed ${from} -> ${to}`);
  }

  for (const [oldSlug, newSlug] of plannedMediaMoves) {
    await migrateMediaDirectory(oldSlug, newSlug);
  }
}

syncCaseFileNames().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
