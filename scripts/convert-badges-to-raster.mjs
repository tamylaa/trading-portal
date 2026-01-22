#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
let sharp;
try { const mod = await import('sharp'); sharp = mod.default ?? mod; } catch (err) { console.error('Install sharp: npm i -D sharp'); process.exit(1); }

const dir = path.join(process.cwd(), 'public/assets/badges');
const archive = path.join(process.cwd(), 'archive/assets/badges');
if (!fs.existsSync(dir)) {
  console.warn('Badges dir not found'); process.exit(0);
}
if (!fs.existsSync(archive)) fs.mkdirSync(archive, { recursive: true });

for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith('.svg')) continue;
  const src = path.join(dir, name);
  const base = name.replace(/\.svg$/, '');
  const outWebp = path.join(dir, `${base}.webp`);
  const outAvif = path.join(dir, `${base}.avif`);
  const outPng = path.join(dir, `${base}.png`);

  // archive original
  fs.copyFileSync(src, path.join(archive, name));
  // create raster outputs at 200px width
  await sharp(src).resize({ width: 200 }).webp({ quality: 80 }).toFile(outWebp);
  await sharp(src).resize({ width: 200 }).avif({ quality: 60 }).toFile(outAvif);
  await sharp(src).resize({ width: 200 }).png({ compressionLevel: 9 }).toFile(outPng);
  console.log(`Converted ${name} -> ${base}.webp, ${base}.avif, ${base}.png`);
  // remove original svg
  fs.unlinkSync(src);
}
console.log('Badges converted and originals archived');
