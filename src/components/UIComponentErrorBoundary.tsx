import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class UIComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('UI Component Error Boundary caught an error:', error, errorInfo);
    
    // Log specific info for GitHub Pages debugging
    console.log('Environment info:', {
      userAgent: navigator.userAgent,
      location: window.location.href,
      isGitHubPages: window.location.hostname.includes('github.io'),
      isCloudflare: document.querySelector('script[src*="cloudflare"]') !== null,
      moduleSupport: 'noModule' in HTMLScriptElement.prototype
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '20px',
          border: '2px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
          color: '#c53030',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          <h3>⚠️ UI Component Error</h3>
          <p><strong>Error:</strong> {this.state.error?.message}</p>
          <p><strong>Environment:</strong> {window.location.hostname}</p>
          <details>
            <summary>Error Details</summary>
            <pre style={{ fontSize: '10px', overflow: 'auto' }}>
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default UIComponentErrorBoundary;
