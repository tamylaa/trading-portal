// Progressive enhancement wrapper for EmailBlaster
// This allows gradual migration to enhanced components while keeping originals working

import React from 'react';
import { FEATURE_FLAGS, getComponentFeatures } from '../config/features';

// Import types for enhanced version (when they exist)
// import type { 
//   EnhancedEmailBlasterProps,
//   ProgressiveEmailBlasterProps 
// } from './enhanced/index';

// Props that work with both original and enhanced versions
interface EmailBlasterWrapperProps {
  onClose?: () => void;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  // Add any other props that the original component accepts
  [key: string]: any;
}

interface ProgressiveEmailBlasterProps extends EmailBlasterWrapperProps {
  useLegacyMode?: boolean; // Fallback to original component
}

/**
 * Progressive EmailBlaster Component
 * 
 * This wrapper provides a seamless transition between the original EmailBlaster
 * and enhanced modular components based on feature flags.
 * 
 * Usage:
 * - By default, uses original EmailBlaster (zero breaking changes)
 * - When features are enabled, progressively enhances functionality
 * - Can be forced to use specific version via props
 */
export const ProgressiveEmailBlaster: React.FC<ProgressiveEmailBlasterProps> = ({
  useLegacyMode,
  ...props
}) => {
  const features = getComponentFeatures('EmailBlaster');
  
  // Determine which version to use
  const shouldUseEnhanced = useLegacyMode === false || 
    (useLegacyMode !== true && features.useEnhanced);

  if (shouldUseEnhanced && FEATURE_FLAGS.useEnhancedEmailBlaster) {
    // Load enhanced version when feature is enabled
    const EnhancedEmailBlaster = React.lazy(() => 
      import('./enhanced/email/EnhancedEmailBlaster').then(module => ({
        default: module.EnhancedEmailBlaster as React.ComponentType<any>
      })).catch(() => {
        // Fallback to original if enhanced version fails to load
        console.warn('Enhanced EmailBlaster failed to load, using original');
        return import('./content/EmailBlaster').then(module => ({
          default: module.EmailBlaster as React.ComponentType<any>
        }));
      })
    );
    
    return (
      <React.Suspense fallback={<div>Loading enhanced email composer...</div>}>
        <EnhancedEmailBlaster {...props} />
      </React.Suspense>
    );
  }
  
  // Default: use original EmailBlaster (guaranteed to work)
  const { EmailBlaster } = require('./content/EmailBlaster');
  return <EmailBlaster {...props} />;
};

// TODO: Re-export original for direct imports (when module exists)
// export { EmailBlaster } from './content/EmailBlaster';

// Default export for drop-in replacement
export default ProgressiveEmailBlaster;
