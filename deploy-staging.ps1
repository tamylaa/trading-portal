

# PowerShell script to sync staging-ui branch with main and build project
# 0. Check working tree status
$status = git status --porcelain
if ($status) {
    Write-Host "ERROR: You have uncommitted changes. Please commit or stash them before deploying."
    exit 1
}

# 1. Checkout main and pull latest
Write-Host "Checking out 'main' and pulling latest changes..."
git checkout main
git pull origin main

# 2. Checkout or create staging-ui branch
$branchExists = git branch --list staging-ui
if (-not $branchExists) {
    Write-Host "Creating 'staging-ui' branch from 'main'..."
    git checkout -b staging-ui
} else {
    Write-Host "Switching to 'staging-ui' branch..."
    git checkout staging-ui
}

# 3. Reset staging-ui to main (force update)
Write-Host "Resetting 'staging-ui' to match 'main'..."
git reset --hard main

# 4. Install dependencies and build in staging-ui
Write-Host "Running npm install in 'staging-ui'..."
npm install
Write-Host "Building app in 'staging-ui'..."
npm run build

# 5. Copy build output to branch root (for GitHub Pages)
Write-Host "Copying build output to branch root..."
Remove-Item -Recurse -Force .\* -Exclude ".git","deploy-staging.ps1","package.json","package-lock.json"
Copy-Item -Path "build/*" -Destination . -Recurse -Force

# 6. Commit and push changes to remote
Write-Host "Committing and pushing 'staging-ui' to remote..."
git add .
git commit -m "Deploy build output to staging-ui branch"
git push -f origin staging-ui

Write-Host "Staging branch now contains only build output at root."
Write-Host "Set GitHub Pages to serve from 'staging-ui' branch and update Cloudflare DNS for trading-portal-staging.tamyla.com."
