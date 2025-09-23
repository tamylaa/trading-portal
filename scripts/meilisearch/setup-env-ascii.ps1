# Environment Variables Setup Script for Trading Portal
# This script helps set up environment variables for different deployment environments

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment,
    
    [string]$GitHubRepo = "tamylaa/trading-portal",
    [switch]$DryRun,
    [switch]$Validate
)

# Configuration definitions
$developmentConfig = @{
    MEILISEARCH_GATEWAY_URL = "http://localhost:8787"
    MEILISEARCH_INDEX_NAME = "documents-dev"
    JWT_AUDIENCE = "tamyla-trading-portal"
    JWT_ISSUER = "https://auth.tamyla.com"
    AUTH_SERVICE_URL = "https://auth.tamyla.com"
    API_URL = "http://localhost:3000"
    EMAIL_SERVICE_URL = "https://auto_email.tamyla.com"
    FEATURE_ADVANCED_SEARCH = "true"
    FEATURE_FACETED_SEARCH = "true"
    FEATURE_SEARCH_ANALYTICS = "false"
    FEATURE_AUTO_COMPLETE = "true"
    FEATURE_BULK_OPERATIONS = "false"
    CACHE_TTL_MS = "300000"
    MAX_CONCURRENT_REQUESTS = "5"
    RETRY_ATTEMPTS = "3"
    CORS_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"
    RATE_LIMIT_SEARCH = "120"
    ENABLE_ERROR_REPORTING = "false"
    ENABLE_PERFORMANCE_MONITORING = "false"
    LOG_LEVEL = "debug"
}

$stagingConfig = @{
    MEILISEARCH_GATEWAY_URL = "https://meilisearch-gateway-staging.workers.dev"
    MEILISEARCH_INDEX_NAME = "documents-staging"
    JWT_AUDIENCE = "tamyla-trading-portal-staging"
    JWT_ISSUER = "https://staging-auth.tamyla.com"
    AUTH_SERVICE_URL = "https://staging-auth.tamyla.com"
    API_URL = "https://staging-api.tamyla.com"
    EMAIL_SERVICE_URL = "https://staging-email.tamyla.com"
    FEATURE_ADVANCED_SEARCH = "true"
    FEATURE_FACETED_SEARCH = "true"
    FEATURE_SEARCH_ANALYTICS = "true"
    FEATURE_AUTO_COMPLETE = "true"
    FEATURE_BULK_OPERATIONS = "false"
    CACHE_TTL_MS = "300000"
    MAX_CONCURRENT_REQUESTS = "4"
    RETRY_ATTEMPTS = "3"
    CORS_ORIGINS = "https://staging.tamyla.com,http://localhost:3000"
    RATE_LIMIT_SEARCH = "100"
    ENABLE_ERROR_REPORTING = "true"
    ENABLE_PERFORMANCE_MONITORING = "true"
    LOG_LEVEL = "info"
}

$productionConfig = @{
    MEILISEARCH_GATEWAY_URL = "https://search.tamyla.com"
    MEILISEARCH_INDEX_NAME = "documents"
    JWT_AUDIENCE = "tamyla-trading-portal"
    JWT_ISSUER = "https://auth.tamyla.com"
    AUTH_SERVICE_URL = "https://auth.tamyla.com"
    API_URL = "https://api.tamyla.com"
    EMAIL_SERVICE_URL = "https://auto_email.tamyla.com"
    FEATURE_ADVANCED_SEARCH = "true"
    FEATURE_FACETED_SEARCH = "true"
    FEATURE_SEARCH_ANALYTICS = "true"
    FEATURE_AUTO_COMPLETE = "true"
    FEATURE_BULK_OPERATIONS = "true"
    CACHE_TTL_MS = "600000"
    MAX_CONCURRENT_REQUESTS = "3"
    RETRY_ATTEMPTS = "2"
    CORS_ORIGINS = "https://tamyla.com,https://*.tamyla.com"
    RATE_LIMIT_SEARCH = "60"
    ENABLE_ERROR_REPORTING = "true"
    ENABLE_PERFORMANCE_MONITORING = "true"
    LOG_LEVEL = "error"
}

# Get configuration for current environment
$config = switch ($Environment) {
    "development" { $developmentConfig }
    "staging" { $stagingConfig }
    "production" { $productionConfig }
}

Write-Host "Environment Variables Setup for Trading Portal" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow  
Write-Host "Repository: $GitHubRepo" -ForegroundColor Yellow

# Validation mode
if ($Validate) {
    Write-Host "`n[VALIDATION] Configuration for $Environment" -ForegroundColor Green
    
    $errors = @()
    
    # Validate URLs
    foreach ($key in @("MEILISEARCH_GATEWAY_URL", "AUTH_SERVICE_URL", "API_URL", "EMAIL_SERVICE_URL")) {
        $url = $config[$key]
        try {
            $uri = [System.Uri]::new($url)
            if ($uri.Scheme -notin @("http", "https")) {
                $errors += "Invalid URL scheme for $key : $url"
            }
            Write-Host "  [OK] $key : $url" -ForegroundColor Green
        }
        catch {
            $errors += "Invalid URL for $key : $url"
            Write-Host "  [ERROR] $key : $url" -ForegroundColor Red
        }
    }
    
    # Validate numeric values
    foreach ($key in @("CACHE_TTL_MS", "MAX_CONCURRENT_REQUESTS", "RETRY_ATTEMPTS", "RATE_LIMIT_SEARCH")) {
        $value = $config[$key]
        if ($value -match "^\d+$") {
            Write-Host "  [OK] $key : $value" -ForegroundColor Green
        } else {
            $errors += "Invalid numeric value for $key : $value"
            Write-Host "  [ERROR] $key : $value" -ForegroundColor Red
        }
    }
    
    # Production-specific validations
    if ($Environment -eq "production") {
        if ($config.CORS_ORIGINS -like "*localhost*") {
            $errors += "Production CORS should not include localhost"
        }
        if ($config.LOG_LEVEL -ne "error") {
            Write-Host "  [WARNING] Production log level is not 'error'" -ForegroundColor Yellow
        }
        if ($config.ENABLE_ERROR_REPORTING -ne "true") {
            Write-Host "  [WARNING] Error reporting is disabled in production" -ForegroundColor Yellow
        }
    }
    
    if ($errors.Count -eq 0) {
        Write-Host "`n[SUCCESS] Configuration validation passed!" -ForegroundColor Green
        return
    } else {
        Write-Host "`n[ERROR] Configuration validation failed:" -ForegroundColor Red
        $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        exit 1
    }
}

Write-Host "`nEnvironment Variables for $Environment" -ForegroundColor Green

if ($DryRun) {
    Write-Host "DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
}

# Function to set GitHub secret
function Set-GitHubSecret {
    param($Name, $Value, $Repo)
    
    if ($DryRun) {
        Write-Host "  [DRY RUN] Would set: $Name" -ForegroundColor Yellow
        return $true
    }
    
    $secretName = if ($Environment -ne "production") { 
        "$Name`_$($Environment.ToUpper())" 
    } else { 
        $Name 
    }
    
    try {
        gh secret set $secretName --body $Value --repo $Repo 2>$null
        Write-Host "  [OK] Set: $secretName" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  [ERROR] Failed to set: $secretName - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Check GitHub CLI if not in dry run mode
if (-not $DryRun) {
    try {
        gh auth status 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] GitHub CLI is not authenticated. Please run 'gh auth login' first." -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host "[ERROR] GitHub CLI is not installed. Please install it from https://cli.github.com/" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n[SECRETS] Setting GitHub Secrets..." -ForegroundColor Cyan

# Set React app environment variables
foreach ($key in $config.Keys) {
    $reactAppKey = "REACT_APP_$key"
    Set-GitHubSecret -Name $reactAppKey -Value $config[$key] -Repo $GitHubRepo
}

# Set additional non-React app secrets
$additionalSecrets = @{
    MEILISEARCH_GATEWAY_URL = $config.MEILISEARCH_GATEWAY_URL
    JWT_AUDIENCE = $config.JWT_AUDIENCE
    JWT_ISSUER = $config.JWT_ISSUER
    AUTH_SERVICE_URL = $config.AUTH_SERVICE_URL
}

foreach ($key in $additionalSecrets.Keys) {
    Set-GitHubSecret -Name $key -Value $additionalSecrets[$key] -Repo $GitHubRepo
}

if (-not $DryRun) {
    Write-Host "`n[SUCCESS] Environment variables setup complete for $Environment!" -ForegroundColor Green
    Write-Host "   Repository: $GitHubRepo" -ForegroundColor Cyan
    Write-Host "   You can view secrets at: https://github.com/$GitHubRepo/settings/secrets/actions" -ForegroundColor Cyan
}

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Verify secrets in GitHub repository settings" -ForegroundColor White
Write-Host "2. Test deployment pipeline with a commit to the appropriate branch" -ForegroundColor White
Write-Host "3. Monitor deployment logs for any configuration issues" -ForegroundColor White
Write-Host "4. Validate application functionality in the deployed environment" -ForegroundColor White

# Configuration summary
Write-Host "`nConfiguration Summary for $Environment" -ForegroundColor Cyan
Write-Host "Gateway URL: $($config.MEILISEARCH_GATEWAY_URL)" -ForegroundColor Cyan
Write-Host "Index Name: $($config.MEILISEARCH_INDEX_NAME)" -ForegroundColor Cyan
Write-Host "JWT Audience: $($config.JWT_AUDIENCE)" -ForegroundColor Cyan
Write-Host "Auth Service: $($config.AUTH_SERVICE_URL)" -ForegroundColor Cyan
Write-Host "Feature Flags: Advanced=$($config.FEATURE_ADVANCED_SEARCH), Analytics=$($config.FEATURE_SEARCH_ANALYTICS)" -ForegroundColor Cyan
Write-Host "Performance: Cache=$($config.CACHE_TTL_MS)ms, Concurrent=$($config.MAX_CONCURRENT_REQUESTS)" -ForegroundColor Cyan
Write-Host "Security: Rate Limit=$($config.RATE_LIMIT_SEARCH)/min, Error Reporting=$($config.ENABLE_ERROR_REPORTING)" -ForegroundColor Cyan