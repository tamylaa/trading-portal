// scripts/optimize-images.js
// Usage: npm run optimize:images (install sharp first: npm i -D sharp)
// This script optimizes a small set of known large images and writes WebP variants.

const fs = require('fs');
const path = require('path');
let sharp;
try {
  sharp = require('sharp');
} catch (err) {
  console.error('Missing dependency: sharp. Install with `npm i -D sharp` to run this script.');
  process.exit(1);
}

const targets = [
  'public/assets/logos/logo.png',
  'public/assets/logos/og-image.png',
  'public/assets/images/hero-bg.jpg'
];

async function optimize() {
  for (const rel of targets) {
    const file = path.join(process.cwd(), rel);
    if (!fs.existsSync(file)) {
      console.warn(`Not found: ${rel}`);
      continue;
    }

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

optimize().then(() => console.log('Done')).catch(err => console.error(err));
