#!/usr/bin/env node
// Move originals to archive and produce optimized PNG/JPEG fallbacks
import fs from 'fs';
import path from 'path';
let sharp;
try { const mod = await import('sharp'); sharp = mod.default ?? mod; } catch (err) { console.error('Install sharp first: npm i -D sharp'); process.exit(1); }

const cwd = process.cwd();
const archiveBase = path.join(cwd, 'archive/assets');
if (!fs.existsSync(archiveBase)) fs.mkdirSync(archiveBase, { recursive: true });

const ops = [
  {
    src: 'public/assets/logos/logo.png',
    archive: 'archive/assets/logos/logo.png',
    out: 'public/assets/logos/logo.png',
    transform: async (src, out) => {
      // create optimized PNG (smaller) at the same path
      await sharp(src).resize({ width: 600, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(out);
    }
  },
  {
    src: 'public/assets/logos/og-image.png',
    archive: 'archive/assets/logos/og-image.png',
    out: 'public/assets/logos/og-image.jpg',
    transform: async (src, out) => {
      // create optimized JPG for social meta
      await sharp(src).resize({ width: 1200, withoutEnlargement: true }).jpeg({ quality: 85 }).toFile(out);
    }
  },
  {
    src: 'public/assets/images/hero-bg.jpg',
    archive: 'archive/assets/images/hero-bg.jpg',
    out: 'public/assets/images/hero-bg.jpg',
    transform: async (src, out) => {
      // create optimized JPG for hero background
      await sharp(src).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(out);
    }
  }
];

for (const op of ops) {
  const src = path.join(cwd, op.src);
  if (!fs.existsSync(src)) {
    console.warn(`Source not found: ${op.src}`);
    continue;
  }
  const arc = path.join(cwd, op.archive);
  const arcDir = path.dirname(arc);
  if (!fs.existsSync(arcDir)) fs.mkdirSync(arcDir, { recursive: true });
  // move original to archive
  fs.copyFileSync(src, arc);
  console.log(`Archived ${op.src} -> ${op.archive}`);
  // produce optimized out file (read from archive copy to avoid read/write conflict)
  await op.transform(arc, path.join(cwd, op.out));
  console.log(`Optimized and wrote ${op.out}`);
}

console.log('Replace originals with optimized fallbacks complete');
