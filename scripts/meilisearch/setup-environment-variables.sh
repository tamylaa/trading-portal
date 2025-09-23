#!/bin/bash

# Environment Variables Setup Script for Trading Portal
# This script helps set up environment variables for different deployment environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to show usage
usage() {
    echo "Usage: $0 -e <environment> [-r <repo>] [-d] [-v]"
    echo "  -e, --environment   Environment (development|staging|production)"
    echo "  -r, --repo         GitHub repository (default: tamylaa/trading-portal)"
    echo "  -d, --dry-run      Dry run mode (don't make changes)"
    echo "  -v, --validate     Validate configuration only"
    echo "  -h, --help         Show this help message"
    exit 1
}

# Parse command line arguments
ENVIRONMENT=""
GITHUB_REPO="tamylaa/trading-portal"
DRY_RUN=false
VALIDATE_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--repo)
            GITHUB_REPO="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--validate)
            VALIDATE_ONLY=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option $1"
            usage
            ;;
    esac
done

# Validate required arguments
if [[ -z "$ENVIRONMENT" ]]; then
    print_color $RED "Error: Environment is required"
    usage
fi

if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_color $RED "Error: Environment must be one of: development, staging, production"
    exit 1
fi

print_color $CYAN "🔧 Environment Variables Setup for Trading Portal"
print_color $YELLOW "Environment: $ENVIRONMENT"
print_color $YELLOW "Repository: $GITHUB_REPO"

# Define configurations
declare -A dev_config=(
    ["MEILISEARCH_GATEWAY_URL"]="http://localhost:8787"
    ["MEILISEARCH_INDEX_NAME"]="documents-dev"
    ["JWT_AUDIENCE"]="tamyla-trading-portal"
    ["JWT_ISSUER"]="https://auth.tamyla.com"
    ["AUTH_SERVICE_URL"]="https://auth.tamyla.com"
    ["API_URL"]="http://localhost:3000"
    ["EMAIL_SERVICE_URL"]="https://auto_email.tamyla.com"
    ["FEATURE_ADVANCED_SEARCH"]="true"
    ["FEATURE_FACETED_SEARCH"]="true"
    ["FEATURE_SEARCH_ANALYTICS"]="false"
    ["FEATURE_AUTO_COMPLETE"]="true"
    ["FEATURE_BULK_OPERATIONS"]="false"
    ["CACHE_TTL_MS"]="300000"
    ["MAX_CONCURRENT_REQUESTS"]="5"
    ["RETRY_ATTEMPTS"]="3"
    ["CORS_ORIGINS"]="http://localhost:3000,http://127.0.0.1:3000"
    ["RATE_LIMIT_SEARCH"]="120"
    ["ENABLE_ERROR_REPORTING"]="false"
    ["ENABLE_PERFORMANCE_MONITORING"]="false"
    ["LOG_LEVEL"]="debug"
)

declare -A staging_config=(
    ["MEILISEARCH_GATEWAY_URL"]="https://meilisearch-gateway-staging.workers.dev"
    ["MEILISEARCH_INDEX_NAME"]="documents-staging"
    ["JWT_AUDIENCE"]="tamyla-trading-portal-staging"
    ["JWT_ISSUER"]="https://staging-auth.tamyla.com"
    ["AUTH_SERVICE_URL"]="https://staging-auth.tamyla.com"
    ["API_URL"]="https://staging-api.tamyla.com"
    ["EMAIL_SERVICE_URL"]="https://staging-email.tamyla.com"
    ["FEATURE_ADVANCED_SEARCH"]="true"
    ["FEATURE_FACETED_SEARCH"]="true"
    ["FEATURE_SEARCH_ANALYTICS"]="true"
    ["FEATURE_AUTO_COMPLETE"]="true"
    ["FEATURE_BULK_OPERATIONS"]="false"
    ["CACHE_TTL_MS"]="300000"
    ["MAX_CONCURRENT_REQUESTS"]="4"
    ["RETRY_ATTEMPTS"]="3"
    ["CORS_ORIGINS"]="https://staging.tamyla.com,http://localhost:3000"
    ["RATE_LIMIT_SEARCH"]="100"
    ["ENABLE_ERROR_REPORTING"]="true"
    ["ENABLE_PERFORMANCE_MONITORING"]="true"
    ["LOG_LEVEL"]="info"
)

declare -A prod_config=(
    ["MEILISEARCH_GATEWAY_URL"]="https://search.tamyla.com"
    ["MEILISEARCH_INDEX_NAME"]="documents"
    ["JWT_AUDIENCE"]="tamyla-trading-portal"
    ["JWT_ISSUER"]="https://auth.tamyla.com"
    ["AUTH_SERVICE_URL"]="https://auth.tamyla.com"
    ["API_URL"]="https://api.tamyla.com"
    ["EMAIL_SERVICE_URL"]="https://auto_email.tamyla.com"
    ["FEATURE_ADVANCED_SEARCH"]="true"
    ["FEATURE_FACETED_SEARCH"]="true"
    ["FEATURE_SEARCH_ANALYTICS"]="true"
    ["FEATURE_AUTO_COMPLETE"]="true"
    ["FEATURE_BULK_OPERATIONS"]="true"
    ["CACHE_TTL_MS"]="600000"
    ["MAX_CONCURRENT_REQUESTS"]="3"
    ["RETRY_ATTEMPTS"]="2"
    ["CORS_ORIGINS"]="https://tamyla.com,https://*.tamyla.com"
    ["RATE_LIMIT_SEARCH"]="60"
    ["ENABLE_ERROR_REPORTING"]="true"
    ["ENABLE_PERFORMANCE_MONITORING"]="true"
    ["LOG_LEVEL"]="error"
)

# Get configuration for environment
declare -n config="${ENVIRONMENT}_config"

# Validation function
validate_configuration() {
    print_color $GREEN "\n📋 Validating Configuration for $ENVIRONMENT"
    
    local errors=0
    
    # Validate URLs
    for key in "MEILISEARCH_GATEWAY_URL" "AUTH_SERVICE_URL" "API_URL" "EMAIL_SERVICE_URL"; do
        local url="${config[$key]}"
        if [[ $url =~ ^https?:// ]]; then
            print_color $GREEN "  ✅ $key: $url"
        else
            print_color $RED "  ❌ $key: Invalid URL format - $url"
            ((errors++))
        fi
    done
    
    # Validate numeric values
    for key in "CACHE_TTL_MS" "MAX_CONCURRENT_REQUESTS" "RETRY_ATTEMPTS" "RATE_LIMIT_SEARCH"; do
        local value="${config[$key]}"
        if [[ $value =~ ^[0-9]+$ ]]; then
            print_color $GREEN "  ✅ $key: $value"
        else
            print_color $RED "  ❌ $key: Invalid numeric value - $value"
            ((errors++))
        fi
    done
    
    # Production-specific validations
    if [[ "$ENVIRONMENT" == "production" ]]; then
        if [[ "${config[CORS_ORIGINS]}" == *"localhost"* ]]; then
            print_color $RED "  ❌ Production CORS should not include localhost"
            ((errors++))
        fi
        
        if [[ "${config[LOG_LEVEL]}" != "error" ]]; then
            print_color $YELLOW "  ⚠️  Warning: Production log level is not 'error'"
        fi
        
        if [[ "${config[ENABLE_ERROR_REPORTING]}" != "true" ]]; then
            print_color $YELLOW "  ⚠️  Warning: Error reporting is disabled in production"
        fi
    fi
    
    if [[ $errors -eq 0 ]]; then
        print_color $GREEN "\n✅ Configuration validation passed!"
        return 0
    else
        print_color $RED "\n❌ Configuration validation failed with $errors errors"
        return 1
    fi
}

# Function to set GitHub secret
set_github_secret() {
    local name=$1
    local value=$2
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_color $YELLOW "  [DRY RUN] Would set: $name"
        return 0
    fi
    
    local secret_name
    if [[ "$ENVIRONMENT" != "production" ]]; then
        secret_name="${name}_${ENVIRONMENT^^}"
    else
        secret_name="$name"
    fi
    
    if gh secret set "$secret_name" --body "$value" --repo "$GITHUB_REPO" 2>/dev/null; then
        print_color $GREEN "  ✅ Set: $secret_name"
    else
        print_color $RED "  ❌ Failed to set: $secret_name"
        return 1
    fi
}

# Main execution
if [[ "$VALIDATE_ONLY" == "true" ]]; then
    validate_configuration
    exit $?
fi

# Validate configuration first
if ! validate_configuration; then
    print_color $RED "Configuration validation failed. Aborting."
    exit 1
fi

print_color $GREEN "\n📝 Environment Variables for $ENVIRONMENT"

if [[ "$DRY_RUN" == "true" ]]; then
    print_color $YELLOW "DRY RUN MODE - No changes will be made"
fi

# Check GitHub CLI availability
if [[ "$DRY_RUN" != "true" ]]; then
    if ! command -v gh &> /dev/null; then
        print_color $RED "❌ GitHub CLI is not installed. Please install it from https://cli.github.com/"
        exit 1
    fi
    
    if ! gh auth status &> /dev/null; then
        print_color $RED "❌ GitHub CLI is not authenticated. Please run 'gh auth login' first."
        exit 1
    fi
fi

# Set GitHub secrets
print_color $CYAN "\n🔐 Setting GitHub Secrets..."

for key in "${!config[@]}"; do
    secret_name="REACT_APP_$key"
    set_github_secret "$secret_name" "${config[$key]}"
done

# Set additional non-React app secrets
declare -A additional_secrets=(
    ["MEILISEARCH_GATEWAY_URL"]="${config[MEILISEARCH_GATEWAY_URL]}"
    ["JWT_AUDIENCE"]="${config[JWT_AUDIENCE]}"
    ["JWT_ISSUER"]="${config[JWT_ISSUER]}"
    ["AUTH_SERVICE_URL"]="${config[AUTH_SERVICE_URL]}"
)

for key in "${!additional_secrets[@]}"; do
    set_github_secret "$key" "${additional_secrets[$key]}"
done

if [[ "$DRY_RUN" != "true" ]]; then
    print_color $GREEN "\n✅ Environment variables setup complete for $ENVIRONMENT!"
    print_color $CYAN "   Repository: $GITHUB_REPO"
    print_color $CYAN "   You can view secrets at: https://github.com/$GITHUB_REPO/settings/secrets/actions"
fi

print_color $CYAN "\n📋 Next Steps:"
print_color $NC "1. Verify secrets in GitHub repository settings"
print_color $NC "2. Test deployment pipeline with a commit to the appropriate branch"
print_color $NC "3. Monitor deployment logs for any configuration issues"
print_color $NC "4. Validate application functionality in the deployed environment"

# Configuration summary
print_color $CYAN "\n📊 Configuration Summary for $ENVIRONMENT"
print_color $CYAN "Gateway URL: ${config[MEILISEARCH_GATEWAY_URL]}"
print_color $CYAN "Index Name: ${config[MEILISEARCH_INDEX_NAME]}"
print_color $CYAN "JWT Audience: ${config[JWT_AUDIENCE]}"
print_color $CYAN "Auth Service: ${config[AUTH_SERVICE_URL]}"
print_color $CYAN "Feature Flags: Advanced=${config[FEATURE_ADVANCED_SEARCH]}, Analytics=${config[FEATURE_SEARCH_ANALYTICS]}"
print_color $CYAN "Performance: Cache=${config[CACHE_TTL_MS]}ms, Concurrent=${config[MAX_CONCURRENT_REQUESTS]}"
print_color $CYAN "Security: Rate Limit=${config[RATE_LIMIT_SEARCH]}/min, Error Reporting=${config[ENABLE_ERROR_REPORTING]}"