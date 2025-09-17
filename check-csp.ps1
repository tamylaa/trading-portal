# CSP Eval Issue Diagnostic Script
# Enhanced version with improved variable scoping and diagnostics

Write-Host "CSP Eval Issue Diagnostic" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$startTime = Get-Date
$filesScanned = 0

# Initialize separate tracking variables
$mainPackageEvalFound = $false
$peerDependencyEvalFound = $false
$evalFound = $false

# Check package for eval usage
Write-Host "`n[INFO] Checking @tamyla/ui-components-react package..." -ForegroundColor Yellow

$packagePath = Join-Path $PSScriptRoot "node_modules\@tamyla\ui-components-react"
if (Test-Path $packagePath) {
    Write-Host "[OK] Package found" -ForegroundColor Green

    # Report package version
    $packageJson = Join-Path $packagePath "package.json"
    if (Test-Path $packageJson) {
        $pkg = Get-Content $packageJson | ConvertFrom-Json
        Write-Host "[VERSION] $($pkg.version)" -ForegroundColor Gray
    }

    # Check for eval in dist files
    $distPath = Join-Path $packagePath "dist"
    if (Test-Path $distPath) {
        $jsFiles = Get-ChildItem $distPath -Recurse -Filter "*.js" -ErrorAction SilentlyContinue
        Write-Host "[SCAN] Scanning $($jsFiles.Count) JavaScript files for eval usage..." -ForegroundColor Gray

        foreach ($file in $jsFiles) {
            $filesScanned++
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -and ($content -match '\beval\b')) {
                $mainPackageEvalFound = $true
                $evalFound = $true
                Write-Host "[ERROR] Eval found in: $($file.Name)" -ForegroundColor Red
                break
            }
        }

        if (-not $mainPackageEvalFound) {
            Write-Host "[OK] No eval usage detected in dist files" -ForegroundColor Green
        }
    } else {
        Write-Host "[WARN] No dist directory found" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] Package not found" -ForegroundColor Red
}

# Check peer dependency @tamyla/ui-components
Write-Host "`n[INFO] Checking @tamyla/ui-components peer dependency..." -ForegroundColor Yellow

$peerPackagePath = Join-Path $PSScriptRoot "node_modules\@tamyla\ui-components"
if (Test-Path $peerPackagePath) {
    Write-Host "[OK] Peer dependency found" -ForegroundColor Green

    # Report peer dependency version
    $peerPackageJson = Join-Path $peerPackagePath "package.json"
    if (Test-Path $peerPackageJson) {
        $peerPkg = Get-Content $peerPackageJson | ConvertFrom-Json
        Write-Host "[VERSION] $($peerPkg.version)" -ForegroundColor Gray
    }

    # Check for eval in dist files
    $peerDistPath = Join-Path $peerPackagePath "dist"
    if (Test-Path $peerDistPath) {
        $peerJsFiles = Get-ChildItem $peerDistPath -Recurse -Filter "*.js" -ErrorAction SilentlyContinue
        Write-Host "[SCAN] Scanning $($peerJsFiles.Count) JavaScript files for eval usage..." -ForegroundColor Gray

        foreach ($file in $peerJsFiles) {
            $filesScanned++
            $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -and ($content -match '\beval\b')) {
                $peerDependencyEvalFound = $true
                $evalFound = $true
                Write-Host "[ERROR] Eval found in peer dependency: $($file.Name)" -ForegroundColor Red
                break
            }
        }

        if (-not $peerDependencyEvalFound) {
            Write-Host "[OK] No eval usage detected in peer dependency dist files" -ForegroundColor Green
        }
    } else {
        Write-Host "[WARN] No dist directory found in peer dependency" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARN] Peer dependency not found" -ForegroundColor Yellow
}

# Check CSP configurations
Write-Host "`n[LOCK] Checking CSP configurations..." -ForegroundColor Yellow

$cspIssues = @()

# Check public/_headers
$headersFile = Join-Path $PSScriptRoot "public\_headers"
if (Test-Path $headersFile) {
    $content = Get-Content $headersFile -Raw
    if ($content -match 'unsafe-eval') {
        Write-Host "[OK] public/_headers: unsafe-eval configured" -ForegroundColor Green
    }
    else {
        Write-Host "[ERROR] public/_headers: unsafe-eval missing" -ForegroundColor Red
        $cspIssues += "public/_headers"
    }
}
else {
    Write-Host "[WARN] public/_headers not found" -ForegroundColor Yellow
}

# Check web.config
$webConfigFile = Join-Path $PSScriptRoot "web.config"
if (Test-Path $webConfigFile) {
    $content = Get-Content $webConfigFile -Raw
    if ($content -match 'unsafe-eval') {
        Write-Host "[OK] web.config: unsafe-eval configured" -ForegroundColor Green
    }
    else {
        Write-Host "[ERROR] web.config: unsafe-eval missing" -ForegroundColor Red
        $cspIssues += "web.config"
    }
}
else {
    Write-Host "[INFO] web.config not present (IIS deployment only)" -ForegroundColor Gray
}

# Check build/index.html
$buildHtmlFile = Join-Path $PSScriptRoot "build\index.html"
if (Test-Path $buildHtmlFile) {
    $content = Get-Content $buildHtmlFile -Raw
    if ($content -match 'unsafe-eval') {
        Write-Host "[OK] build/index.html: unsafe-eval configured" -ForegroundColor Green
    }
    else {
        Write-Host "[ERROR] build/index.html: unsafe-eval missing" -ForegroundColor Red
        $cspIssues += "build/index.html"
    }
}
else {
    Write-Host "[WARN] build/index.html not found (run build first)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n[SUMMARY] Results" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan

# Performance metrics
$endTime = Get-Date
$duration = $endTime - $startTime
Write-Host "[TIME] Scan completed in $([math]::Round($duration.TotalSeconds, 2)) seconds" -ForegroundColor Gray
Write-Host "[FILES] Files scanned: $filesScanned" -ForegroundColor Gray

# Eval detection results
if ($mainPackageEvalFound) {
    Write-Host "[ERROR] Eval usage: DETECTED in @tamyla/ui-components-react" -ForegroundColor Red
}
elseif ($peerDependencyEvalFound) {
    Write-Host "[ERROR] Eval usage: DETECTED in @tamyla/ui-components (peer dependency)" -ForegroundColor Red
}
else {
    Write-Host "[OK] Eval usage: NOT detected in any packages" -ForegroundColor Green
}

# CSP status
$cspColor = if ($cspIssues.Count -eq 0) { "Green" } else { "Red" }
$cspStatus = if ($cspIssues.Count -eq 0) { "All configurations correct" } else { "$($cspIssues.Count) issues found" }
Write-Host "[CSP] Status: $cspStatus" -ForegroundColor $cspColor

# Overall status with improved logic
Write-Host "`n[STATUS] Overall Assessment" -ForegroundColor Cyan
if ($evalFound -and $cspIssues.Count -eq 0) {
    Write-Host "[SUCCESS] CSP fix is implemented and effective" -ForegroundColor Green
    Write-Host "[NOTE] If still seeing errors, wait for deployment and clear browser cache" -ForegroundColor White
}
elseif (-not $evalFound -and $cspIssues.Count -eq 0) {
    Write-Host "[SUCCESS] No eval usage detected - CSP configuration optimal" -ForegroundColor Green
}
elseif ($evalFound -and $cspIssues.Count -gt 0) {
    Write-Host "[CRITICAL] Issues need immediate attention" -ForegroundColor Red
    foreach ($issue in $cspIssues) {
        Write-Host "[FIX] Add 'unsafe-eval' to script-src directive in $issue" -ForegroundColor White
    }
}
else {
    Write-Host "[WARNING] Eval not detected but CSP configuration incomplete" -ForegroundColor Yellow
    foreach ($issue in $cspIssues) {
        Write-Host "[FIX] Add 'unsafe-eval' to script-src in $issue" -ForegroundColor White
    }
}

Write-Host "`n[END] Diagnostic complete" -ForegroundColor Cyan
