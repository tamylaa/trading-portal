# Bundle Optimization Analysis
Write-Host "Bundle Size Analysis" -ForegroundColor Cyan
Write-Host "=" * 50

$buildDir = "build/static/js"
$jsFiles = Get-ChildItem $buildDir -Filter "*.js"

Write-Host "`nCurrent Bundle Sizes:" -ForegroundColor Yellow
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

$mainFile = $jsFiles | Where-Object { $_.Name -like "main.*" }
if ($mainFile -and $mainFile.Length -gt 1MB) {
    $sizeMB = [math]::Round($mainFile.Length / 1MB, 2)
    Write-Host "`nLARGE BUNDLE DETECTED: $sizeMB MB" -ForegroundColor Red
    
    Write-Host "`nBundle Optimization Recommendations:" -ForegroundColor Cyan
    Write-Host "1. LAZY LOADING:" -ForegroundColor White
    Write-Host "   - PDF functionality (react-pdf): ~800KB" -ForegroundColor Gray
    Write-Host "   - Syntax highlighting: ~300KB" -ForegroundColor Gray
    
    Write-Host "`n2. TREE SHAKING:" -ForegroundColor White
    Write-Host "   - Import specific components only" -ForegroundColor Gray
    
    Write-Host "`n3. CODE SPLITTING:" -ForegroundColor White
    Write-Host "   - Move large features to separate chunks" -ForegroundColor Gray
    
    Write-Host "`n4. ESTIMATED SAVINGS: 1.5-2MB possible" -ForegroundColor Green
} else {
    Write-Host "`nBundle size is reasonable" -ForegroundColor Green
}
