

# PowerShell script to automate staging deployment for trading-portal UI
# 0. Check current branch and working tree status
$currentBranch = git rev-parse --abbrev-ref HEAD
$status = git status --porcelain

if ($currentBranch -eq "staging-ui") {
    Write-Host "You are on 'staging-ui' branch. Switching to 'main'..."
    git checkout main
    $currentBranch = git rev-parse --abbrev-ref HEAD
}

if ($status) {
    Write-Host "ERROR: You have uncommitted changes. Please commit or stash them before deploying."
    exit 1
}

# 1. Install dependencies
Write-Host "Running npm install..."
npm install

# 2. Build staging app
Write-Host "Building staging app..."
npm run build:staging

# 3. Remove old staging branch if exists
$branchExists = git branch --list staging-ui
if ($branchExists) {
    git branch -D staging-ui
}
git checkout --orphan staging-ui

# 4. Remove all files except build and deploy script
Get-ChildItem -Exclude build,deploy-staging.ps1 | Remove-Item -Recurse -Force
Move-Item -Path build\* -Destination .
Remove-Item -Recurse -Force build

# 5. Commit and push
git add .
git commit -m "Deploy staging build"
git push -f origin staging-ui

Write-Host "Staging build pushed to 'staging-ui' branch."
Write-Host "Set GitHub Pages to serve from 'staging-ui' branch and update Cloudflare DNS for trading-portal-staging.tamyla.com."
