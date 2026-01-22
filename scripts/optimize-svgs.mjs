#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';

const dir = path.join(process.cwd(), 'public/assets/badges');
if (!fs.existsSync(dir)) {
  console.warn('Badges directory not found:', dir);
  process.exit(0);
}

for (const name of fs.readdirSync(dir)) {
  if (!name.endsWith('.svg')) continue;
  const file = path.join(dir, name);
  const src = fs.readFileSync(file, 'utf8');
  const res = optimize(src, { path: file, multipass: true });
  if (res.error) {
    console.error('SVGO failed for', name, res.error);
    continue;
  }
  fs.writeFileSync(file, res.data, 'utf8');
  console.log(`Optimized ${name}`);
}
console.log('SVG optimization complete');
