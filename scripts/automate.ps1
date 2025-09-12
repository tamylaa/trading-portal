# PowerShell script to automate lint, build, test, and launch routines for trading-portal

Write-Host "=== Trading Portal Automation Script ==="

# Step 1: Lint (skipped, no ESLint/Prettier config detected)
Write-Host "[1/4] Lint: Skipped (no ESLint/Prettier config found)"

# Step 2: Build
Write-Host "[2/4] Building the project..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed. Exiting."
    exit 1
}

# Step 3: Test
Write-Host "[3/4] Running tests..."
npm test -- --watchAll=false
if ($LASTEXITCODE -ne 0) {
    Write-Error "Tests failed. Exiting."
    exit 1
}

# Step 4: Launch App
Write-Host "[4/4] Launching the app..."
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'npm start'

Write-Host "=== Automation Complete: Success! ==="
