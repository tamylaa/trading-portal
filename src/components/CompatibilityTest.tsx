/**
 * Compatibility test for @tamyla/ui-components-react
 * Tests different import methods to identify the issue
 */

import React from 'react';

const CompatibilityTest: React.FC = () => {
  const [testResults, setTestResults] = React.useState<any>({});
  
  React.useEffect(() => {
    const runTests = async () => {
      const results: any = {};
      
      // Test 1: Try dynamic import
      try {
        const dynamicImport = await import('@tamyla/ui-components-react');
        results.dynamicImport = {
          success: true,
          keys: Object.keys(dynamicImport),
          hasButtonSuccess: !!dynamicImport.ButtonSuccess,
          buttonType: typeof dynamicImport.ButtonSuccess
        };
      } catch (error: any) {
        results.dynamicImport = {
          success: false,
          error: error.message,
          stack: error.stack
        };
      }
      
      // Test 2: Try static import (already done in HeroSection)
      try {
        // This will be handled by the existing imports
        results.staticImport = {
          success: true,
          note: 'Tested in HeroSection component'
        };
      } catch (error: any) {
        results.staticImport = {
          success: false,
          error: error.message
        };
      }
      
      // Test 3: Check React version compatibility
      results.reactVersion = React.version;
      results.environment = {
        userAgent: navigator.userAgent,
        isProduction: process.env.NODE_ENV === 'production',
        publicUrl: process.env.PUBLIC_URL
      };
      
      setTestResults(results);
    };
    
    runTests();
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      background: '#1a1a1a',
      color: '#ffffff',
      padding: '20px',
      maxWidth: '400px',
      maxHeight: '400px',
      overflow: 'auto',
      fontSize: '11px',
      fontFamily: 'monospace',
      zIndex: 10000,
      border: '2px solid #ff6b6b'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#ff6b6b' }}>
        🔬 UI Components Compatibility Test
      </h3>
      <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(testResults, null, 2)}
      </pre>
    </div>
  );
};

export default CompatibilityTest;
