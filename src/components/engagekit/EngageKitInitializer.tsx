import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    EngageKit?: {
      init: (config: any) => void;
    };
  }
}

const EngageKitInitializer: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Only initialize on story detail pages
    if (location.pathname.startsWith('/stories/')) {
      // Check if EngageKit is loaded
      if (window.EngageKit) {
        console.log('Initializing EngageKit...');
        window.EngageKit.init({
          accountId: 'demo-account', // Replace with actual account ID
          modules: {
            highlighter: {
              enabled: true,
              highlightColor: '#ffeb3b',
              minSelectionLength: 3,
              showToolbar: true,
              toolbarPosition: 'above',
            },
            readingProgress: {
              enabled: true,
              height: '4px',
              color: '#4CAF50',
              zIndex: 9999,
            },
          },
        });
      } else {
        console.warn('EngageKit not found. Make sure the EngageKit script is loaded.');
      }
    }
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default EngageKitInitializer;
