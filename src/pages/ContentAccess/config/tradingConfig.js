/**
 * Trading Configuration for Content Hub
 * 
 * Domain-specific configurations for the trading portal.
 * These extend and customize the base DOMAIN_CONFIGS.TRADING from Content Hub.
 */

export const TRADING_FILTERS = {
  // Additional priority filter specific to this trading application
  PRIORITY: [
    { value: 'urgent', label: '🔴 Urgent' },
    { value: 'high', label: '🟡 High Priority' },
    { value: 'medium', label: '🟢 Medium Priority' },
    { value: 'low', label: '⚪ Low Priority' }
  ],

  // Custom compliance levels for this trading portal
  COMPLIANCE_LEVELS: [
    { value: 'level-1', label: 'Level 1 - Basic' },
    { value: 'level-2', label: 'Level 2 - Enhanced' },
    { value: 'level-3', label: 'Level 3 - Comprehensive' },
    { value: 'aeo', label: 'AEO Certified' }
  ],

  // Specific to this trading portal's workflow
  APPROVAL_STAGES: [
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'Under Review' },
    { value: 'compliance-check', label: 'Compliance Check' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'archived', label: 'Archived' }
  ]
};

export const TRADING_UI_CONFIG = {
  placeholder: "Search contracts, invoices, compliance documents...",
  maxRecentSearches: 10,
  enableAdvancedSearch: true,
  showFilePreview: true
};

export const TRADING_ANALYTICS_CONFIG = {
  trackSearches: true,
  trackDownloads: true,
  trackViews: true,
  complianceLogging: true
};