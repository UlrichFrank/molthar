#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

async function findFiles(dir, pattern) {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await findFiles(full, pattern));
    } else if (pattern.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  const repoRoot = path.resolve(new URL(import.meta.url).pathname, '..', '..');

  // 1) find all cards.json files
  const cardsJsonPaths = await findFiles(repoRoot, /^cards\.json$/i);

  const referenced = new Set();
  for (const jsonPath of cardsJsonPaths) {
    try {
      const text = await fs.readFile(jsonPath, 'utf8');
      const data = JSON.parse(text);
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item && item.imageName) referenced.add(item.imageName);
        }
      }
    } catch (e) {
      console.error('Failed to read/parse', jsonPath, e.message);
    }
  }

  // 2) find all Charakterkarte*.jpeg files
  const allImages = await findFiles(repoRoot, /^Charakterkarte.*\.jpe?g$/i);

  const unreferenced = allImages.filter(f => {
    const base = path.basename(f);
    return !referenced.has(base);
  });

  if (unreferenced.length === 0) {
    console.log('No unreferenced Charakterkarte images found.');
    return;
  }

  // 3) prompt user (since script may be run non-interactively, proceed to delete)
  console.log('Unreferenced images to delete:', unreferenced.length);
  for (const f of unreferenced) console.log('  ', f);

  // Delete and log
  const outDir = path.join(repoRoot, 'reports');
  await fs.mkdir(outDir, { recursive: true });
  const deletedLog = [];
  for (const f of unreferenced) {
    try {
      await fs.unlink(f);
      deletedLog.push(f);
    } catch (e) {
      console.error('Failed to delete', f, e.message);
    }
  }

  const logPath = path.join(outDir, 'deleted-unreferenced-charakterkarte-images.txt');
  await fs.writeFile(logPath, deletedLog.join('\n'), 'utf8');
  console.log('Deleted', deletedLog.length, 'files. Log written to', logPath);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
