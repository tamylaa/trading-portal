# Environment Variables Setup Guide
# This script helps set up environment variables for different deployment environments

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment,
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubRepo = "tamylaa/trading-portal",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Validate = $false
)

Write-Host " Environment Variables Setup for Trading Portal" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Repository: $GitHubRepo" -ForegroundColor Yellow

# Define environment-specific configurations
$configurations = @{
    development = @{
        MEILISEARCH_GATEWAY_URL = "http://localhost:8787"
        MEILISEARCH_INDEX_NAME = "documents-dev"
        JWT_AUDIENCE = "tamyla-trading-portal"
        JWT_ISSUER = "https://auth.tamyla.com"
        AUTH_SERVICE_URL = "https://auth.tamyla.com"
        API_URL = "http://localhost:3000"
        EMAIL_SERVICE_URL = "https://auto_email.tamyla.com"
        
        # Feature flags
        FEATURE_ADVANCED_SEARCH = "true"
        FEATURE_FACETED_SEARCH = "true"
        FEATURE_SEARCH_ANALYTICS = "false"
        FEATURE_AUTO_COMPLETE = "true"
        FEATURE_BULK_OPERATIONS = "false"
        
        # Performance settings
        CACHE_TTL_MS = "300000"
        MAX_CONCURRENT_REQUESTS = "5"
        RETRY_ATTEMPTS = "3"
        
        # Security settings
        CORS_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000"
        RATE_LIMIT_SEARCH = "120"
        
        # Monitoring
        ENABLE_ERROR_REPORTING = "false"
        ENABLE_PERFORMANCE_MONITORING = "false"
        LOG_LEVEL = "debug"
    }
    
    staging = @{
        MEILISEARCH_GATEWAY_URL = "https://meilisearch-gateway-staging.workers.dev"
        MEILISEARCH_INDEX_NAME = "documents-staging"
        JWT_AUDIENCE = "tamyla-trading-portal-staging"
        JWT_ISSUER = "https://staging-auth.tamyla.com"
        AUTH_SERVICE_URL = "https://staging-auth.tamyla.com"
        API_URL = "https://staging-api.tamyla.com"
        EMAIL_SERVICE_URL = "https://staging-email.tamyla.com"
        
        # Feature flags
        FEATURE_ADVANCED_SEARCH = "true"
        FEATURE_FACETED_SEARCH = "true"
        FEATURE_SEARCH_ANALYTICS = "true"
        FEATURE_AUTO_COMPLETE = "true"
        FEATURE_BULK_OPERATIONS = "false"
        
        # Performance settings
        CACHE_TTL_MS = "300000"
        MAX_CONCURRENT_REQUESTS = "4"
        RETRY_ATTEMPTS = "3"
        
        # Security settings
        CORS_ORIGINS = "https://staging.tamyla.com,http://localhost:3000"
        RATE_LIMIT_SEARCH = "100"
        
        # Monitoring
        ENABLE_ERROR_REPORTING = "true"
        ENABLE_PERFORMANCE_MONITORING = "true"
        LOG_LEVEL = "info"
    }
    
    production = @{
        MEILISEARCH_GATEWAY_URL = "https://search.tamyla.com"
        MEILISEARCH_INDEX_NAME = "documents"
        JWT_AUDIENCE = "tamyla-trading-portal"
        JWT_ISSUER = "https://auth.tamyla.com"
        AUTH_SERVICE_URL = "https://auth.tamyla.com"
        API_URL = "https://api.tamyla.com"
        EMAIL_SERVICE_URL = "https://auto_email.tamyla.com"
        
        # Feature flags
        FEATURE_ADVANCED_SEARCH = "true"
        FEATURE_FACETED_SEARCH = "true"
        FEATURE_SEARCH_ANALYTICS = "true"
        FEATURE_AUTO_COMPLETE = "true"
        FEATURE_BULK_OPERATIONS = "true"
        
        # Performance settings
        CACHE_TTL_MS = "600000"
        MAX_CONCURRENT_REQUESTS = "3"
        RETRY_ATTEMPTS = "2"
        
        # Security settings
        CORS_ORIGINS = "https://tamyla.com,https://*.tamyla.com"
        RATE_LIMIT_SEARCH = "60"
        
        # Monitoring
        ENABLE_ERROR_REPORTING = "true"
        ENABLE_PERFORMANCE_MONITORING = "true"
        LOG_LEVEL = "error"
    }
}

$config = $configurations[$Environment]

if ($Validate) {
    Write-Host "`n[VALIDATION] Configuration for $Environment" -ForegroundColor Green
    
    $errors = @()
    
    # Validate URLs
    foreach ($key in @("MEILISEARCH_GATEWAY_URL", "AUTH_SERVICE_URL", "API_URL", "EMAIL_SERVICE_URL")) {
        $url = $config[$key]
        try {
            $uri = [System.Uri]::new($url)
            if ($uri.Scheme -notin @("http", "https")) {
                $errors += "Invalid URL scheme for $key`: $url"
            }
            Write-Host "   $key`: $url" -ForegroundColor Green
        }
        catch {
            $errors += "Invalid URL for $key`: $url"
            Write-Host "   $key`: $url" -ForegroundColor Red
        }
    }
    
    # Validate numeric values
    foreach ($key in @("CACHE_TTL_MS", "MAX_CONCURRENT_REQUESTS", "RETRY_ATTEMPTS", "RATE_LIMIT_SEARCH")) {
        $value = $config[$key]
        if ($value -match '^\d+$') {
            Write-Host "   $key`: $value" -ForegroundColor Green
        } else {
            $errors += "Invalid numeric value for $key`: $value"
            Write-Host "   $key`: $value" -ForegroundColor Red
        }
    }
    
    # Production-specific validations
    if ($Environment -eq "production") {
        if ($config.CORS_ORIGINS -like "*localhost*") {
            $errors += "Production CORS should not include localhost"
        }
        if ($config.LOG_LEVEL -ne "error") {
            Write-Host "    Warning: Production log level is not 'error'" -ForegroundColor Yellow
        }
        if ($config.ENABLE_ERROR_REPORTING -ne "true") {
            Write-Host "    Warning: Error reporting is disabled in production" -ForegroundColor Yellow
        }
    }
    
    if ($errors.Count -eq 0) {
        Write-Host "`n Configuration validation passed!" -ForegroundColor Green
        return
    } else {
        Write-Host "`n Configuration validation failed:" -ForegroundColor Red
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
        return
    }
    
    try {
        # Using GitHub CLI to set secrets
        $secretName = if ($Environment -ne "production") { "${Name}_${Environment.ToUpper()}" } else { $Name }
        gh secret set $secretName --body $Value --repo $Repo
        Write-Host "   Set: $secretName" -ForegroundColor Green
    }
    catch {
        Write-Host "   Failed to set: $secretName - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check if GitHub CLI is available
if (-not $DryRun) {
    try {
        gh auth status 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host " GitHub CLI is not authenticated. Please run 'gh auth login' first." -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host " GitHub CLI is not installed. Please install it from https://cli.github.com/" -ForegroundColor Red
        exit 1
    }
}

# Set all configuration values as GitHub secrets
Write-Host "`n[SECRETS] Setting GitHub Secrets..." -ForegroundColor Cyan

foreach ($key in $config.Keys) {
    $secretName = "REACT_APP_$key"
    Set-GitHubSecret -Name $secretName -Value $config[$key] -Repo $GitHubRepo
}

# Set additional non-React app secrets
$additionalSecrets = @{
    "MEILISEARCH_GATEWAY_URL" = $config.MEILISEARCH_GATEWAY_URL
    "JWT_AUDIENCE" = $config.JWT_AUDIENCE
    "JWT_ISSUER" = $config.JWT_ISSUER
    "AUTH_SERVICE_URL" = $config.AUTH_SERVICE_URL
}

foreach ($key in $additionalSecrets.Keys) {
    Set-GitHubSecret -Name $key -Value $additionalSecrets[$key] -Repo $GitHubRepo
}

if (-not $DryRun) {
    Write-Host "`n[SUCCESS] Environment variables setup complete for $Environment!" -ForegroundColor Green
    Write-Host "   Repository: $GitHubRepo" -ForegroundColor Gray
    Write-Host "   You can view secrets at: https://github.com/$GitHubRepo/settings/secrets/actions" -ForegroundColor Gray
}

Write-Host "`n Next Steps:" -ForegroundColor Cyan
Write-Host "1. Verify secrets in GitHub repository settings" -ForegroundColor White
Write-Host "2. Test deployment pipeline with a commit to the appropriate branch" -ForegroundColor White
Write-Host "3. Monitor deployment logs for any configuration issues" -ForegroundColor White
Write-Host "4. Validate application functionality in the deployed environment" -ForegroundColor White

# Create environment-specific summary
Write-Host "`n Configuration Summary for $Environment" -ForegroundColor Cyan
Write-Host "Gateway URL: $($config.MEILISEARCH_GATEWAY_URL)" -ForegroundColor Gray
Write-Host "Index Name: $($config.MEILISEARCH_INDEX_NAME)" -ForegroundColor Gray
Write-Host "JWT Audience: $($config.JWT_AUDIENCE)" -ForegroundColor Gray
Write-Host "Auth Service: $($config.AUTH_SERVICE_URL)" -ForegroundColor Gray
Write-Host "Feature Flags: Advanced=$($config.FEATURE_ADVANCED_SEARCH), Analytics=$($config.FEATURE_SEARCH_ANALYTICS)" -ForegroundColor Gray
Write-Host "Performance: Cache=$($config.CACHE_TTL_MS)ms, Concurrent=$($config.MAX_CONCURRENT_REQUESTS)" -ForegroundColor Gray
Write-Host "Security: Rate Limit=$($config.RATE_LIMIT_SEARCH)/min, Error Reporting=$($config.ENABLE_ERROR_REPORTING)" -ForegroundColor Gray
