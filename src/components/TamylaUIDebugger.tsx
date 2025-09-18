import React, { useEffect, useState } from 'react';

const TamylaUIDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkTamylaUI = async () => {
      try {
        console.log('🔍 Debugging Tamyla UI Components...');
        
        // Try to import the UI components
        const uiComponents = await import('@tamyla/ui-components-react');
        console.log('✅ UI Components imported:', uiComponents);
        
        // Test if ButtonSuccess can actually be instantiated
        let renderTest = 'Not tested';
        try {
          const { ButtonSuccess } = uiComponents;
          // Try to create a React element (not render it, just create)
          const testElement = React.createElement(ButtonSuccess, { children: 'Test' });
          renderTest = 'Element creation successful';
          console.log('✅ ButtonSuccess element creation successful:', testElement);
        } catch (renderError: any) {
          console.error('❌ ButtonSuccess render test failed:', renderError);
          renderTest = `Render error: ${renderError.message}`;
        }
        
        setDebugInfo({
          imported: true,
          components: Object.keys(uiComponents),
          ButtonSuccess: !!uiComponents.ButtonSuccess,
          TamylaThemeProvider: !!uiComponents.TamylaThemeProvider,
          version: (uiComponents as any).VERSION || 'unknown',
          renderTest: renderTest
        });
        
      } catch (err: any) {
        console.error('❌ UI Components import failed:', err);
        setError(err.message);
        setDebugInfo({
          imported: false,
          error: err.message,
          stack: err.stack
        });
      }
    };

    checkTamylaUI();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '20px',
      zIndex: 9999,
      maxWidth: '400px',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3>🔍 Tamyla UI Debug Info</h3>
      {error && (
        <div style={{ color: '#ff6b6b', marginBottom: '10px' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}
      <pre style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      
      <div style={{ marginTop: '10px' }}>
        <strong>CSP Check:</strong>
        <div>unsafe-eval: {document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content')?.includes('unsafe-eval') ? '✅' : '❌'}</div>
      </div>
    </div>
  );
};

export default TamylaUIDebugger;
