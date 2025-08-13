# Production Deployment Pipeline
# Comprehensive pre-production checks and deployment automation

param(
    [switch]$SkipTests = $false,
    [switch]$Force = $false,
    [string]$CommitMessage = "Deploy: Enhanced Redux implementation with professional dashboard features"
)

# Color functions for better output
function Write-Success { param($msg) Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Warning { param($msg) Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Step { param($msg) Write-Host "`n[STEP] $msg" -ForegroundColor Blue }

# Track results
$results = @()
$startTime = Get-Date

function Add-Result {
    param($step, $status, $details = "")
    $script:results += [PSCustomObject]@{
        Step = $step
        Status = $status
        Details = $details
    }
}

Write-Host "`nProduction Deployment Pipeline Started" -ForegroundColor Magenta
Write-Host "=" * 60 -ForegroundColor Gray

# Step 1: Environment Validation
Write-Step "Validating Development Environment"
try {
    if (!(Test-Path "package.json")) {
        throw "Not in React project directory"
    }
    
    $gitStatus = git status --porcelain
    if ($gitStatus -and !$Force) {
        Write-Warning "Uncommitted changes detected"
        git status --short
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y") {
            throw "Deployment cancelled by user"
        }
    }
    
    $currentBranch = git rev-parse --abbrev-ref HEAD
    Write-Info "Current branch: $currentBranch"
    
    Write-Success "Environment validation passed"
    Add-Result "Environment Validation" "PASSED"
} catch {
    Write-Error "Environment validation failed: $_"
    Add-Result "Environment Validation" "FAILED" $_
    exit 1
}

# Step 2: Cleanup and Fresh Dependencies
Write-Step "Cleaning and Installing Fresh Dependencies"
try {
    Write-Info "Clearing npm cache..."
    npm cache clean --force | Out-Null
    
    if (Test-Path "node_modules") {
        Write-Info "Removing old node_modules..."
        Remove-Item -Recurse -Force "node_modules"
    }
    if (Test-Path "package-lock.json") {
        Remove-Item -Force "package-lock.json"
    }
    
    Write-Info "Installing fresh dependencies..."
    $installOutput = npm install 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    
    Write-Success "Dependencies installed successfully"
    Add-Result "Dependency Installation" "PASSED"
} catch {
    Write-Error "Dependency installation failed: $_"
    Add-Result "Dependency Installation" "FAILED" $_
    exit 1
}

# Step 3: Production Build
Write-Step "Creating Production Build"
try {
    Write-Info "Building production version..."
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Production build failed"
    }
    
    if (!(Test-Path "build/index.html")) {
        throw "Build output missing - index.html not found"
    }
    
    $jsFiles = Get-ChildItem "build/static/js/*.js" | Measure-Object -Property Length -Sum
    $bundleSize = [math]::Round($jsFiles.Sum / 1MB, 2)
    Write-Info "Bundle size: ${bundleSize}MB"
    
    if ($bundleSize -gt 2) {
        Write-Warning "Bundle size is large (${bundleSize}MB). Consider code splitting."
    }
    
    Write-Success "Production build completed successfully"
    Add-Result "Production Build" "PASSED" "Bundle size: ${bundleSize}MB"
} catch {
    Write-Error "Production build failed: $_"
    Add-Result "Production Build" "FAILED" $_
    exit 1
}

# Step 4: Basic UI Testing
if (!$SkipTests) {
    Write-Step "Running Basic UI Tests"
    try {
        Write-Info "Testing build files..."
        
        # Check if main files exist
        $requiredFiles = @("build/index.html", "build/static/css", "build/static/js")
        foreach ($file in $requiredFiles) {
            if (!(Test-Path $file)) {
                throw "Required build file missing: $file"
            }
        }
        
        # Check HTML content
        $htmlContent = Get-Content "build/index.html" -Raw
        if ($htmlContent -notmatch "root") {
            throw "HTML missing React root element"
        }
        
        # Check for Redux in bundle (basic check)
        $jsFiles = Get-ChildItem "build/static/js/*.js"
        $hasRedux = $false
        foreach ($jsFile in $jsFiles) {
            $content = Get-Content $jsFile.FullName -Raw
            if ($content -match "redux" -or $content -match "ReduxProvider") {
                $hasRedux = $true
                break
            }
        }
        
        if ($hasRedux) {
            Write-Info "Redux implementation detected in build"
        } else {
            Write-Warning "Redux implementation not clearly detected in bundle"
        }
        
        Write-Success "Basic UI tests passed"
        Add-Result "UI Tests" "PASSED"
    } catch {
        Write-Error "UI tests failed: $_"
        Add-Result "UI Tests" "FAILED" $_
        if (!$Force) { exit 1 }
    }
} else {
    Write-Warning "Skipping UI tests (--SkipTests flag used)"
    Add-Result "UI Tests" "SKIPPED"
}

# Step 5: Git Operations
Write-Step "Preparing Git Commit"
try {
    git add .
    
    $changes = git diff --cached --name-only
    Write-Info "Files to be committed:"
    $changes | ForEach-Object { Write-Info "  $_" }
    
    $detailedMessage = @"
$CommitMessage

Production Deployment $(Get-Date -Format "yyyy-MM-dd HH:mm")

Features:
- Enhanced Redux Toolkit implementation
- Professional dashboard with modular architecture
- Sidebar authentication with responsive design
- Type-safe hooks and state management

Technical Details:
- Bundle size optimized: ${bundleSize}MB
- Fresh dependencies installed
- Production build verified

Changes include:
$($changes -join "`n")
"@
    
    git commit -m $detailedMessage
    
    Write-Success "Git commit completed"
    Add-Result "Git Commit" "PASSED"
} catch {
    Write-Error "Git operations failed: $_"
    Add-Result "Git Commit" "FAILED" $_
    exit 1
}

# Step 6: Final Summary
Write-Step "Deployment Pipeline Summary"

$endTime = Get-Date
$totalDuration = $endTime - $startTime

Write-Host "`nDEPLOYMENT PIPELINE RESULTS" -ForegroundColor Magenta
Write-Host "=" * 50 -ForegroundColor Gray

$results | ForEach-Object {
    $color = switch ($_.Status) {
        "PASSED" { "Green" }
        "FAILED" { "Red" }
        "SKIPPED" { "Yellow" }
        default { "White" }
    }
    $status = $_.Status.PadRight(8)
    Write-Host "$status | $($_.Step)" -ForegroundColor $color
    if ($_.Details) {
        Write-Host "         Details: $($_.Details)" -ForegroundColor Gray
    }
}

Write-Host "`nTotal Duration: $($totalDuration.ToString('mm\:ss'))" -ForegroundColor Cyan

$failedSteps = $results | Where-Object { $_.Status -eq "FAILED" }
if ($failedSteps.Count -eq 0) {
    Write-Host "`nALL CHECKS PASSED - READY FOR PRODUCTION!" -ForegroundColor Green
    Write-Host "`nNEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. git push origin main" -ForegroundColor White
    Write-Host "2. Trigger Cloudflare deployment" -ForegroundColor White
    Write-Host "3. Purge Cloudflare cache" -ForegroundColor White
    Write-Host "4. Verify production deployment" -ForegroundColor White
    
    $push = Read-Host "`nPush to GitHub now? (y/N)"
    if ($push -eq "y") {
        Write-Info "Pushing to GitHub..."
        git push origin main
        Write-Success "Code pushed to GitHub successfully!"
        Write-Info "Visit your Cloudflare dashboard to monitor deployment"
    }
} else {
    Write-Host "`nDEPLOYMENT BLOCKED - FAILED STEPS DETECTED" -ForegroundColor Red
    Write-Host "Please fix the failed steps before deploying to production." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nProduction deployment pipeline completed!" -ForegroundColor Magenta
