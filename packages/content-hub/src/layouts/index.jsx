/**
 * Layout Components for Content Hub
 * 
 * These replace the 279 lines of boilerplate in ContentAccess.jsx
 * Clean, focused, reusable layouts.
 */

import React from 'react';
import { Logger } from '@tamyla/shared/utils';

const logger = new Logger('ContentHubLayouts');

/**
 * TABBED LAYOUT - Replaces the existing ContentAccess.jsx tab system
 */
export const TabbedLayout = ({ activeView, onViewChange, capabilities, extensionHooks }) => {
  const availableTabs = Object.keys(capabilities);
  
  return (
    <div className="content-hub-tabbed">
      {/* Tab Navigation */}
      <div className="tab-navigation">
        {availableTabs.map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeView === tab ? 'active' : ''}`}
            onClick={() => onViewChange(tab)}
          >
            {getTabLabel(tab)}
          </button>
        ))}
        
        {/* Extension Hook: Additional tabs */}
        {extensionHooks.additionalTabs?.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeView === tab.id ? 'active' : ''}`}
            onClick={() => onViewChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {activeView === 'search' && capabilities.search && (
          <SearchView capability={capabilities.search} />
        )}
        {activeView === 'upload' && capabilities.upload && (
          <UploadView capability={capabilities.upload} />
        )}
        {activeView === 'gallery' && capabilities.gallery && (
          <GalleryView capability={capabilities.gallery} />
        )}
        {activeView === 'sharing' && capabilities.sharing && (
          <SharingView capability={capabilities.sharing} />
        )}
        
        {/* Extension Hook: Additional content */}
        {extensionHooks.additionalContent?.[activeView]}
      </div>
    </div>
  );
};

/**
 * SIDEBAR LAYOUT - Alternative layout option
 */
export const SidebarLayout = ({ activeView, onViewChange, capabilities, extensionHooks }) => {
  return (
    <div className="content-hub-sidebar">
      <aside className="sidebar-nav">
        {Object.keys(capabilities).map(view => (
          <button
            key={view}
            className={`nav-item ${activeView === view ? 'active' : ''}`}
            onClick={() => onViewChange(view)}
          >
            <span className="nav-icon">{getViewIcon(view)}</span>
            <span className="nav-label">{getTabLabel(view)}</span>
          </button>
        ))}
      </aside>
      
      <main className="main-content">
        {activeView === 'search' && capabilities.search && (
          <SearchView capability={capabilities.search} />
        )}
        {activeView === 'upload' && capabilities.upload && (
          <UploadView capability={capabilities.upload} />
        )}
        {activeView === 'gallery' && capabilities.gallery && (
          <GalleryView capability={capabilities.gallery} />
        )}
        {activeView === 'sharing' && capabilities.sharing && (
          <SharingView capability={capabilities.sharing} />
        )}
      </main>
    </div>
  );
};

/**
 * SINGLE VIEW LAYOUT - Minimal, focused interface
 */
export const SingleViewLayout = ({ activeView, capabilities, extensionHooks }) => {
  const capability = capabilities[activeView];
  
  if (!capability) {
    return <div className="content-hub-error">View not available</div>;
  }
  
  return (
    <div className="content-hub-single">
      {activeView === 'search' && <SearchView capability={capability} />}
      {activeView === 'upload' && <UploadView capability={capability} />}
      {activeView === 'gallery' && <GalleryView capability={capability} />}
      {activeView === 'sharing' && <SharingView capability={capability} />}
    </div>
  );
};

/**
 * VIEW COMPONENTS - Clean, focused feature implementations
 */

const SearchView = ({ capability }) => {
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  
  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await capability.service(query, filters);
      capability.setState(results);
      capability.onSearch?.(query, results);
    } catch (error) {
      logger.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="search-view">
      <div className="search-controls">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search content..."
          className="search-input"
        />
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="search-button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      <div className="search-results">
        {capability.state?.map(result => (
          <div key={result.id} className="search-result-item">
            <h4>{result.name}</h4>
            <p>{result.description}</p>
            <small>{result.lastModified}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

const UploadView = ({ capability }) => {
  const [dragActive, setDragActive] = React.useState(false);
  
  const handleUpload = async (files) => {
    try {
      const results = await capability.service(files);
      capability.onUpload?.(results);
    } catch (error) {
      logger.error('Upload failed', error);
    }
  };
  
  return (
    <div 
      className={`upload-view ${dragActive ? 'drag-active' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleUpload(Array.from(e.dataTransfer.files));
      }}
    >
      <div className="upload-zone">
        <p>Drag files here or click to upload</p>
        <input
          type="file"
          multiple
          onChange={(e) => handleUpload(Array.from(e.target.files))}
          className="file-input"
        />
      </div>
      
      {Object.keys(capability.state).length > 0 && (
        <div className="upload-progress">
          {Object.entries(capability.state).map(([filename, progress]) => (
            <div key={filename} className="progress-item">
              <span>{filename}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GalleryView = ({ capability }) => {
  React.useEffect(() => {
    // Load gallery items on mount
    capability.service().then(items => {
      capability.setState(items);
    });
  }, []);
  
  return (
    <div className="gallery-view">
      <div className="gallery-grid">
        {capability.state?.map(item => (
          <div 
            key={item.id} 
            className="gallery-item"
            onClick={() => capability.onView?.(item)}
          >
            <img src={item.thumbnail} alt={item.name} />
            <div className="item-info">
              <h4>{item.name}</h4>
              <p>{item.size}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SharingView = ({ capability }) => {
  React.useEffect(() => {
    // Load shared items
    capability.getShared().then(items => {
      capability.setState(items);
    });
  }, []);
  
  return (
    <div className="sharing-view">
      <h3>Shared Content</h3>
      <div className="shared-items">
        {capability.state?.map(item => (
          <div key={item.id} className="shared-item">
            <span>{item.name}</span>
            <span>Shared with: {item.sharedWith.join(', ')}</span>
            <span>Access: {item.permissions}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * HELPER FUNCTIONS
 */
const getTabLabel = (tab) => {
  const labels = {
    search: 'Search',
    upload: 'Upload',
    gallery: 'Gallery',
    sharing: 'Sharing'
  };
  return labels[tab] || tab.charAt(0).toUpperCase() + tab.slice(1);
};

const getViewIcon = (view) => {
  const icons = {
    search: '🔍',
    upload: '📤',
    gallery: '🖼️',
    sharing: '🔗'
  };
  return icons[view] || '📄';
};

export default {
  TabbedLayout,
  SidebarLayout,
  SingleViewLayout
};