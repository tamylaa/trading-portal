# build-check.ps1
<#
.SYNOPSIS
    Validates and builds a React project for deployment on Cloudflare Pages.
.DESCRIPTION
    This script runs a series of modular steps to validate and build a React project, ensuring it’s ready for deployment.
    Steps include clearing caches, validating configurations, installing dependencies, building the project, and more.
    Each step is configurable via the $BuildSteps registry and can be toggled or extended as needed.
.USAGE
    .\build-check.ps1 [-SkipServe] [-OnlyStep <StepName>] [-Verbose] [-Quiet]
.PARAMETER SkipServe
    Skips the Serve-Build step (local serving).
.PARAMETER OnlyStep
    Runs only the specified step (e.g., -OnlyStep "Validate Headers").
.PARAMETER Verbose
    Enables verbose logging for detailed output.
.PARAMETER Quiet
    Suppresses non-error logs for minimal output.
.EXTENDING
    To add a new step:
    1. Define a new function (e.g., function New-Step { ... }).
    2. Add it to the $BuildSteps array: @{ Name = "New Step"; Enabled = $true; Action = { New-Step } }
#>

# Command-line parameters
param(
    [switch]$SkipServe,
    [string]$OnlyStep,
    [switch]$Verbose,
    [switch]$Quiet
)

# Colors for output
$COLOR_ERROR = "Red"
$COLOR_SUCCESS = "Green"
$COLOR_INFO = "Cyan"
$COLOR_VERBOSE = "Yellow"

# Logging function
function Write-Log {
    param (
        [string]$Message,
        [string]$Type = "INFO"
    )
    if ($Quiet -and $Type -ne "ERROR") { return }
    $color = switch ($Type) {
        "ERROR" { $COLOR_ERROR }
        "SUCCESS" { $COLOR_SUCCESS }
        "VERBOSE" { $COLOR_VERBOSE }
        default { $COLOR_INFO }
    }
    if ($Type -eq "VERBOSE" -and -not $Verbose) { return }
    Write-Host "[$Type] $Message" -ForegroundColor $color
}

# Configurable step registry
$BuildSteps = @(
    @{ Name = "Clear Caches"; Enabled = $true; Action = { Clear-Caches } }
    @{ Name = "Remove Pages Config"; Enabled = $true; Action = { Remove-PagesConfig } }
    @{ Name = "Validate Homepage"; Enabled = $true; Action = { Validate-Homepage } }
    @{ Name = "Validate Public Index HTML"; Enabled = $true; Action = { Validate-PublicIndexHtml } }
    @{ Name = "Validate Craco Config"; Enabled = $true; Action = { Validate-CracoConfig } }
    @{ Name = "Validate Redirects"; Enabled = $true; Action = { Validate-Redirects } }
    @{ Name = "Validate Headers"; Enabled = $true; Action = { Validate-Headers } }
    @{ Name = "Install Dependencies"; Enabled = $true; Action = { Install-Dependencies } }
    @{ Name = "Build Project"; Enabled = $true; Action = { Build-Project } }
    @{ Name = "Validate Build Index HTML"; Enabled = $true; Action = { Validate-BuildIndexHtml } }
    @{ Name = "Serve Build"; Enabled = (-not $SkipServe); Action = { Serve-Build } }
)

# Track step results for summary
$StepResults = @()

# Reusable step runner
function Run-Step {
    param(
        [string]$Name,
        [scriptblock]$Action,
        [bool]$Enabled = $true
    )
    $result = @{ Name = $Name; Status = "SKIPPED"; Error = $null }
    if ($Enabled -and (-not $OnlyStep -or $Name -eq $OnlyStep)) {
        Write-Log "Running step: $Name" "INFO"
        try {
            & $Action
            Write-Log "$Name completed successfully" "SUCCESS"
            $result.Status = "PASSED"
        } catch {
            Write-Log "$Name failed: $_" "ERROR"
            $result.Status = "FAILED"
            $result.Error = $_
            $global:BuildFailed = $true
        }
    } else {
        Write-Log "$Name skipped" "INFO"
    }
    $script:StepResults += $result
}

# Modular step functions
function Clear-Caches {
    Write-Log "Clearing build and node_modules caches..." "VERBOSE"
    Remove-Item -Path (Join-Path $PSScriptRoot "build") -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path (Join-Path $PSScriptRoot "node_modules") -Recurse -Force -ErrorAction SilentlyContinue
    Write-Log "Clearing npm cache..." "VERBOSE"
    Invoke-Expression "npm cache clean --force" -ErrorAction Stop
    Write-Log "Clearing CRA/CRACO caches..." "VERBOSE"
    Remove-Item -Path "$env:TEMP\react-scripts-*" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path (Join-Path $PSScriptRoot ".craco-cache") -Recurse -Force -ErrorAction SilentlyContinue
}

function Remove-PagesConfig {
    Write-Log "Removing pages.config.json (not needed for Cloudflare Pages)..." "VERBOSE"
    Remove-Item -Path (Join-Path $PSScriptRoot "pages.config.json") -Force -ErrorAction SilentlyContinue
}

function Validate-Homepage {
    $packageJsonPath = Join-Path $PSScriptRoot "package.json"
    if (-not (Test-Path $packageJsonPath)) { throw "package.json not found" }
    $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    $expectedHomepage = "https://tamyla.com"
    if ($packageJson.homepage -ne $expectedHomepage) {
        throw "package.json homepage is incorrect. Expected: $expectedHomepage, Found: $($packageJson.homepage)"
    }
}

function Validate-PublicIndexHtml {
    $publicIndexPath = Join-Path $PSScriptRoot "public/index.html"
    if (-not (Test-Path $publicIndexPath)) { throw "public/index.html not found" }
    $content = Get-Content $publicIndexPath -Raw
    $checks = @(
        @{ Pattern = 'href="%PUBLIC_URL%/assets/favicon.ico"'; Message = "Favicon should use %PUBLIC_URL%" }
        @{ Pattern = 'content="%PUBLIC_URL%/assets/logos/og-image.png"'; Message = "OG image should use %PUBLIC_URL%" }
    )
    foreach ($check in $checks) {
        if ($content -notmatch [regex]::Escape($check.Pattern)) {
            throw $check.Message
        }
    }
}

function Validate-CracoConfig {
    $cracoConfigPath = Join-Path $PSScriptRoot "craco.config.js"
    if (-not (Test-Path $cracoConfigPath)) { throw "craco.config.js not found" }
    $content = Get-Content $cracoConfigPath -Raw
    if ($content -notmatch "publicPath\s*=\s*'/';") {
        Write-Log "craco.config.js does not set publicPath to '/'. Updating..." "INFO"
        $newConfig = @"
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils')
    },
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = '/';
      return webpackConfig;
    }
  }
};
"@
        Set-Content -Path $cracoConfigPath -Value $newConfig
    }
}

function Validate-Redirects {
    $redirectsPath = Join-Path $PSScriptRoot "public/_redirects"
    if (-not (Test-Path $redirectsPath)) {
        throw "public/_redirects is missing. Required for SPA routing on Cloudflare Pages."
    }
}

function Validate-Headers {
    $headersPath = Join-Path $PSScriptRoot "public/_headers"
    $expectedHeaders = @"
/*
  Content-Security-Policy: default-src 'self' cdnjs.cloudflare.com https://tamyla.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://tamyla.com; connect-src 'self' https://tamyla.com
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
"@
    if (-not (Test-Path $headersPath)) {
        Write-Log "Creating public/_headers for Cloudflare Pages..." "INFO"
        Set-Content -Path $headersPath -Value $expectedHeaders
    } else {
        $currentHeaders = Get-Content $headersPath -Raw
        if ($currentHeaders -ne $expectedHeaders) {
            Write-Log "public/_headers content is outdated. Updating..." "INFO"
            Set-Content -Path $headersPath -Value $expectedHeaders -Force
        }
    }
}

function Install-Dependencies {
    Invoke-Expression "npm install" -ErrorAction Stop
    if ($LASTEXITCODE -ne 0) { throw "Failed to install dependencies" }
}

function Build-Project {
    $env:PUBLIC_URL = "/"
    Invoke-Expression "npm run build" -ErrorAction Stop
    if ($LASTEXITCODE -ne 0) { throw "Failed to build the project" }
}

function Validate-BuildIndexHtml {
    $buildIndexPath = Join-Path $PSScriptRoot "build/index.html"
    if (-not (Test-Path $buildIndexPath)) { throw "build/index.html not found" }
    $content = Get-Content $buildIndexPath -Raw
    if ($content -match "https://tamylaa.github.io/trading-portal") {
        throw "build/index.html contains incorrect asset paths (https://tamylaa.github.io/trading-portal)"
    }
    $checks = @(
        @{ Pattern = '/static/js/main\.[a-f0-9]+\.js'; Message = "JavaScript bundle path should be relative" }
        @{ Pattern = '/static/css/main\.[a-f0-9]+\.css'; Message = "CSS bundle path should be relative" }
        @{ Pattern = '/assets/favicon.ico'; Message = "Favicon path should be relative" }
    )
    foreach ($check in $checks) {
        if ($content -notmatch "(src|href)\s*=\s*`"($($check.Pattern))`"") {
            throw $check.Message
        }
    }
}

function Serve-Build {
    Write-Log "Installing serve globally (if not already installed)..." "VERBOSE"
    Invoke-Expression "npm install -g serve" -ErrorAction Stop
    $npmPrefix = & npm config get prefix
    $servePath = Join-Path $npmPrefix "serve.cmd"
    if (-not (Test-Path $servePath)) {
        Write-Log "serve.cmd not found at $servePath. Falling back to local installation..." "INFO"
        Invoke-Expression "npm install serve" -ErrorAction Stop
        $servePath = Join-Path $PSScriptRoot "node_modules\.bin\serve.cmd"
        if (-not (Test-Path $servePath)) { throw "Unable to locate serve.cmd" }
    }
    Write-Log "Serving the build locally on port 3000..." "INFO"
    $script:serveProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"$servePath`" build -l 3000" -NoNewWindow -PassThru
    Start-Sleep -Seconds 3
    Write-Log "Opening http://localhost:3000 in your default browser..." "INFO"
    Start-Process "http://localhost:3000"
}

# Main script logic
$global:BuildFailed = $false

foreach ($step in $BuildSteps) {
    Run-Step -Name $step.Name -Action $step.Action -Enabled:$step.Enabled
}

# Display summary table
Write-Log "Build Check Summary:" "INFO"
Write-Host "-----------------------------"
Write-Host "Step Name`t`tStatus`tError"
Write-Host "-----------------------------"
foreach ($result in $StepResults) {
    $errorMsg = if ($result.Error) { $result.Error } else { "N/A" }
    Write-Host "$($result.Name.PadRight(20))`t$($result.Status.PadRight(10))`t$errorMsg"
}
Write-Host "-----------------------------"

# Final instructions and exit
if ($global:BuildFailed) {
    Write-Log "Build validation failed. See errors above." "ERROR"
    if ($serveProcess) { Stop-Process -Id $serveProcess.Id -Force -ErrorAction SilentlyContinue }
    exit 1
} else {
    Write-Log "All build checks passed! 🎉" "SUCCESS"
    if (-not $OnlyStep -and -not $SkipServe) {
        Write-Log "The app is running at http://localhost:3000. Verify it renders correctly." "INFO"
        Write-Log "To deploy, run: git add .; git commit -m 'Prepare build'; git push origin main" "INFO"
        Write-Log "After pushing, purge Cloudflare's cache in the dashboard." "INFO"
        Write-Log "Press Ctrl+C to stop the local server and exit." "INFO"
        while ($true) { Start-Sleep -Seconds 1 }
    }
}

# Cleanup
if ($serveProcess) { Stop-Process -Id $serveProcess.Id -Force -ErrorAction SilentlyContinue }