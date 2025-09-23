import MEILISEARCH_CONFIG from '../config/meilisearch';

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

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || this.config.gatewayUrl;
  }

  async checkHealth(): Promise<ServiceHealthStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeout);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const data = await response.json();

      const result = {
        gateway: response.ok ? 'online' : 'error',
        meilisearch: data.meilisearch?.status === 'available' ? 'online' : 'offline',
        timestamp: data.timestamp || new Date().toISOString(),
        details: {
          gatewayCode: response.status,
          meilisearchCode: data.meilisearch?.code,
          gatewayMessage: response.ok ? 'OK' : 'Gateway Error',
          meilisearchMessage: data.meilisearch?.message || 'Unknown'
        }
      } as ServiceHealthStatus;

      // Log health status in development
      if (this.config.enableDebugLogging) {
        console.log('Health check result:', result);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      
      if (this.config.enableDebugLogging) {
        console.error('Health check failed:', error);
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
      
      console.log('MeiliSearch still unavailable, retrying in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    return false;
  }
}

// Export a default instance
export const healthService = new HealthService();