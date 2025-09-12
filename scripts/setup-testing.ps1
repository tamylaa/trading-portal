# 🛠️ Setup Testing Dependencies
# Quick installer for UI regression testing tools

Write-Host "🛠️  Setting up UI regression testing dependencies..." -ForegroundColor Cyan

# Check if package.json exists
if (!(Test-Path "package.json")) {
    Write-Error "❌ Not in a Node.js project directory!"
    exit 1
}

# Install testing dependencies
Write-Host "📦 Installing puppeteer for UI testing..." -ForegroundColor Yellow
try {
    npm install --save-dev puppeteer 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Puppeteer installed successfully" -ForegroundColor Green
    } else {
        Write-Warning "⚠️  Puppeteer installation may have issues, but continuing..."
    }
} catch {
    Write-Warning "⚠️  Could not install puppeteer: $_"
}

# Install serve for local testing
Write-Host "📦 Installing serve for local testing..." -ForegroundColor Yellow
try {
    npm install --save-dev serve 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Serve installed successfully" -ForegroundColor Green
    } else {
        Write-Warning "⚠️  Serve installation may have issues, but continuing..."
    }
} catch {
    Write-Warning "⚠️  Could not install serve: $_"
}

# Add test scripts to package.json if they don't exist
$packageJson = Get-Content "package.json" | ConvertFrom-Json

# Add regression test script
if (!$packageJson.scripts."test:ui") {
    Write-Host "📝 Adding UI regression test script to package.json..." -ForegroundColor Yellow
    
    # Add the script (this is a simplified approach)
    Write-Host "ℹ️  Please manually add this script to your package.json:" -ForegroundColor Cyan
    Write-Host '"test:ui": "node ui-regression-test.js"' -ForegroundColor White
}

Write-Host "`n✨ Setup complete! You can now run:" -ForegroundColor Green
Write-Host "   • .\deploy-production.ps1          (Full deployment pipeline)" -ForegroundColor White
Write-Host "   • .\deploy-production.ps1 -SkipTests   (Skip UI tests)" -ForegroundColor White
Write-Host "   • node ui-regression-test.js       (UI tests only)" -ForegroundColor White
