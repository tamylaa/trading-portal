# test-fixes.ps1
# Automates testing fixes for ESLint and Header errors in trading-portal

# Configuration
$projectDir = Get-Location
$nodeTypesVersion = "22.14.1"
$diagnosticsFile = "src/diagnostics/backgroundDiagnostics.ts"
$logFile = "test-fixes-log.txt"

# Initialize log
"Testing fixes for trading-portal at $(Get-Date)" | Out-File -FilePath $logFile -Encoding utf8

# Step 1: Verify npm
Write-Host "Verifying npm..."
$npmVersion = npm --version 2>&1
if ($LASTEXITCODE -eq 0) {
    "npm version: $npmVersion" | Out-File -FilePath $logFile -Append
} else {
    "npm not found or corrupted. Reinstall Node.js." | Out-File -FilePath $logFile -Append
    exit 1
}

# Step 2: Update @types/node
Write-Host "Updating @types/node to $nodeTypesVersion..."
npm install --save-dev "@types/node@$nodeTypesVersion" --loglevel=error 2>&1 | Out-File -FilePath $logFile -Append
if ($LASTEXITCODE -eq 0) {
    "Successfully updated @types/node" | Out-File -FilePath $logFile -Append
} else {
    "Failed to update @types/node" | Out-File -FilePath $logFile -Append
}

# Step 3: Fix ESLint warning in backgroundDiagnostics.ts
Write-Host "Fixing ESLint warning in $diagnosticsFile..."
$diagnosticsContent = Get-Content -Path $diagnosticsFile -Raw
$newDiagnosticsContent = $diagnosticsContent -replace `
    'const isMobile = window\.innerWidth <= 768;\s*', ''
Set-Content -Path $diagnosticsFile -Value $newDiagnosticsContent -Encoding utf8
"Fixed ESLint warning in $diagnosticsFile" | Out-File -FilePath $logFile -Append

# Step 4: Run TypeScript compilation
Write-Host "Running TypeScript compilation..."
npx tsc --noEmit 2>&1 | Out-File -FilePath $logFile -Append
if ($LASTEXITCODE -eq 0) {
    "TypeScript compilation succeeded" | Out-File -FilePath $logFile -Append
} else {
    "TypeScript compilation failed. Check $logFile for errors." | Out-File -FilePath $logFile -Append
}

# Step 5: Start dev server
Write-Host "Starting dev server..."
$job = Start-Job -ScriptBlock {
    npm start | Out-File -FilePath "dev-server-output.txt" -Encoding utf8
} -ErrorAction SilentlyContinue
Start-Sleep -Seconds 15
Stop-Job -Job $job
"Dev server output logged to dev-server-output.txt" | Out-File -FilePath $logFile -Append
if (Test-Path "dev-server-error.txt") {
    Get-Content -Path "dev-server-error.txt" | Out-File -FilePath $logFile -Append
}

# Step 6: Check for errors
Write-Host "Checking for errors..."
$devOutputContent = Get-Content -Path "dev-server-output.txt" -Raw -ErrorAction SilentlyContinue
if ($devOutputContent -match "Class constructor Header cannot be invoked without 'new'" -or `
    $devOutputContent -match "Element type is invalid") {
    "Header errors detected. Share src/components/Header.tsx and src/components/MainLayout.tsx." | Out-File -FilePath $logFile -Append
}
if ($devOutputContent -match "Missing element: header") {
    "Diagnostics reported missing header. Likely due to Header issues." | Out-File -FilePath $logFile -Append
}

Write-Host "Testing complete. Check $logFile and dev-server-output.txt."
"Testing complete at $(Get-Date)" | Out-File -FilePath $logFile -Append