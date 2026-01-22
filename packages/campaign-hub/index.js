/**
 * Campaign Hub Package
 *
 * A modular package for email campaign management and contact handling.
 */

// Components
export { EmailBlaster } from './components';

// API
export { campaignApi } from './api';

// Re-export default campaignApi for backward compatibility
export { default } from './api';