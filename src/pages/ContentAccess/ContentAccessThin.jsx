/**
 * Trading Portal ContentAccess - Thin Configuration Wrapper
 * 
 * This is a minimal wrapper that configures the Content Hub ContentAccess component
 * specifically for the trading portal application.
 */
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ContentAccess as ContentHubAccess, DOMAIN_CONFIGS } from '@tamyla/content-hub';
import { TRADING_FILTERS, TRADING_UI_CONFIG, TRADING_ANALYTICS_CONFIG } from './config/tradingConfig';

const ContentAccess = () => {
  const { user, token } = useAuth();

  // Trading-specific configuration
  const tradingConfig = {
    // Use pre-built trading domain configuration
    domainConfig: 'TRADING',
    
    // Additional custom filters specific to this trading portal
    customFilters: [
      {
        label: 'Priority',
        type: 'select',
        options: TRADING_FILTERS.PRIORITY
      },
      {
        label: 'Compliance Level',
        type: 'select',
        options: TRADING_FILTERS.COMPLIANCE_LEVELS
      },
      {
        label: 'Approval Stage',
        type: 'select',
        options: TRADING_FILTERS.APPROVAL_STAGES
      }
    ],

    // UI customization for trading context
    ...TRADING_UI_CONFIG,
    
    // Trading-specific callbacks with analytics
    onFileViewed: (file) => {
      if (TRADING_ANALYTICS_CONFIG.trackViews) {
        console.log('Trading document viewed:', file);
        // Add trading-specific analytics or logging
      }
    },
    
    onFileDownloaded: (file) => {
      if (TRADING_ANALYTICS_CONFIG.trackDownloads) {
        console.log('Trading document downloaded:', file);
        // Add compliance tracking for trading documents
      }
    },
    
    onSearchPerformed: (query, results) => {
      if (TRADING_ANALYTICS_CONFIG.trackSearches) {
        console.log('Trading search performed:', query, results?.length);
        // Add trading-specific search analytics
      }
    },
    
    onError: (error) => {
      console.error('Trading ContentAccess error:', error);
      // Add trading-specific error handling
    }
  };

  return (
    <div className="trading-content-access">
      <div className="content-access-header">
        <h1>🔍 Trading Document Access</h1>
        <p>Search and access your trading documents, contracts, and compliance files</p>
      </div>
      
      <ContentHubAccess
        authToken={token}
        currentUser={user}
        {...tradingConfig}
        className="trading-content-hub"
      />
    </div>
  );
};

export default ContentAccess;