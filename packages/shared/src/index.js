/**
 * Shared Package
 *
 * Main entry point for the shared utilities and services.
 */

// Configuration
export * from './config';

// Authentication
export * from './auth';

// Events
export * from './events';

// API
export * from './api';

// Types (re-export for JavaScript users)
export * from './types';

// Utils
export * from './utils';

// Convenience re-exports
export { default as config } from './config';
export { default as auth } from './auth';
export { default as events } from './events';
export { default as api } from './api';
export { default as utils } from './utils';