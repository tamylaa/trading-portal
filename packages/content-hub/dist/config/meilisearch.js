// MeiliSearch Configuration
// Environment-aware configuration for MeiliSearch integration with proper fallbacks
// Environment detection
const getEnvironment = () => {
    const env = process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || 'development';
    // Map NODE_ENV to our environment names
    if (env === 'development' || env === 'dev')
        return 'development';
    if (env === 'staging' || env === 'test')
        return 'staging';
    if (env === 'production' || env === 'prod')
        return 'production';
    // Default to development for safety
    console.warn(`Unknown environment: ${env}, defaulting to development`);
    return 'development';
};
// Environment-specific configurations
const ENVIRONMENT_CONFIGS = {
    development: {
        gatewayUrl: process.env.REACT_APP_MEILISEARCH_GATEWAY_URL || 'http://localhost:8787', // Local development gateway
        enableHealthChecks: true,
        enableMockFallback: true,
        enableDebugLogging: true,
        healthCheckInterval: 10000, // 10 seconds - frequent for development
        requestTimeout: 30000 // 30 seconds - generous for development
    },
    staging: {
        gatewayUrl: process.env.REACT_APP_MEILISEARCH_GATEWAY_URL || 'https://meilisearch-gateway-staging.workers.dev',
        enableHealthChecks: true,
        enableMockFallback: true,
        enableDebugLogging: true,
        healthCheckInterval: 30000, // 30 seconds
        requestTimeout: 15000 // 15 seconds
    },
    production: {
        gatewayUrl: process.env.REACT_APP_MEILISEARCH_GATEWAY_URL || 'https://search.tamyla.com',
        enableHealthChecks: true,
        enableMockFallback: false, // No mock data in production
        enableDebugLogging: false,
        healthCheckInterval: 60000, // 1 minute - less frequent in production
        requestTimeout: 10000 // 10 seconds - strict timeout for production
    }
};
// Get current environment configuration
const getCurrentConfig = () => {
    const env = getEnvironment();
    return ENVIRONMENT_CONFIGS[env];
};
export const MEILISEARCH_CONFIG = {
    // Environment-aware configuration
    ...getCurrentConfig(),
    // Environment detection
    ENVIRONMENT: getEnvironment(),
    IS_DEVELOPMENT: getEnvironment() === 'development',
    IS_STAGING: getEnvironment() === 'staging',
    IS_PRODUCTION: getEnvironment() === 'production',
    // Default search settings - consistent across environments
    DEFAULT_SEARCH: {
        LIMIT: parseInt(process.env.REACT_APP_SEARCH_DEFAULT_LIMIT || '20', 10),
        OFFSET: 0,
        ATTRIBUTES_TO_HIGHLIGHT: ['title', 'summary'],
        ATTRIBUTES_TO_RETRIEVE: ['id', 'title', 'summary', 'filename', 'mimeType', 'uploadedAt'],
        MAX_RESULTS: parseInt(process.env.REACT_APP_SEARCH_MAX_RESULTS || '100', 10),
        DEBOUNCE_MS: parseInt(process.env.REACT_APP_SEARCH_DEBOUNCE_MS || '300', 10)
    },
    // Index settings - configurable per environment
    INDEX: {
        NAME: process.env.REACT_APP_MEILISEARCH_INDEX_NAME || 'documents',
        SEARCHABLE_ATTRIBUTES: [
            'title',
            'summary',
            'entities',
            'topics',
            'filename'
        ],
        FILTERABLE_ATTRIBUTES: [
            'userId',
            'entities',
            'topics',
            'mimeType',
            'uploadedAt',
            'lastAnalyzed'
        ],
        SORTABLE_ATTRIBUTES: [
            'uploadedAt',
            'lastAnalyzed',
            'title'
        ]
    },
    // Trading-specific filters
    TRADING_FILTERS: {
        DOCUMENT_TYPES: ['contract', 'certificate', 'invoice', 'compliance', 'shipment', 'customs'],
        TRADE_TYPES: ['import', 'export', 'domestic', 'transit'],
        PRODUCT_CATEGORIES: ['coffee', 'cocoa', 'cashews', 'spices', 'minerals', 'textiles', 'electronics'],
        REGIONS: ['africa', 'asia', 'europe', 'americas', 'oceania'],
        CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF'],
        TRADE_TERMS: ['FOB', 'CIF', 'EXW', 'DDP', 'FCA', 'CPT', 'DAP', 'DPU']
    },
    // Feature flags - environment-aware
    FEATURES: {
        ADVANCED_SEARCH: process.env.REACT_APP_FEATURE_ADVANCED_SEARCH !== 'false',
        FACETED_SEARCH: process.env.REACT_APP_FEATURE_FACETED_SEARCH !== 'false',
        SEARCH_ANALYTICS: process.env.REACT_APP_FEATURE_SEARCH_ANALYTICS === 'true',
        AUTO_COMPLETE: process.env.REACT_APP_FEATURE_AUTO_COMPLETE !== 'false',
        SEARCH_SUGGESTIONS: process.env.REACT_APP_FEATURE_SEARCH_SUGGESTIONS !== 'false',
        BULK_OPERATIONS: process.env.REACT_APP_FEATURE_BULK_OPERATIONS === 'true'
    },
    // Security settings
    SECURITY: {
        ENABLE_JWT_VALIDATION: true,
        JWT_AUDIENCE: process.env.REACT_APP_JWT_AUDIENCE || 'tamyla-trading-portal',
        JWT_ISSUER: process.env.REACT_APP_JWT_ISSUER || 'https://auth.tamyla.com',
        CORS_ORIGINS: process.env.REACT_APP_CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
        MAX_SEARCH_QUERIES_PER_MINUTE: parseInt(process.env.REACT_APP_RATE_LIMIT_SEARCH || '60', 10),
        ENABLE_REQUEST_SANITIZATION: true
    },
    // Performance settings
    PERFORMANCE: {
        CACHE_TTL_MS: parseInt(process.env.REACT_APP_CACHE_TTL_MS || '300000', 10), // 5 minutes default
        ENABLE_REQUEST_CACHING: process.env.REACT_APP_ENABLE_REQUEST_CACHING !== 'false',
        ENABLE_RESULT_CACHING: process.env.REACT_APP_ENABLE_RESULT_CACHING !== 'false',
        MAX_CONCURRENT_REQUESTS: parseInt(process.env.REACT_APP_MAX_CONCURRENT_REQUESTS || '3', 10),
        RETRY_ATTEMPTS: parseInt(process.env.REACT_APP_RETRY_ATTEMPTS || '2', 10),
        RETRY_DELAY_MS: parseInt(process.env.REACT_APP_RETRY_DELAY_MS || '1000', 10)
    },
    // Logging and monitoring
    MONITORING: {
        ENABLE_ERROR_REPORTING: process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true',
        ENABLE_PERFORMANCE_MONITORING: process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true',
        LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL || (getEnvironment() === 'production' ? 'error' : 'debug'),
        ERROR_REPORTING_URL: process.env.REACT_APP_ERROR_REPORTING_URL,
        ANALYTICS_ENDPOINT: process.env.REACT_APP_ANALYTICS_ENDPOINT
    },
    // Fallback settings for when MeiliSearch is unavailable
    FALLBACK: {
        ENABLE_MOCK_DATA: getCurrentConfig().enableMockFallback,
        MOCK_DELAY_MS: parseInt(process.env.REACT_APP_MOCK_DELAY_MS || '500', 10),
        MOCK_RESULTS_COUNT: parseInt(process.env.REACT_APP_MOCK_RESULTS_COUNT || '5', 10),
        FALLBACK_MESSAGE: process.env.REACT_APP_FALLBACK_MESSAGE || 'Search service is temporarily unavailable. Showing sample results.',
        ENABLE_OFFLINE_MODE: process.env.REACT_APP_ENABLE_OFFLINE_MODE === 'true'
    }
};
// Configuration validation
export const validateConfig = () => {
    const errors = [];
    const config = MEILISEARCH_CONFIG;
    // Validate gateway URL
    if (!config.gatewayUrl) {
        errors.push('Gateway URL is not configured');
    }
    else {
        try {
            new URL(config.gatewayUrl);
        }
        catch {
            errors.push('Gateway URL is not a valid URL');
        }
    }
    // Validate timeouts
    if (config.requestTimeout <= 0) {
        errors.push('Request timeout must be positive');
    }
    if (config.healthCheckInterval <= 0) {
        errors.push('Health check interval must be positive');
    }
    // Validate search limits
    if (config.DEFAULT_SEARCH.LIMIT <= 0 || config.DEFAULT_SEARCH.LIMIT > 1000) {
        errors.push('Search limit must be between 1 and 1000');
    }
    // Production-specific validations
    if (config.IS_PRODUCTION) {
        if (config.enableMockFallback) {
            errors.push('Mock fallback should be disabled in production');
        }
        if (config.enableDebugLogging) {
            errors.push('Debug logging should be disabled in production');
        }
        if (config.gatewayUrl.includes('localhost') || config.gatewayUrl.includes('127.0.0.1')) {
            errors.push('Production should not use localhost URLs');
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
// Helper function to get configuration summary for debugging
export const getConfigSummary = () => {
    const config = MEILISEARCH_CONFIG;
    return {
        environment: config.ENVIRONMENT,
        gatewayUrl: config.gatewayUrl,
        indexName: config.INDEX.NAME,
        featuresEnabled: Object.entries(config.FEATURES)
            .filter(([, enabled]) => enabled)
            .map(([feature]) => feature),
        validationResult: validateConfig()
    };
};
export default MEILISEARCH_CONFIG;
