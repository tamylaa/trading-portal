// Type declarations for @tamyla/shared package
declare module '@tamyla/shared/utils' {
  export class ErrorHandler {
    constructor(configManager?: any);
    handle(error: any, context?: any): any;
  }

  export class Logger {
    constructor(name?: string);
    debug(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
  }
}

declare module '@tamyla/shared/api' {
  export class ApiClient {
    constructor(configManager?: any, options?: any);
    addRequestInterceptor(interceptor: Function): void;
    addResponseInterceptor(successInterceptor: Function, errorInterceptor?: Function): void;
    get(endpoint: string, config?: any): Promise<any>;
    post(endpoint: string, data?: any, config?: any): Promise<any>;
    put(endpoint: string, data?: any, config?: any): Promise<any>;
    delete(endpoint: string, config?: any): Promise<any>;
  }
}

declare module '@tamyla/shared/config' {
  export class ConfigManager {
    constructor(config?: any);
    get(key: string): any;
    getAll(): any;
  }
}

declare module '@tamyla/shared/auth' {
  export class AuthService {
    constructor(configManager?: any);
    getToken(): string | null;
    login(credentials: any): Promise<any>;
    logout(): Promise<any>;
  }
}

declare module '@tamyla/shared/events' {
  export class EventBus {
    constructor();
    emit(event: string, data?: any): void;
    on(event: string, handler: Function): () => void;
    addMiddleware(middleware: Function): void;
  }

  export const EVENT_TYPES: {
    HUB_READY: string;
    HUB_ERROR: string;
    [key: string]: string;
  };
}

declare module '@tamyla/shared' {
  export * from '@tamyla/shared/utils';
  export * from '@tamyla/shared/api';
  export * from '@tamyla/shared/config';
  export * from '@tamyla/shared/auth';
  export * from '@tamyla/shared/events';
  export * from '@tamyla/shared/types';

  // Convenience functions
  export function createHubApiClient(config?: any): any;
  export function createHubEventBus(): any;
  export const EVENT_TYPES: any;
}