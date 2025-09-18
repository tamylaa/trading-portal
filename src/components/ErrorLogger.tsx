/**
 * Error logger for GitHub Pages debugging
 * Catches and displays all JavaScript errors
 */

import React from 'react';

const ErrorLogger: React.FC = () => {
  const [errors, setErrors] = React.useState<any[]>([]);
  
  React.useEffect(() => {
    // Capture console errors
    const originalError = console.error;
    console.error = (...args) => {
      setErrors(prev => [...prev, {
        type: 'console.error',
        message: args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' '),
        timestamp: new Date().toISOString()
      }]);
      originalError.apply(console, args);
    };
    
    // Capture unhandled errors
    const handleError = (event: ErrorEvent) => {
      setErrors(prev => [...prev, {
        type: 'unhandled',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString()
      }]);
    };
    
    // Capture unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      setErrors(prev => [...prev, {
        type: 'promise_rejection',
        message: event.reason?.toString() || 'Promise rejected',
        timestamp: new Date().toISOString()
      }]);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      console.error = originalError;
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);
  
  if (errors.length === 0) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'rgba(255, 0, 0, 0.9)',
      color: 'white',
      padding: '10px',
      maxWidth: '100vw',
      maxHeight: '200px',
      overflow: 'auto',
      fontSize: '11px',
      fontFamily: 'monospace',
      zIndex: 10001
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>
        🚨 JavaScript Errors ({errors.length})
      </h3>
      {errors.slice(-5).map((error, index) => (
        <div key={index} style={{ 
          marginBottom: '5px', 
          padding: '5px', 
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '3px'
        }}>
          <strong>{error.type}</strong>: {error.message}
          {error.filename && <div>File: {error.filename}:{error.lineno}:{error.colno}</div>}
          <div style={{ fontSize: '9px', opacity: 0.7 }}>{error.timestamp}</div>
        </div>
      ))}
    </div>
  );
};

export default ErrorLogger;
