# Quick CSP Fix and Deploy
# Fixes Content Security Policy and redeploys

Write-Host "Fixing Content Security Policy for auth service and Brevo chat..." -ForegroundColor Cyan


# Ensure dependencies are installed
Write-Host "Installing dependencies (npm ci)..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "npm ci failed. Please check your package.json and lockfile." -ForegroundColor Red
    exit 1
}

# Run compilation checks before building
Write-Host "Running ESLint checks..." -ForegroundColor Yellow
npx eslint "src/**/*.{js,jsx,ts,tsx}" --fix --max-warnings 20
if ($LASTEXITCODE -ne 0) {
    Write-Host "ESLint errors detected. Please fix manually." -ForegroundColor Red
    exit 1
}

Write-Host "Running TypeScript compilation check..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "TypeScript compilation errors detected. Please fix manually." -ForegroundColor Red
    exit 1
}

# Rebuild with updated headers
Write-Host "Rebuilding with updated CSP..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful with updated CSP" -ForegroundColor Green
    
    # Quick commit and push
    Write-Host "Committing CSP fix..." -ForegroundColor Yellow
    git add .
    
    $commitMessage = "Fix: Update CSP to allow auth.tamyla.com and Brevo chat widget"
    git commit -m $commitMessage
    
    $push = Read-Host "Push CSP fix to production? (y/N)"
    if ($push -eq "y") {
        git push origin main
        Write-Host "CSP fix deployed! Auth service and Brevo chat should work now." -ForegroundColor Green
        Write-Host "You may need to purge Cloudflare cache for immediate effect." -ForegroundColor Yellow
    }
} else {
    Write-Host "Build failed. Please check the errors above." -ForegroundColor Red
}
