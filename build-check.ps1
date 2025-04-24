# Colors for output
$COLOR_ERROR = "Red"
$COLOR_SUCCESS = "Green"
$COLOR_INFO = "Cyan"

function Write-Log {
    param (
        [string]$Message,
        [string]$Type = "INFO"
    )
    $color = switch ($Type) {
        "ERROR" { $COLOR_ERROR }
        "SUCCESS" { $COLOR_SUCCESS }
        default { $COLOR_INFO }
    }
    Write-Host "[$Type] $Message" -ForegroundColor $color
}

function Invoke-CommandWithErrorHandling {
    param (
        [string]$Command,
        [string]$ErrorMessage
    )
    try {
        Invoke-Expression $Command -ErrorAction Stop
        if ($LASTEXITCODE -ne 0) {
            throw $ErrorMessage
        }
    } catch {
        Write-Log $ErrorMessage "ERROR"
        throw
    }
}

function Test-FileExists {
    param (
        [string]$FilePath,
        [string]$ErrorMessage
    )
    if (-Not (Test-Path $FilePath)) {
        Write-Log $ErrorMessage "ERROR"
        throw $ErrorMessage
    }
    Write-Log "$FilePath exists" "SUCCESS"
}

function Validate-Homepage {
    $packageJsonPath = Join-Path $PSScriptRoot "package.json"
    $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
    $expectedHomepage = "https://tamyla.com"
    if ($packageJson.homepage -ne $expectedHomepage) {
        Write-Log "package.json homepage is incorrect. Expected: $expectedHomepage, Found: $($packageJson.homepage)" "ERROR"
        throw "Incorrect homepage in package.json"
    }
    Write-Log "package.json homepage is correct" "SUCCESS"
}

function Validate-PublicIndexHtml {
    $publicIndexPath = Join-Path $PSScriptRoot "public/index.html"
    $content = Get-Content $publicIndexPath -Raw
    $checks = @(
        @{ Pattern = 'href="%PUBLIC_URL%/assets/favicon.ico"'; Message = "Favicon should use %PUBLIC_URL%" },
        @{ Pattern = 'content="%PUBLIC_URL%/assets/logos/og-image.png"'; Message = "OG image should use %PUBLIC_URL%" }
    )
    foreach ($check in $checks) {
        if ($content -notmatch [regex]::Escape($check.Pattern)) {
            Write-Log $check.Message "ERROR"
            throw $check.Message
        }
    }
    Write-Log "public/index.html asset paths are correct" "SUCCESS"
}

function Validate-CracoConfig {
    $cracoConfigPath = Join-Path $PSScriptRoot "craco.config.js"
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
        Write-Log "craco.config.js updated with publicPath = '/'" "SUCCESS"
    } else {
        Write-Log "craco.config.js publicPath is correct" "SUCCESS"
    }
}

function Validate-BuildIndexHtml {
    $buildIndexPath = Join-Path $PSScriptRoot "build/index.html"
    $content = Get-Content $buildIndexPath -Raw
    if ($content -match "https://tamylaa.github.io/trading-portal") {
        Write-Log "build/index.html contains incorrect asset paths (https://tamylaa.github.io/trading-portal)" "ERROR"
        throw "Incorrect asset paths in build/index.html"
    }
    $checks = @(
        @{ Pattern = '/static/js/main\.[a-f0-9]+\.js'; Message = "JavaScript bundle path should be relative" },
        @{ Pattern = '/static/css/main\.[a-f0-9]+\.css'; Message = "CSS bundle path should be relative" },
        @{ Pattern = '/assets/favicon.ico'; Message = "Favicon path should be relative" }
    )
    foreach ($check in $checks) {
        if ($content -notmatch "(src|href)\s*=\s*`"($($check.Pattern))`"") {
            Write-Log $check.Message "ERROR"
            Write-Log "Actual content: $($content -match '(src|href)\s*=\s*`"/static/[^`"]*`"')" "INFO"
            throw $check.Message
        }
    }
    Write-Log "build/index.html asset paths are correct" "SUCCESS"
}

function Create-HeadersFile {
    $headersPath = Join-Path $PSScriptRoot "public/_headers"
    if (-Not (Test-Path $headersPath)) {
        Write-Log "Creating public/_headers for Cloudflare Pages..." "INFO"
        $headersContent = @"
/*
  Content-Security-Policy: default-src 'self' cdnjs.cloudflare.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
"@
        Set-Content -Path $headersPath -Value $headersContent
        Write-Log "public/_headers created" "SUCCESS"
    } else {
        Write-Log "public/_headers already exists" "SUCCESS"
    }
}

try {
    # Step 1: Clear caches
    Write-Log "Clearing build and node_modules caches..." "INFO"
    Remove-Item -Path (Join-Path $PSScriptRoot "build") -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path (Join-Path $PSScriptRoot "node_modules") -Recurse -Force -ErrorAction SilentlyContinue
    Write-Log "Clearing npm cache..." "INFO"
    Invoke-CommandWithErrorHandling -Command "npm cache clean --force" -ErrorMessage "Failed to clear npm cache"
    Write-Log "Clearing CRA/CRACO caches..." "INFO"
    Remove-Item -Path "$env:TEMP\react-scripts-*" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path (Join-Path $PSScriptRoot ".craco-cache") -Recurse -Force -ErrorAction SilentlyContinue
    Write-Log "Caches cleared successfully" "SUCCESS"

    # Step 2: Remove pages.config.json
    Write-Log "Removing pages.config.json (not needed for Cloudflare Pages)..." "INFO"
    Remove-Item -Path (Join-Path $PSScriptRoot "pages.config.json") -Force -ErrorAction SilentlyContinue
    Write-Log "pages.config.json removed" "SUCCESS"

    # Step 3: Install dependencies
    Write-Log "Installing dependencies..." "INFO"
    Invoke-CommandWithErrorHandling -Command "npm install" -ErrorMessage "Failed to install dependencies"
    Write-Log "Dependencies installed successfully" "SUCCESS"

    # Step 4: Validate package.json homepage
    Write-Log "Validating package.json homepage..." "INFO"
    Validate-Homepage

    # Step 5: Validate public/index.html
    Write-Log "Validating public/index.html..." "INFO"
    Validate-PublicIndexHtml

    # Step 6: Validate craco.config.js
    Write-Log "Validating craco.config.js..." "INFO"
    Validate-CracoConfig

    # Step 7: Validate public/_redirects
    Write-Log "Validating public/_redirects..." "INFO"
    Test-FileExists -FilePath (Join-Path $PSScriptRoot "public/_redirects") -ErrorMessage "public/_redirects is missing. Required for SPA routing on Cloudflare Pages."

    # Step 8: Create public/_headers
    Write-Log "Checking public/_headers..." "INFO"
    Create-HeadersFile

    # Step 9: Build the project with PUBLIC_URL set
    Write-Log "Building the project with PUBLIC_URL=/..." "INFO"
    $env:PUBLIC_URL = "/"
    Invoke-CommandWithErrorHandling -Command "npm run build" -ErrorMessage "Failed to build the project"
    Write-Log "Project built successfully" "SUCCESS"

    # Step 10: Validate build/index.html
    Write-Log "Validating build/index.html..." "INFO"
    Validate-BuildIndexHtml

    # Step 11: Serve the build locally
    Write-Log "Installing serve globally (if not already installed)..." "INFO"
    Invoke-CommandWithErrorHandling -Command "npm install -g serve" -ErrorMessage "Failed to install serve globally"

    Write-Log "Serving the build locally on port 3000..." "INFO"
    # Dynamically find the path to serve.cmd
    $npmPrefix = & npm config get prefix
    $servePath = Join-Path $npmPrefix "serve.cmd"
    if (-Not (Test-Path $servePath)) {
        Write-Log "serve.cmd not found at $servePath. Attempting to find it..." "INFO"
        $servePath = (Get-ChildItem -Path "C:\Users\Admin" -Filter "serve.cmd" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
        if (-Not $servePath) {
            Write-Log "serve.cmd not found on the system. Falling back to local serve installation..." "INFO"
            # Install serve locally as a fallback
            Invoke-CommandWithErrorHandling -Command "npm install serve" -ErrorMessage "Failed to install serve locally"
            $servePath = Join-Path $PSScriptRoot "node_modules\.bin\serve.cmd"
            if (-Not (Test-Path $servePath)) {
                Write-Log "serve.cmd not found at $servePath even after local installation" "ERROR"
                throw "Unable to locate serve.cmd. Please install serve manually and ensure it's accessible."
            }
        }
    }
    Write-Log "Using serve.cmd at $servePath" "INFO"
    $serveProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"$servePath`" build -l 3000" -NoNewWindow -PassThru

    Start-Sleep -Seconds 3

    # Step 12: Open the browser to test
    Write-Log "Opening http://localhost:3000 in your default browser..." "INFO"
    Start-Process "http://localhost:3000"

    # Step 13: Final instructions
    Write-Log "Build validation passed! 🎉" "SUCCESS"
    Write-Log "The app is now running at http://localhost:3000. Please verify that it renders correctly." "INFO"
    Write-Log "If the app renders correctly, the build is ready for Cloudflare Pages deployment." "INFO"
    Write-Log "To deploy, run the following commands:" "INFO"
    Write-Log "  git add ." "INFO"
    Write-Log "  git commit -m 'Prepare build for Cloudflare Pages'" "INFO"
    Write-Log "  git push origin main" "INFO"
    Write-Log "After pushing, purge Cloudflare's cache in the dashboard (Caching > Configuration > Purge Everything)." "INFO"
    Write-Log "Press Ctrl+C to stop the local server and exit." "INFO"

    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Log "Build validation failed. See errors above." "ERROR"
    if ($serveProcess) {
        Stop-Process -Id $serveProcess.Id -Force -ErrorAction SilentlyContinue
    }
    exit 1
} finally {
    if ($serveProcess) {
        Stop-Process -Id $serveProcess.Id -Force -ErrorAction SilentlyContinue
    }
}