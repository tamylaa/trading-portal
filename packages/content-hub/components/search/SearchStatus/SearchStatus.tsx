import React, { memo } from 'react';

export interface SearchStatusProps {
  isConnected?: boolean;
  searchService?: 'connected' | 'disconnected' | 'loading';
  database?: 'ready' | 'error' | 'loading';
  analytics?: 'active' | 'inactive';
  className?: string;
  customServices?: Array<{
    name: string;
    status: string;
    displayName: string;
  }>;
}

const SearchStatus: React.FC<SearchStatusProps> = memo(({ 
  isConnected = true,
  searchService = 'connected',
  database = 'ready',
  analytics = 'active',
  className = '',
  customServices = []
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'ready':
      case 'active':
        return (
          <svg className="status-icon success" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'loading':
        return (
          <svg className="status-icon loading" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
      case 'disconnected':
      case 'error':
      case 'inactive':
      default:
        return (
          <svg className="status-icon error" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
        );
    }
  };

  const getStatusText = (service: string, status: string) => {
    const statusMap: Record<string, Record<string, string>> = {
      searchService: {
        connected: 'Search Service Online',
        disconnected: 'Search Service Offline',
        loading: 'Connecting to Search Service...'
      },
      database: {
        ready: 'Database Ready',
        error: 'Database Error',
        loading: 'Database Loading...'
      },
      analytics: {
        active: 'Analytics Active',
        inactive: 'Analytics Disabled'
      }
    };
    
    return statusMap[service]?.[status] || `${service}: ${status}`;
  };

  const getOverallStatus = () => {
    if (!isConnected) return 'Offline';
    if (searchService === 'loading' || database === 'loading') return 'Loading';
    if (searchService === 'disconnected' || database === 'error') return 'Error';
    
    // Check custom services
    for (const service of customServices) {
      if (service.status === 'loading') return 'Loading';
      if (service.status === 'error' || service.status === 'disconnected') return 'Error';
    }
    
    return 'Online';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className={`search-status search-status--${overallStatus.toLowerCase()} ${className}`}>
      <div className="status-header">
        <div className="status-indicator">
          {getStatusIcon(overallStatus.toLowerCase())}
          <span className="status-text">System {overallStatus}</span>
        </div>
      </div>
      
      <div className="status-details">
        <div className="status-item">
          {getStatusIcon(searchService)}
          <span>{getStatusText('searchService', searchService)}</span>
        </div>
        
        <div className="status-item">
          {getStatusIcon(database)}
          <span>{getStatusText('database', database)}</span>
        </div>
        
        <div className="status-item">
          {getStatusIcon(analytics)}
          <span>{getStatusText('analytics', analytics)}</span>
        </div>
        
        {/* Custom services */}
        {customServices.map((service, index) => (
          <div key={index} className="status-item">
            {getStatusIcon(service.status)}
            <span>{service.displayName}: {service.status}</span>
          </div>
        ))}
      </div>
      
      {!isConnected && (
        <div className="status-warning">
          <p>You are currently offline. Search functionality may be limited.</p>
        </div>
      )}
    </div>
  );
});

SearchStatus.displayName = 'SearchStatus';

export default SearchStatus;