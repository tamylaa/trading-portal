/**
 * Alternative UI Components Loader
 * Tries different methods to load UI components without triggering CSP violations
 */

import React from 'react';

const AlternativeUILoader: React.FC = () => {
  const [loadResult, setLoadResult] = React.useState<any>({});
  
  React.useEffect(() => {
    const testAlternativeLoading = async () => {
      const results: any = {};
      
      // Method 1: Try dynamic import (current method)
      try {
        const dynamicComponents = await import('@tamyla/ui-components-react');
        results.dynamicImport = {
          success: true,
          componentsCount: Object.keys(dynamicComponents).length,
          hasButtonSuccess: !!dynamicComponents.ButtonSuccess
        };
      } catch (error: any) {
        results.dynamicImport = {
          success: false,
          error: error.message
        };
      }
      
      // Method 2: Try static import (already in bundle)
      try {
        // This will test if the components are pre-bundled
        results.staticImport = {
          note: 'UI components should be pre-bundled in main.js'
        };
      } catch (error: any) {
        results.staticImport = {
          success: false,
          error: error.message
        };
      }
      
      // Method 3: Check if we can create a simple React element without CSP issues
      try {
        const testElement = React.createElement('div', { 
          style: { 
            padding: '10px', 
            background: 'green', 
            color: 'white',
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: 999999
          } 
        }, 'FALLBACK BUTTON WORKING');
        
        results.fallbackElement = {
          success: true,
          note: 'Can create React elements without CSP issues'
        };
        
        // Actually render it
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = require('react-dom/client').createRoot(container);
        root.render(testElement);
        
      } catch (error: any) {
        results.fallbackElement = {
          success: false,
          error: error.message
        };
      }
      
      setLoadResult(results);
    };
    
    testAlternativeLoading();
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: '10px',
      background: 'purple',
      color: 'white',
      padding: '10px',
      fontSize: '11px',
      fontFamily: 'monospace',
      maxWidth: '300px',
      zIndex: 999998
    }}>
      <h4>🔄 Alternative UI Loading Test</h4>
      <pre style={{ fontSize: '9px', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(loadResult, null, 2)}
      </pre>
    </div>
  );
};

export default AlternativeUILoader;
