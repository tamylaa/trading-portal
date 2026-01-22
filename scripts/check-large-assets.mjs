#!/usr/bin/env node
/* Check for large assets in public/assets and build directories.
   Usage: npm run check:assets
*/
import fs from 'fs';
import path from 'path';

const thresholdKB = 150; // files larger than this will fail the check
const dirs = [
  'public/assets',
  'build/assets'
];

let found = [];

function collectFiles(dir) {
  const entries = [];
  try {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        entries.push(...collectFiles(full));
      } else {
        entries.push({ path: full, sizeKB: Math.round(stat.size / 1024) });
      }
    }
  } catch (err) {
    // ignore missing dirs
  }
  return entries;
}

for (const dir of dirs) {
  const files = collectFiles(dir);
  for (const f of files) {
    if (f.sizeKB > thresholdKB) {
      found.push(f);
    }
  }
}

if (found.length > 0) {
  console.error(`Found ${found.length} assets larger than ${thresholdKB}KB:`);
  for (const f of found) {
    console.error(` - ${f.path} (${f.sizeKB} KB)`);
  }
  process.exit(1);
} else {
  console.log(`No assets larger than ${thresholdKB}KB found in ${dirs.join(', ')}`);
  process.exit(0);
}
