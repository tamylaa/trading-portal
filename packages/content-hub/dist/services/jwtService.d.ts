export interface MeiliSearchJWTClaims {
    sub: string;
    email: string;
    aud: string;
    iss: string;
    iat: number;
    exp: number;
    userId: string;
    permissions?: string[];
    scope?: string;
}
export declare class JWTService {
    private config;
    /**
     * Decode JWT token (client-side parsing, not verification)
     * Note: This is for reading claims only. Verification happens on the gateway.
     */
    decodeToken(token: string): MeiliSearchJWTClaims | null;
    /**
     * Validate JWT token structure and claims for MeiliSearch
     */
    validateTokenForMeiliSearch(token: string): {
        isValid: boolean;
        errors: string[];
        claims?: MeiliSearchJWTClaims;
    };
    /**
     * Check if token needs to be refreshed (expires soon)
     */
    needsRefresh(token: string, refreshThresholdMinutes?: number): boolean;
    /**
     * Extract user ID for MeiliSearch filtering
     */
    getUserId(token: string): string | null;
    /**
     * Create a test JWT token for development (client-side only)
     * Note: This should only be used in development for testing
     */
    createTestToken(userId: string, email: string, options?: {
        expiresInMinutes?: number;
        permissions?: string[];
        scope?: string;
    }): string;
    /**
     * Get token expiration date
     */
    getTokenExpiration(token: string): Date | null;
    /**
     * Get token claims summary for debugging
     */
    getTokenSummary(token: string): {
        valid: boolean;
        error: string;
        userId?: undefined;
        email?: undefined;
        audience?: undefined;
        issuer?: undefined;
        issuedAt?: undefined;
        expiresAt?: undefined;
        isExpired?: undefined;
        needsRefresh?: undefined;
        permissions?: undefined;
        scope?: undefined;
    } | {
        valid: boolean;
        userId: string;
        email: string;
        audience: string;
        issuer: string;
        issuedAt: Date | null;
        expiresAt: Date | null;
        isExpired: boolean;
        needsRefresh: boolean;
        permissions: string[] | undefined;
        scope: string | undefined;
        error?: undefined;
    };
}
export declare const jwtService: JWTService;
export declare const validateCurrentAuthToken: (authToken: string | null) => {
    needsLogin: boolean;
    isValid: boolean;
    errors: string[];
    claims?: MeiliSearchJWTClaims;
} | {
    needsLogin: boolean;
    needsRefresh: boolean;
    isValid: boolean;
    errors: string[];
    claims?: MeiliSearchJWTClaims;
};
//# sourceMappingURL=jwtService.d.ts.map