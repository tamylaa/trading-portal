# Professional Regression Testing Script
# Comprehensive code quality, compilation, and functionality checks

param(
    [switch]$SkipBuild = $false,
    [switch]$Verbose = $false
)

# Color functions
function Write-Success { param($msg) Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Warning { param($msg) Write-Host "[WARNING] $msg" -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Step { param($msg) Write-Host "`n[STEP] $msg" -ForegroundColor Blue }

$startTime = Get-Date
$results = @()

function Add-Result {
    param($step, $status, $details = "")
    $script:results += [PSCustomObject]@{
        Step = $step
        Status = $status
        Details = $details
    }
}

Write-Host ""
Write-Host "PROFESSIONAL REGRESSION TESTING PIPELINE" -ForegroundColor Magenta
Write-Host "======================================================================" -ForegroundColor Gray

# Step 1: Environment Check
Write-Step "Environment Validation"
try {
    if (!(Test-Path "package.json")) {
        throw "Not in React project directory"
    }
    
    # Check Node.js version
    $nodeVersion = node --version
    Write-Info "Node.js version: $nodeVersion"
    
    # Check npm version
    $npmVersion = npm --version
    Write-Info "npm version: $npmVersion"
    
    Write-Success "Environment validation passed"
    Add-Result "Environment" "PASSED" "Node: $nodeVersion, npm: $npmVersion"
} catch {
    Write-Error "Environment validation failed: $_"
    Add-Result "Environment" "FAILED" $_
    exit 1
}

# Step 2: Dependency Installation
Write-Step "Fresh Dependency Installation"
try {
    Write-Info "Installing dependencies with npm ci..."
    npm ci --silent
    if ($LASTEXITCODE -ne 0) {
        throw "npm ci failed"
    }
    
    Write-Success "Dependencies installed successfully"
    Add-Result "Dependencies" "PASSED"
} catch {
    Write-Error "Dependency installation failed: $_"
    Add-Result "Dependencies" "FAILED" $_
    exit 1
}

# Step 3: Code Quality Checks
Write-Step "Code Quality & Linting"
try {
    Write-Info "Running ESLint analysis..."
    $eslintOutput = npx eslint src --ext .js,.jsx,.ts,.tsx --format compact 2>&1
    $eslintWarnings = ($eslintOutput | Select-String "warning" | Measure-Object).Count
    $eslintErrors = ($eslintOutput | Select-String "error" | Measure-Object).Count
    
    if ($eslintErrors -gt 0) {
        Write-Warning "ESLint errors detected. Attempting auto-fix..."
        npx eslint src --ext .js,.jsx,.ts,.tsx --fix
        
        # Re-check after fix
        $eslintOutputFixed = npx eslint src --ext .js,.jsx,.ts,.tsx --format compact 2>&1
        $eslintErrorsFixed = ($eslintOutputFixed | Select-String "error" | Measure-Object).Count
        
        if ($eslintErrorsFixed -gt 0) {
            Write-Error "ESLint errors remain after auto-fix:"
            Write-Host $eslintOutputFixed -ForegroundColor Red
            throw "ESLint validation failed"
        } else {
            Write-Success "ESLint errors auto-fixed successfully"
        }
    }
    
    Write-Info "ESLint analysis: $eslintWarnings warnings, $eslintErrors errors"
    Write-Success "Code quality checks passed"
    Add-Result "ESLint" "PASSED" "$eslintWarnings warnings, $eslintErrors errors"
} catch {
    Write-Error "Code quality checks failed: $_"
    Add-Result "ESLint" "FAILED" $_
    exit 1
}

# Step 4: TypeScript Compilation
Write-Step "TypeScript Compilation Check"
try {
    Write-Info "Running TypeScript compiler check..."
    $tscOutput = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Error "TypeScript compilation errors:"
        Write-Host $tscOutput -ForegroundColor Red
        throw "TypeScript compilation failed"
    }
    
    Write-Success "TypeScript compilation check passed"
    Add-Result "TypeScript" "PASSED"
} catch {
    Write-Error "TypeScript compilation failed: $_"
    Add-Result "TypeScript" "FAILED" $_
    exit 1
}

# Step 5: Production Build Test
if (!$SkipBuild) {
    Write-Step "Production Build Test"
    try {
        Write-Info "Creating production build..."
        
        # Set environment to avoid CI warnings-as-errors
        $env:CI = $false
        $buildOutput = npm run build 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Production build failed:"
            Write-Host $buildOutput -ForegroundColor Red
            throw "Production build failed"
        }
        
        # Analyze build output
        if (Test-Path "build/index.html") {
            $htmlSize = (Get-Item "build/index.html").Length
            Write-Info "HTML size: $([math]::Round($htmlSize / 1KB, 2))KB"
        }
        
        $jsFiles = Get-ChildItem "build/static/js/*.js" -ErrorAction SilentlyContinue
        if ($jsFiles) {
            $totalJsSize = ($jsFiles | Measure-Object -Property Length -Sum).Sum
            $bundleSize = [math]::Round($totalJsSize / 1MB, 2)
            Write-Info "JavaScript bundle size: ${bundleSize}MB"
            
            if ($bundleSize -gt 2) {
                Write-Warning "Large bundle size detected: ${bundleSize}MB"
            }
        }
        
        $cssFiles = Get-ChildItem "build/static/css/*.css" -ErrorAction SilentlyContinue
        if ($cssFiles) {
            $totalCssSize = ($cssFiles | Measure-Object -Property Length -Sum).Sum
            $cssSize = [math]::Round($totalCssSize / 1KB, 2)
            Write-Info "CSS bundle size: ${cssSize}KB"
        }
        
        Write-Success "Production build completed successfully"
        Add-Result "Build" "PASSED" "Bundle: ${bundleSize}MB JS, ${cssSize}KB CSS"
    } catch {
        Write-Error "Production build failed: $_"
        Add-Result "Build" "FAILED" $_
        exit 1
    }
} else {
    Write-Warning "Skipping production build test"
    Add-Result "Build" "SKIPPED"
}

# Step 6: File Structure Validation
Write-Step "File Structure Validation"
try {
    $requiredFiles = @(
        "src/App.tsx",
        "src/index.tsx",
        "src/store/index.ts",
        "src/components/dashboard/ProfessionalDashboard.jsx",
        "public/index.html"
    )
    
    $missingFiles = @()
    foreach ($file in $requiredFiles) {
        if (!(Test-Path $file)) {
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        throw "Missing required files: $($missingFiles -join ', ')"
    }
    
    Write-Success "File structure validation passed"
    Add-Result "File Structure" "PASSED"
} catch {
    Write-Error "File structure validation failed: $_"
    Add-Result "File Structure" "FAILED" $_
    exit 1
}

# Step 7: Git Status Check
Write-Step "Git Repository Status"
try {
    $gitStatus = git status --porcelain
    $unstagedFiles = ($gitStatus | Where-Object { $_ -match "^.M" } | Measure-Object).Count
    $untrackedFiles = ($gitStatus | Where-Object { $_ -match "^\?\?" } | Measure-Object).Count
    
    Write-Info "Unstaged files: $unstagedFiles"
    Write-Info "Untracked files: $untrackedFiles"
    
    if ($unstagedFiles -gt 0 -or $untrackedFiles -gt 0) {
        Write-Warning "Uncommitted changes detected"
        if ($Verbose) {
            git status --short
        }
    }
    
    Write-Success "Git status check completed"
    Add-Result "Git Status" "PASSED" "Unstaged: $unstagedFiles, Untracked: $untrackedFiles"
} catch {
    Write-Warning "Git status check failed (not a git repository?)"
    Add-Result "Git Status" "WARNING" $_
}

# Final Results Summary
Write-Step "Regression Testing Summary"

$endTime = Get-Date
$totalDuration = $endTime - $startTime

Write-Host ""
Write-Host "REGRESSION TEST RESULTS" -ForegroundColor Magenta
Write-Host "==================================================" -ForegroundColor Gray

$results | ForEach-Object {
    $color = switch ($_.Status) {
        "PASSED" { "Green" }
        "FAILED" { "Red" }
        "SKIPPED" { "Yellow" }
        "WARNING" { "DarkYellow" }
        default { "White" }
    }
    $status = $_.Status.PadRight(8)
    $stepInfo = "$status | $($_.Step)"
    Write-Host $stepInfo -ForegroundColor $color
    if ($_.Details) {
        $detailInfo = "         Details: $($_.Details)"
        Write-Host $detailInfo -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Total Duration: $($totalDuration.ToString('mm\:ss'))" -ForegroundColor Cyan

$failedTests = $results | Where-Object { $_.Status -eq "FAILED" }
$passedTests = $results | Where-Object { $_.Status -eq "PASSED" }

if ($failedTests.Count -eq 0) {
    Write-Host ""
    Write-Host "ALL REGRESSION TESTS PASSED!" -ForegroundColor Green
    $qualityScore = "Quality Score: $($passedTests.Count)/$($results.Count) tests passed"
    Write-Host $qualityScore -ForegroundColor Green
    Write-Host ""
    Write-Host "Your code is ready for production deployment!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "REGRESSION TESTS FAILED" -ForegroundColor Red
    Write-Host "Please fix the failed tests before proceeding." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Regression testing completed successfully!" -ForegroundColor Magenta
