/**
 * Ultra-basic debug component that should definitely work
 * Will show even if other components fail
 */

import React from 'react';

const BasicDebug: React.FC = () => {
  React.useEffect(() => {
    // Add visible div to body as fallback
    const debugDiv = document.createElement('div');
    debugDiv.id = 'basic-debug';
    debugDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: red;
      color: white;
      padding: 10px;
      z-index: 999999;
      font-family: monospace;
      font-size: 12px;
      max-width: 300px;
      border: 2px solid white;
    `;
    
    debugDiv.innerHTML = `
      <div><strong>🔴 BASIC DEBUG ACTIVE</strong></div>
      <div>Location: ${window.location.href}</div>
      <div>User Agent: ${navigator.userAgent.substring(0, 50)}...</div>
      <div>React Version: ${React.version}</div>
      <div>NODE_ENV: ${process.env.NODE_ENV}</div>
    `;
    
    document.body.appendChild(debugDiv);
    
    // Test UI components import immediately
    const testUIComponents = async () => {
      try {
        console.log('🔍 Testing UI Components...');
        const components = await import('@tamyla/ui-components-react');
        console.log('✅ UI Components imported:', Object.keys(components));
        
        debugDiv.innerHTML += `<div style="color: lime;">✅ UI Components: OK</div>`;
        debugDiv.innerHTML += `<div>Components: ${Object.keys(components).length}</div>`;
        
        if (components.ButtonSuccess) {
          debugDiv.innerHTML += `<div style="color: lime;">✅ ButtonSuccess: Found</div>`;
        } else {
          debugDiv.innerHTML += `<div style="color: orange;">⚠️ ButtonSuccess: Missing</div>`;
        }
        
      } catch (error: any) {
        console.error('❌ UI Components failed:', error);
        debugDiv.innerHTML += `<div style="color: yellow;">❌ UI Import Error:</div>`;
        debugDiv.innerHTML += `<div style="font-size: 10px;">${error.message}</div>`;
      }
    };
    
    testUIComponents();
    
    return () => {
      const existing = document.getElementById('basic-debug');
      if (existing) {
        existing.remove();
      }
    };
  }, []);
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      left: 10,
      background: 'blue',
      color: 'white',
      padding: '5px',
      fontSize: '10px',
      zIndex: 999998
    }}>
      BasicDebug Component Loaded
    </div>
  );
};

export default BasicDebug;
