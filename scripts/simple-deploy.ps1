# Simple Deployment Script
param(
    [string]$CommitMessage = "Fix: Resolve CSP conflicts for UI components in production"
)

Write-Host "Starting deployment..." -ForegroundColor Green

# Check if we're in git repo
if (!(Test-Path ".git")) {
    Write-Host "Error: Not in a git repository" -ForegroundColor Red
    exit 1
}

# Add all changes
Write-Host "Adding changes..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m $CommitMessage

# Push to main
Write-Host "Pushing to main branch..." -ForegroundColor Yellow
git push origin main

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Check GitHub Actions for build status: https://github.com/tamylaa/trading-portal/actions" -ForegroundColor Cyan
