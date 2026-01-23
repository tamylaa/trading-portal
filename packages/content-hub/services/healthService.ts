import MEILISEARCH_CONFIG from '../config/meilisearch';
import { ApiClient } from '@tamyla/shared/api';
import { Logger } from '@tamyla/shared/utils';
// NOTE: This service should be replaced with SharedContentHubService
// which provides health check functionality with shared infrastructure

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

export class HealthService {
  private baseUrl: string;
  private config = MEILISEARCH_CONFIG;
  private apiClient: any; // ApiClient from @tamyla/shared

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || this.config.gatewayUrl;
    this.apiClient = new ApiClient({ baseURL: this.baseUrl });
  }

  async checkHealth(): Promise<ServiceHealthStatus> {
    try {
      // Use ApiClient instead of fetch for consistent error handling and timeout management
      const response = await this.apiClient.get('/health', {
        timeout: this.config.requestTimeout
      });
      
      const data = response.data;

      const result = {
        gateway: response.status === 200 ? 'online' : 'error',
        meilisearch: data.meilisearch?.status === 'available' ? 'online' : 'offline',
        timestamp: data.timestamp || new Date().toISOString(),
        details: {
          gatewayCode: response.status,
          meilisearchCode: data.meilisearch?.code,
          gatewayMessage: response.status === 200 ? 'OK' : 'Gateway Error',
          meilisearchMessage: data.meilisearch?.message || 'Unknown'
        }
      } as ServiceHealthStatus;

      // Log health status in development
      if (this.config.enableDebugLogging) {
        Logger.debug('Health check result:', result);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      if (this.config.enableDebugLogging) {
        Logger.error('Health check failed:', error);
      }
      
      return {
        gateway: 'offline',
        meilisearch: 'offline', 
        timestamp: new Date().toISOString(),
        details: {
          gatewayMessage: errorMessage,
          meilisearchMessage: 'Cannot connect to gateway'
        }
      };
    }
  }

  async waitForMeilisearchRestore(maxWaitTimeMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 5000; // Check every 5 seconds

    while (Date.now() - startTime < maxWaitTimeMs) {
      const health = await this.checkHealth();
      if (health.meilisearch === 'online') {
        return true;
      }
      
      Logger.debug('MeiliSearch still unavailable, retrying in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    return false;
  }
}

// Export a default instance
export const healthService = new HealthService();