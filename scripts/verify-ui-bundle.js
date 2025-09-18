#!/usr/bin/env node

/**
 * Bundle verification script
 * Checks if @tamyla/ui-components-react is properly included in the build
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build', 'static', 'js');

console.log('🔍 Checking bundle for @tamyla/ui-components-react...');

if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run npm run build first.');
  process.exit(1);
}

const jsFiles = fs.readdirSync(buildDir).filter(file => file.endsWith('.js'));
console.log(`📁 Found ${jsFiles.length} JS files:`, jsFiles);

let foundUIComponents = false;
let foundButtonSuccess = false;

for (const file of jsFiles) {
  const filePath = path.join(buildDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for various indicators of the UI components
  const indicators = [
    'tamyla',
    'ui-components',
    'ButtonSuccess',
    'TamylaThemeProvider',
    'ui-components-react'
  ];
  
  const found = indicators.filter(indicator => 
    content.toLowerCase().includes(indicator.toLowerCase())
  );
  
  if (found.length > 0) {
    console.log(`✅ File ${file}: Found indicators: ${found.join(', ')}`);
    foundUIComponents = true;
    
    if (found.some(f => f.toLowerCase().includes('buttonsuccess'))) {
      foundButtonSuccess = true;
    }
  }
}

console.log('\n📊 Bundle Analysis Results:');
console.log(`UI Components found: ${foundUIComponents ? '✅' : '❌'}`);
console.log(`ButtonSuccess found: ${foundButtonSuccess ? '✅' : '❌'}`);

if (!foundUIComponents) {
  console.log('\n🔧 Possible issues:');
  console.log('- @tamyla/ui-components-react might not be installed');
  console.log('- Tree shaking might be removing unused imports');
  console.log('- Dynamic imports might be in separate chunks');
  console.log('- Check if the package is in dependencies (not devDependencies)');
}

console.log('\n📝 To debug further:');
console.log('1. Check node_modules/@tamyla/ui-components-react exists');
console.log('2. Verify package.json dependencies');
console.log('3. Check if components are actually imported in the code');
