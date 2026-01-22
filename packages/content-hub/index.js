/**
 * Content Hub Package
 *
 * Self-contained content management with complete UI/UX, logic, service integration,
 * state management, capability injection, styling, and themes.
 */

// MAIN SELF-CONTAINED COMPONENT - The complete solution
export { ContentHub } from './src/HyperContentHub';

// LAYOUT COMPONENTS - For custom implementations  
export { TabbedLayout, SidebarLayout, SingleViewLayout } from './src/layouts';

// LEGACY COMPONENTS - Backward compatibility
export { ContentManager } from './components/ContentManager';
export { ContentSharing } from './components/ContentSharing';
export { ContentAccess } from './components/ContentAccess';

// UTILITY COMPONENTS - Generic reusable components
export { MarkdownContent, MultiMarkdownContent } from './components/MarkdownContent';
export { default as LoadingSpinner } from './components/common/LoadingSpinner';
export { default as FAQ } from './components/FAQ';

// SEARCH COMPONENTS - Comprehensive search UI toolkit
export { 
  SearchResults, 
  RecentSearches, 
  SearchStatus 
} from './components/search';

// APIs
export { contentApi, emailApi } from './api';

// Services (for advanced usage)
export { ContentSearchService } from './dist/services/contentSearchService';
export { HealthService, healthService } from './dist/services/healthService';
export { JWTService, jwtService, validateCurrentAuthToken } from './dist/services/jwtService';

// Hooks (for advanced usage - power users who need custom implementations)
export { useContentSearch, useRecentSearches, useSearchStatus } from './hooks';

// Configuration & Types
export { MEILISEARCH_CONFIG } from './dist/config/meilisearch';
export * from './dist/types';

// Domain Configurations - Pre-built filter sets for common use cases
export const DOMAIN_CONFIGS = {
  // Generic content filters (works for any app)
  GENERIC: {
    CONTENT_TYPES: [
      { value: 'image', label: 'Images' },
      { value: 'video', label: 'Videos' },
      { value: 'document', label: 'Documents' },
      { value: 'audio', label: 'Audio' }
    ],
    DATE_RANGES: [
      { value: 'today', label: 'Today' },
      { value: 'week', label: 'This Week' },
      { value: 'month', label: 'This Month' },
      { value: 'all', label: 'All Time' }
    ],
    FILE_SIZES: [
      { value: 'small', label: 'Small (< 1MB)' },
      { value: 'medium', label: 'Medium (1-10MB)' },
      { value: 'large', label: 'Large (> 10MB)' }
    ]
  },

  // Trading domain - comprehensive filters for trading applications
  TRADING: {
    DOCUMENT_TYPES: [
      { value: 'contract', label: 'Contracts' },
      { value: 'certificate', label: 'Certificates' },
      { value: 'invoice', label: 'Invoices' },
      { value: 'compliance', label: 'Compliance Documents' },
      { value: 'shipment', label: 'Shipping Documents' },
      { value: 'customs', label: 'Customs Forms' },
      { value: 'insurance', label: 'Insurance Documents' },
      { value: 'inspection', label: 'Inspection Reports' }
    ],
    TRADE_TYPES: [
      { value: 'import', label: 'Import' },
      { value: 'export', label: 'Export' },
      { value: 'domestic', label: 'Domestic' },
      { value: 'transit', label: 'Transit' },
      { value: 're-export', label: 'Re-export' }
    ],
    REGIONS: [
      { value: 'africa', label: 'Africa' },
      { value: 'asia', label: 'Asia' },
      { value: 'europe', label: 'Europe' },
      { value: 'americas', label: 'Americas' },
      { value: 'oceania', label: 'Oceania' },
      { value: 'middle-east', label: 'Middle East' }
    ],
    PRODUCT_CATEGORIES: [
      { value: 'agriculture', label: 'Agricultural Products' },
      { value: 'minerals', label: 'Minerals & Mining' },
      { value: 'textiles', label: 'Textiles & Apparel' },
      { value: 'electronics', label: 'Electronics' },
      { value: 'machinery', label: 'Machinery & Equipment' },
      { value: 'chemicals', label: 'Chemicals' }
    ],
    CURRENCIES: [
      { value: 'USD', label: 'US Dollar (USD)' },
      { value: 'EUR', label: 'Euro (EUR)' },
      { value: 'GBP', label: 'British Pound (GBP)' },
      { value: 'JPY', label: 'Japanese Yen (JPY)' },
      { value: 'CAD', label: 'Canadian Dollar (CAD)' },
      { value: 'AUD', label: 'Australian Dollar (AUD)' }
    ],
    STATUS: [
      { value: 'draft', label: 'Draft' },
      { value: 'pending', label: 'Pending Approval' },
      { value: 'approved', label: 'Approved' },
      { value: 'in-transit', label: 'In Transit' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ]
  },

  // Healthcare domain - for medical/healthcare applications
  HEALTHCARE: {
    DOCUMENT_TYPES: [
      { value: 'patient-record', label: 'Patient Records' },
      { value: 'lab-report', label: 'Lab Reports' },
      { value: 'imaging', label: 'Medical Imaging' },
      { value: 'prescription', label: 'Prescriptions' },
      { value: 'insurance', label: 'Insurance Claims' }
    ],
    DEPARTMENTS: [
      { value: 'cardiology', label: 'Cardiology' },
      { value: 'neurology', label: 'Neurology' },
      { value: 'oncology', label: 'Oncology' },
      { value: 'pediatrics', label: 'Pediatrics' },
      { value: 'emergency', label: 'Emergency' }
    ]
  },

  // Legal domain - for legal/law firm applications
  LEGAL: {
    DOCUMENT_TYPES: [
      { value: 'contract', label: 'Contracts' },
      { value: 'brief', label: 'Legal Briefs' },
      { value: 'motion', label: 'Court Motions' },
      { value: 'discovery', label: 'Discovery Documents' },
      { value: 'correspondence', label: 'Legal Correspondence' }
    ],
    PRACTICE_AREAS: [
      { value: 'corporate', label: 'Corporate Law' },
      { value: 'litigation', label: 'Litigation' },
      { value: 'intellectual-property', label: 'IP Law' },
      { value: 'employment', label: 'Employment Law' },
      { value: 'real-estate', label: 'Real Estate' }
    ]
  }
};

// Re-export default contentApi for backward compatibility
export { default } from './api';