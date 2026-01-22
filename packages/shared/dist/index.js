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

// Note: types are provided via TypeScript declarations; avoid runtime re-export of types-only module
// (keeps JS runtime free from importing TS declaration-only files)

// Utils
export * from './utils';

// Convenience shims for default-like imports (provide module object)
import * as configModule from './config';
import * as authModule from './auth';
import * as eventsModule from './events';
import * as apiModule from './api';
import * as utilsModule from './utils';

export const config = configModule;
export const auth = authModule;
export const events = eventsModule;
export const api = apiModule;
export const utils = utilsModule;