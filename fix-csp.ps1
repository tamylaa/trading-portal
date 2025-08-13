# Quick CSP Fix and Deploy
# Fixes Content Security Policy and redeploys

Write-Host "🔧 Fixing Content Security Policy for auth service and Brevo chat..." -ForegroundColor Cyan

# Rebuild with updated headers
Write-Host "📦 Rebuilding with updated CSP..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful with updated CSP" -ForegroundColor Green
    
    # Quick commit and push
    Write-Host "📤 Committing CSP fix..." -ForegroundColor Yellow
    git add .
    
    $commitMessage = "Fix: Update CSP to allow auth.tamyla.com and Brevo chat widget"
    git commit -m $commitMessage
    
    $push = Read-Host "Push CSP fix to production? (y/N)"
    if ($push -eq "y") {
        git push origin main
        Write-Host "🚀 CSP fix deployed! Auth service and Brevo chat should work now." -ForegroundColor Green
        Write-Host "💡 You may need to purge Cloudflare cache for immediate effect." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
}
