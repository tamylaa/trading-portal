interface EnvironmentConfig {
    gatewayUrl: string;
    enableHealthChecks: boolean;
    enableMockFallback: boolean;
    enableDebugLogging: boolean;
    healthCheckInterval: number;
    requestTimeout: number;
}
interface MeiliSearchEnvironment {
    development: EnvironmentConfig;
    staging: EnvironmentConfig;
    production: EnvironmentConfig;
}
export declare const MEILISEARCH_CONFIG: {
    ENVIRONMENT: keyof MeiliSearchEnvironment;
    IS_DEVELOPMENT: boolean;
    IS_STAGING: boolean;
    IS_PRODUCTION: boolean;
    DEFAULT_SEARCH: {
        LIMIT: number;
        OFFSET: number;
        ATTRIBUTES_TO_HIGHLIGHT: string[];
        ATTRIBUTES_TO_RETRIEVE: string[];
        MAX_RESULTS: number;
        DEBOUNCE_MS: number;
    };
    INDEX: {
        NAME: string;
        SEARCHABLE_ATTRIBUTES: string[];
        FILTERABLE_ATTRIBUTES: string[];
        SORTABLE_ATTRIBUTES: string[];
    };
    TRADING_FILTERS: {
        DOCUMENT_TYPES: string[];
        TRADE_TYPES: string[];
        PRODUCT_CATEGORIES: string[];
        REGIONS: string[];
        CURRENCIES: string[];
        TRADE_TERMS: string[];
    };
    FEATURES: {
        ADVANCED_SEARCH: boolean;
        FACETED_SEARCH: boolean;
        SEARCH_ANALYTICS: boolean;
        AUTO_COMPLETE: boolean;
        SEARCH_SUGGESTIONS: boolean;
        BULK_OPERATIONS: boolean;
    };
    SECURITY: {
        ENABLE_JWT_VALIDATION: boolean;
        JWT_AUDIENCE: string;
        JWT_ISSUER: string;
        CORS_ORIGINS: string[];
        MAX_SEARCH_QUERIES_PER_MINUTE: number;
        ENABLE_REQUEST_SANITIZATION: boolean;
    };
    PERFORMANCE: {
        CACHE_TTL_MS: number;
        ENABLE_REQUEST_CACHING: boolean;
        ENABLE_RESULT_CACHING: boolean;
        MAX_CONCURRENT_REQUESTS: number;
        RETRY_ATTEMPTS: number;
        RETRY_DELAY_MS: number;
    };
    MONITORING: {
        ENABLE_ERROR_REPORTING: boolean;
        ENABLE_PERFORMANCE_MONITORING: boolean;
        LOG_LEVEL: string;
        ERROR_REPORTING_URL: string | undefined;
        ANALYTICS_ENDPOINT: string | undefined;
    };
    FALLBACK: {
        ENABLE_MOCK_DATA: boolean;
        MOCK_DELAY_MS: number;
        MOCK_RESULTS_COUNT: number;
        FALLBACK_MESSAGE: string;
        ENABLE_OFFLINE_MODE: boolean;
    };
    gatewayUrl: string;
    enableHealthChecks: boolean;
    enableMockFallback: boolean;
    enableDebugLogging: boolean;
    healthCheckInterval: number;
    requestTimeout: number;
};
export declare const validateConfig: () => {
    isValid: boolean;
    errors: string[];
};
export declare const getConfigSummary: () => {
    environment: keyof MeiliSearchEnvironment;
    gatewayUrl: string;
    indexName: string;
    featuresEnabled: string[];
    validationResult: {
        isValid: boolean;
        errors: string[];
    };
};
export default MEILISEARCH_CONFIG;
//# sourceMappingURL=meilisearch.d.ts.map