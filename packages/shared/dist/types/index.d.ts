/**
 * Shared Type Definitions
 *
 * TypeScript interfaces and types for hub interoperability and external integration.
 */

// Configuration Types
export interface Config {
  api: ApiConfig;
  auth: AuthConfig;
  ui: UiConfig;
  features: FeatureFlags;
  performance: PerformanceConfig;
  errorHandling: ErrorHandlingConfig;
  integrations: IntegrationConfig;
  [key: string]: any;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
}

export interface AuthConfig {
  tokenStorage: 'localStorage' | 'sessionStorage';
  tokenKey: string;
  refreshTokenKey: string;
  autoRefresh: boolean;
  refreshThreshold: number;
}

export interface UiConfig {
  theme: string;
  language: string;
  enableAnimations: boolean;
  enableKeyboardShortcuts: boolean;
  [key: string]: any;
}

export interface FeatureFlags {
  analytics: boolean;
  notifications: boolean;
  logging: boolean;
  [key: string]: boolean;
}

export interface PerformanceConfig {
  cacheEnabled: boolean;
  cacheTTL: number;
  lazyLoading: boolean;
  virtualizationThreshold: number;
}

export interface ErrorHandlingConfig {
  showUserFriendlyMessages: boolean;
  logErrors: boolean;
  reportErrors: boolean;
  errorReportingUrl: string;
}

export interface IntegrationConfig {
  enabled: boolean;
  [key: string]: any;
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  metadata?: Record<string, any>;
}

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

// Event Types
export interface Event {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  source: string;
  target?: string;
  metadata?: Record<string, any>;
}

export interface EventListener {
  id: string;
  callback: (event: Event) => void | Promise<void>;
  once: boolean;
  priority: number;
  context?: any;
}

export interface EventBus {
  on(event: string, listener: (event: Event) => void, options?: EventOptions): () => void;
  once(event: string, listener: (event: Event) => void, options?: EventOptions): () => void;
  off(event: string, listenerId: string): boolean;
  emit(event: string, data?: any, options?: EventEmitOptions): Promise<void>;
  waitFor(event: string, timeout?: number): Promise<Event>;
}

export interface EventOptions {
  id?: string;
  once?: boolean;
  priority?: number;
  context?: any;
}

export interface EventEmitOptions {
  source?: string;
  target?: string;
  metadata?: Record<string, any>;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

export interface ApiClient {
  get<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: any): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, config?: any): Promise<ApiResponse<T>>;
  upload(url: string, file: File, onProgress?: (progress: number) => void, config?: any): Promise<ApiResponse>;
  download(url: string, filename?: string, config?: any): Promise<Blob>;
}

// Hub Types
export interface Hub {
  id: string;
  name: string;
  version: string;
  type: string;
  config: Config;
  capabilities: string[];
  dependencies: string[];
  status: HubStatus;
}

export type HubStatus = 'initializing' | 'ready' | 'error' | 'destroyed';

export interface HubContext {
  hub: Hub;
  config: Config;
  auth: AuthState;
  eventBus: EventBus;
  apiClient: ApiClient;
}

export interface HubComponentProps {
  config?: Partial<Config>;
  onEvent?: (event: Event) => void;
  context?: HubContext;
  [key: string]: any;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ConfigurationUpdate = DeepPartial<Config>;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

// Integration Types
export interface Integration {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  enabled: boolean;
  status: IntegrationStatus;
}

export type IntegrationStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface IntegrationEvent extends Event {
  integrationId: string;
  integrationType: string;
}

// Storage Types
export interface StorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface Cache {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

// Logging Types
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error?: Error, context?: Record<string, any>): void;
}

// Common Event Types
export declare const COMMON_EVENTS: {
  // Lifecycle
  readonly INIT: 'hub:init';
  readonly READY: 'hub:ready';
  readonly DESTROY: 'hub:destroy';

  // Authentication
  readonly AUTH_LOGIN: 'auth:login';
  readonly AUTH_LOGOUT: 'auth:logout';
  readonly AUTH_ERROR: 'auth:error';

  // Data
  readonly DATA_LOAD: 'data:load';
  readonly DATA_UPDATE: 'data:update';
  readonly DATA_DELETE: 'data:delete';

  // UI
  readonly UI_NAVIGATE: 'ui:navigate';
  readonly UI_MODAL_OPEN: 'ui:modalOpen';
  readonly UI_MODAL_CLOSE: 'ui:modalClose';

  // Errors
  readonly ERROR: 'hub:error';
  readonly API_ERROR: 'api:error';
};