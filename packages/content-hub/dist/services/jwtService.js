// JWT Service for MeiliSearch Integration
// Handles JWT token validation and MeiliSearch-specific claims
import MEILISEARCH_CONFIG from '../config/meilisearch';
export class JWTService {
    constructor() {
        this.config = MEILISEARCH_CONFIG;
    }
    /**
     * Decode JWT token (client-side parsing, not verification)
     * Note: This is for reading claims only. Verification happens on the gateway.
     */
    decodeToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }
            const payload = parts[1];
            const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
            if (this.config.enableDebugLogging) {
                console.log('Decoded JWT claims:', decoded);
            }
            return decoded;
        }
        catch (error) {
            if (this.config.enableDebugLogging) {
                console.error('Failed to decode JWT token:', error);
            }
            return null;
        }
    }
    /**
     * Validate JWT token structure and claims for MeiliSearch
     */
    validateTokenForMeiliSearch(token) {
        const errors = [];
        if (!token) {
            errors.push('Token is required');
            return { isValid: false, errors };
        }
        const claims = this.decodeToken(token);
        if (!claims) {
            errors.push('Invalid token format');
            return { isValid: false, errors };
        }
        // Validate required claims
        if (!claims.sub) {
            errors.push('Missing subject (sub) claim');
        }
        if (!claims.userId && !claims.sub) {
            errors.push('Missing userId claim (required for document filtering)');
        }
        if (!claims.email) {
            errors.push('Missing email claim');
        }
        // Validate audience
        if (claims.aud !== this.config.SECURITY.JWT_AUDIENCE) {
            errors.push(`Invalid audience. Expected: ${this.config.SECURITY.JWT_AUDIENCE}, Got: ${claims.aud}`);
        }
        // Validate issuer
        if (claims.iss !== this.config.SECURITY.JWT_ISSUER) {
            errors.push(`Invalid issuer. Expected: ${this.config.SECURITY.JWT_ISSUER}, Got: ${claims.iss}`);
        }
        // Validate expiration
        const now = Math.floor(Date.now() / 1000);
        if (claims.exp && claims.exp < now) {
            errors.push('Token has expired');
        }
        // Validate issued at time
        if (claims.iat && claims.iat > now + 300) { // Allow 5 minutes clock skew
            errors.push('Token issued in the future');
        }
        return {
            isValid: errors.length === 0,
            errors,
            claims: errors.length === 0 ? claims : undefined
        };
    }
    /**
     * Check if token needs to be refreshed (expires soon)
     */
    needsRefresh(token, refreshThresholdMinutes = 15) {
        const claims = this.decodeToken(token);
        if (!claims || !claims.exp) {
            return true; // No expiration claim means we should refresh
        }
        const now = Math.floor(Date.now() / 1000);
        const threshold = refreshThresholdMinutes * 60;
        return claims.exp - now < threshold;
    }
    /**
     * Extract user ID for MeiliSearch filtering
     */
    getUserId(token) {
        const claims = this.decodeToken(token);
        return claims?.userId || claims?.sub || null;
    }
    /**
     * Create a test JWT token for development (client-side only)
     * Note: This should only be used in development for testing
     */
    createTestToken(userId, email, options = {}) {
        if (this.config.IS_PRODUCTION) {
            throw new Error('Test tokens cannot be created in production');
        }
        const now = Math.floor(Date.now() / 1000);
        const exp = now + (options.expiresInMinutes || 60) * 60; // Default 1 hour
        const header = {
            typ: 'JWT',
            alg: 'HS256'
        };
        const payload = {
            sub: userId,
            userId,
            email,
            aud: this.config.SECURITY.JWT_AUDIENCE,
            iss: this.config.SECURITY.JWT_ISSUER,
            iat: now,
            exp,
            permissions: options.permissions || ['search'],
            scope: options.scope || 'search'
        };
        // Base64 encode (this is not cryptographically signed - for testing only!)
        const encodedHeader = btoa(JSON.stringify(header));
        const encodedPayload = btoa(JSON.stringify(payload));
        const signature = 'test-signature'; // Not a real signature!
        const testToken = `${encodedHeader}.${encodedPayload}.${signature}`;
        if (this.config.enableDebugLogging) {
            console.warn('Created test JWT token (development only):', {
                userId,
                email,
                claims: payload,
                token: testToken
            });
        }
        return testToken;
    }
    /**
     * Get token expiration date
     */
    getTokenExpiration(token) {
        const claims = this.decodeToken(token);
        if (!claims?.exp) {
            return null;
        }
        return new Date(claims.exp * 1000);
    }
    /**
     * Get token claims summary for debugging
     */
    getTokenSummary(token) {
        const claims = this.decodeToken(token);
        if (!claims) {
            return { valid: false, error: 'Invalid token' };
        }
        const now = new Date();
        const issuedAt = claims.iat ? new Date(claims.iat * 1000) : null;
        const expiresAt = claims.exp ? new Date(claims.exp * 1000) : null;
        const isExpired = expiresAt ? expiresAt < now : false;
        const needsRefresh = this.needsRefresh(token);
        return {
            valid: true,
            userId: claims.userId || claims.sub,
            email: claims.email,
            audience: claims.aud,
            issuer: claims.iss,
            issuedAt,
            expiresAt,
            isExpired,
            needsRefresh,
            permissions: claims.permissions,
            scope: claims.scope
        };
    }
}
// Export a default instance
export const jwtService = new JWTService();
// Helper function to validate current auth token for MeiliSearch
export const validateCurrentAuthToken = (authToken) => {
    if (!authToken) {
        return {
            isValid: false,
            errors: ['No authentication token provided'],
            needsLogin: true
        };
    }
    const validation = jwtService.validateTokenForMeiliSearch(authToken);
    if (!validation.isValid) {
        return {
            ...validation,
            needsLogin: validation.errors.some(error => error.includes('expired') ||
                error.includes('Invalid token') ||
                error.includes('audience') ||
                error.includes('issuer'))
        };
    }
    return {
        ...validation,
        needsLogin: false,
        needsRefresh: jwtService.needsRefresh(authToken)
    };
};
