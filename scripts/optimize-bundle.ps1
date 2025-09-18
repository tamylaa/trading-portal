# Bundle Optimization Script
# Analyzes and suggests optimizations for large bundles

Write-Host "🔍 Bundle Size Analysis" -ForegroundColor Cyan
Write-Host "=" * 50

$buildDir = "build/static/js"
$jsFiles = Get-ChildItem $buildDir -Filter "*.js"

Write-Host "`n📊 Current Bundle Sizes:" -ForegroundColor Yellow
foreach ($file in $jsFiles) {
    $sizeKB = [math]::Round($file.Length / 1KB, 2)
    $sizeMB = [math]::Round($file.Length / 1MB, 2)
    
    if ($sizeMB -gt 1) {
        Write-Host "  $($file.Name): $sizeMB MB" -ForegroundColor Red
    } elseif ($sizeKB -gt 500) {
        Write-Host "  $($file.Name): $sizeKB KB" -ForegroundColor Yellow
    } else {
        Write-Host "  $($file.Name): $sizeKB KB" -ForegroundColor Green
    }
}

Write-Host "`n💡 Bundle Optimization Recommendations:" -ForegroundColor Cyan

$mainFile = $jsFiles | Where-Object { $_.Name -like "main.*" }
if ($mainFile -and $mainFile.Length -gt 1MB) {
    Write-Host "
🔧 LARGE BUNDLE DETECTED ($(([math]::Round($mainFile.Length / 1MB, 2))) MB)

Top recommendations to reduce bundle size:

1. 📦 LAZY LOADING:
   - PDF functionality (@react-pdf/renderer): ~800KB
   - Syntax highlighting (react-syntax-highlighter): ~300KB
   - Advanced UI components: ~200KB

2. 🌳 TREE SHAKING:
   - Import specific components instead of entire libraries
   - Example: import { ButtonSuccess } from '@tamyla/ui-components-react/Button'

3. 📂 CODE SPLITTING:
   - Move PDF generation to separate route chunk
   - Lazy load GuidePage and StoryDetailPage

4. 🗂️ DEPENDENCY AUDIT:
   - Consider lighter alternatives for syntax highlighting
   - Evaluate if all @tamyla/* features are needed

5. ⚡ IMMEDIATE WINS:
   - Enable React.lazy() for PDF components
   - Use dynamic imports for large features
   - Consider CDN for common libraries

Estimated savings: 1.5-2MB (70-75% reduction possible)
" -ForegroundColor White
} else {
    Write-Host "✅ Bundle size is reasonable" -ForegroundColor Green
}

Write-Host "`n🚀 To implement optimizations:" -ForegroundColor Cyan
Write-Host "1. Run: npm run analyze-bundle (if configured)" -ForegroundColor White
Write-Host "2. Implement lazy loading for PDF features" -ForegroundColor White
Write-Host "3. Enable code splitting in router" -ForegroundColor White
Write-Host "4. Consider moving large features to separate chunks" -ForegroundColor White
