export interface ServiceHealthStatus {
    gateway: 'online' | 'offline' | 'error';
    meilisearch: 'online' | 'offline' | 'error';
    timestamp: string;
    details?: {
        gatewayCode?: number;
        meilisearchCode?: number;
        gatewayMessage?: string;
        meilisearchMessage?: string;
    };
}
export declare class HealthService {
    private baseUrl;
    private config;
    constructor(baseUrl?: string);
    checkHealth(): Promise<ServiceHealthStatus>;
    waitForMeilisearchRestore(maxWaitTimeMs?: number): Promise<boolean>;
}
export declare const healthService: HealthService;
//# sourceMappingURL=healthService.d.ts.map