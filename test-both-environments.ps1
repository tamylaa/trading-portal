# Test Both Development and Production Environments
# Verifies CSP consistency and component functionality

Write-Host "=== TESTING BOTH ENVIRONMENTS ===" -ForegroundColor Cyan
Write-Host ""

# Check if servers are running
Write-Host "1. Checking server status..." -ForegroundColor Yellow
try {
    $devResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "  ✓ Development server (port 3000): RUNNING" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Development server (port 3000): NOT RUNNING" -ForegroundColor Red
}

try {
    $prodResponse = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -UseBasicParsing
    Write-Host "  ✓ Production server (port 3001): RUNNING" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Production server (port 3001): NOT RUNNING" -ForegroundColor Red
}

Write-Host ""

# Check CSP in development (from public/index.html)
Write-Host "2. Checking CSP configurations..." -ForegroundColor Yellow
$publicHtml = Get-Content "public\index.html" -Raw
if ($publicHtml -match "Content-Security-Policy") {
    if ($publicHtml -match "unsafe-eval") {
        Write-Host "  ✓ Development CSP: Has 'unsafe-eval'" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Development CSP: Missing 'unsafe-eval'" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠ Development CSP: Not found in HTML (may be using headers only)" -ForegroundColor Yellow
}

# Check CSP in production build
$buildHtml = Get-Content "build\index.html" -Raw
if ($buildHtml -match "Content-Security-Policy") {
    if ($buildHtml -match "unsafe-eval") {
        Write-Host "  ✓ Production CSP: Has 'unsafe-eval'" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Production CSP: Missing 'unsafe-eval'" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ Production CSP: Not found in HTML" -ForegroundColor Red
}

# Check headers file
if (Test-Path "build\_headers") {
    $headers = Get-Content "build\_headers" -Raw
    if ($headers -match "unsafe-eval") {
        Write-Host "  ✓ Production Headers: Has 'unsafe-eval'" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Production Headers: Missing 'unsafe-eval'" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ Production Headers: _headers file not found" -ForegroundColor Red
}

Write-Host ""

# Check bundle sizes
Write-Host "3. Checking bundle optimization..." -ForegroundColor Yellow
if (Test-Path "build\static\js") {
    $jsFiles = Get-ChildItem "build\static\js\*.js" | Sort-Object Length -Descending | Select-Object -First 3
    foreach ($file in $jsFiles) {
        $sizeKB = [math]::Round($file.Length / 1KB, 0)
        $sizeMB = [math]::Round($file.Length / 1MB, 2)
        Write-Host "  • $($file.Name): ${sizeKB}KB (${sizeMB}MB)" -ForegroundColor Cyan
    }
    
    $mainBundle = $jsFiles | Where-Object { $_.Name -like "main.*" } | Select-Object -First 1
    if ($mainBundle -and $mainBundle.Length -lt 1MB) {
        Write-Host "  ✓ Main bundle size: OPTIMIZED (< 1MB)" -ForegroundColor Green
    } elseif ($mainBundle) {
        $sizeMB = [math]::Round($mainBundle.Length / 1MB, 2)
        Write-Host "  ⚠ Main bundle size: ${sizeMB}MB (could be optimized further)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✗ Build files not found" -ForegroundColor Red
}

Write-Host ""

# Summary
Write-Host "=== TEST SUMMARY ===" -ForegroundColor Cyan
Write-Host "Development URL: http://localhost:3000" -ForegroundColor White
Write-Host "Production URL:  http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open both URLs in your browser" -ForegroundColor White
Write-Host "2. Check browser console for CSP violations" -ForegroundColor White
Write-Host "3. Test ButtonSuccess component on home page" -ForegroundColor White
Write-Host "4. Verify UI components load without errors" -ForegroundColor White
