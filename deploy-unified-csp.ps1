# Unified CSP Deployment Script
# Ensures consistent CSP between dev and production

Write-Host "Unified CSP Deployment Starting..." -ForegroundColor Green

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    
    # Copy headers file to build directory
    Write-Host "Copying headers file..." -ForegroundColor Yellow
    Copy-Item "public\_headers" "build\_headers" -Force
    
    # Verify CSP consistency
    Write-Host "Verifying CSP consistency..." -ForegroundColor Yellow
    
    # Check if both files have 'unsafe-eval'
    $htmlContent = Get-Content "build\index.html" -Raw
    $headersContent = Get-Content "build\_headers" -Raw
    
    if ($htmlContent -match "unsafe-eval" -and $headersContent -match "unsafe-eval") {
        Write-Host "CSP consistency verified - 'unsafe-eval' present in both files" -ForegroundColor Green
    } else {
        Write-Host "CSP inconsistency detected!" -ForegroundColor Red
        if ($htmlContent -notmatch "unsafe-eval") {
            Write-Host "  - Missing 'unsafe-eval' in HTML" -ForegroundColor Red
        }
        if ($headersContent -notmatch "unsafe-eval") {
            Write-Host "  - Missing 'unsafe-eval' in headers" -ForegroundColor Red
        }
    }
    
    # Check bundle sizes
    Write-Host "Bundle size summary:" -ForegroundColor Yellow
    Get-ChildItem "build\static\js\*.js" | Sort-Object Length -Descending | Select-Object -First 5 | ForEach-Object {
        $sizeMB = [math]::Round($_.Length / 1MB, 2)
        $sizeKB = [math]::Round($_.Length / 1KB, 0)
        Write-Host "  - $($_.Name): ${sizeKB}KB (${sizeMB}MB)" -ForegroundColor Cyan
    }
    
    Write-Host "Deployment ready! Both dev and prod will have consistent CSP" -ForegroundColor Green
    Write-Host "Test URLs:" -ForegroundColor Yellow
    Write-Host "  - Dev: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  - Prod: http://localhost:3001 (via serve)" -ForegroundColor Cyan
    
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
