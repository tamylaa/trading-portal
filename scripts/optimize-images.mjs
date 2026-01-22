#!/usr/bin/env node
/* ESM image optimizer
   Usage: npm run optimize:images
   Requires: sharp (dev dependency). Install: npm i -D sharp
*/
import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';

let sharp;
try {
  const mod = await import('sharp');
  sharp = mod.default ?? mod;
} catch (err) {
  console.error('Missing dependency: sharp. Install with `npm i -D sharp` to run this script.');
  process.exit(1);
}

const targets = [
  'public/assets/logos/logo.png',
  'public/assets/logos/og-image.png',
  'public/assets/images/hero-bg.jpg'
];

async function backup(file) {
  const bak = `${file}.bak`;
  try {
    if (!fs.existsSync(bak)) {
      await fsp.copyFile(file, bak);
      console.log(`Backup created: ${path.basename(bak)}`);
    }
  } catch (err) {
    console.warn(`Could not create backup for ${file}: ${err.message}`);
  }
}

async function optimize() {
  for (const rel of targets) {
    const file = path.join(process.cwd(), rel);
    if (!fs.existsSync(file)) {
      console.warn(`Not found: ${rel}`);
      continue;
    }

    await backup(file);

    const outWebp = file.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    const outAvif = file.replace(/\.(png|jpg|jpeg)$/i, '.avif');

    try {
      await sharp(file)
        .resize({ width: 2000, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outWebp);

      await sharp(file)
        .resize({ width: 2000, withoutEnlargement: true })
        .avif({ quality: 60 })
        .toFile(outAvif);

      console.log(`Optimized ${rel} -> ${path.basename(outWebp)}, ${path.basename(outAvif)}`);
    } catch (err) {
      console.error(`Failed to optimize ${rel}:`, err.message || err);
    }
  }
}

optimize()
  .then(() => console.log('Image optimization complete'))
  .catch(err => {
    console.error('Image optimization failed:', err);
    process.exit(1);
  });
