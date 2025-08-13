// 🎯 Redux Features Demo - Professional Dashboard Showcase
// Demonstrates all enhanced capabilities of our Redux implementation

import React, { useState } from 'react';
import {
  useAuth,
  useSidebar,
  useNotifications,
  useTheme,
  useDashboard,
  usePreferences,
  useSearch,
  useResponsive,
  useModal,
  useLoading
} from '../../store/hooks';

const ReduxFeaturesDemo: React.FC = () => {
  const [demoStep, setDemoStep] = useState(1);
  
  // 🔌 All our enhanced Redux hooks
  const auth = useAuth();
  const sidebar = useSidebar();
  const notifications = useNotifications();
  const theme = useTheme();
  const dashboard = useDashboard();
  const preferences = usePreferences();
  const search = useSearch();
  const responsive = useResponsive();
  const modal = useModal();
  const loading = useLoading();

  // 🎨 Demo Actions
  const runAuthDemo = () => {
    notifications.info(
      'Auth Demo', 
      `User: ${auth.user?.email || 'Not logged in'} | Authenticated: ${auth.isAuthenticated}`
    );
  };

  const runSidebarDemo = () => {
    sidebar.toggleSidebar();
    notifications.success('Sidebar Demo', `Sidebar ${sidebar.isOpen ? 'opened' : 'closed'}`);
  };

  const runThemeDemo = () => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    theme.setMode(newMode);
    notifications.success('Theme Demo', `Switched to ${newMode} mode`);
  };

  const runNotificationDemo = () => {
    const types = ['success', 'error', 'warning', 'info'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    notifications[type]('Demo Notification', `This is a ${type} notification!`);
  };

  const runSearchDemo = () => {
    const queries = ['portfolio', 'trades', 'analytics', 'settings'];
    const query = queries[Math.floor(Math.random() * queries.length)];
    search.setQuery(query);
    notifications.info('Search Demo', `Searching for: "${query}"`);
  };

  const runModalDemo = () => {
    modal.open('demo-modal', { message: 'Hello from Redux Modal!' });
  };

  const runLoadingDemo = () => {
    loading.setGlobal(true);
    setTimeout(() => {
      loading.setGlobal(false);
      notifications.success('Loading Demo', 'Loading simulation completed!');
    }, 2000);
  };

  const runPreferencesDemo = () => {
    const languages = ['en', 'es', 'fr', 'de'];
    const currentLang = preferences.language;
    const newLang = languages[Math.floor(Math.random() * languages.length)];
    
    if (newLang !== currentLang) {
      preferences.updateDisplayPrefs({ language: newLang });
      notifications.success('Preferences Demo', `Language changed to ${newLang}`);
    }
  };

  // 📊 Dashboard Stats
  const stats = {
    'Redux Slices': 4,
    'Active Hooks': 9,
    'Features': 'Authentication, UI State, Dashboard, Preferences',
    'Performance': 'Optimized with memoization',
    'Type Safety': '100% TypeScript',
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: theme.mode === 'dark' ? '#1a1a1a' : '#ffffff',
      color: theme.mode === 'dark' ? '#ffffff' : '#000000',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <h1>🚀 Professional Redux Dashboard Demo</h1>
      <p>Showcasing <strong>modular, reusable, robust, scalable, flexible and fluid interfaces</strong> that enhance and empower users.</p>

      {/* 🎯 Demo Step Progress */}
      <div style={{ 
        backgroundColor: theme.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
        padding: '15px',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3>🎯 Demo Progress</h3>
        <p>Current Step: {demoStep} of 5</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            onClick={() => setDemoStep(Math.max(1, demoStep - 1))}
            disabled={demoStep === 1}
            style={buttonStyle(theme)}
          >
            ← Previous
          </button>
          <button 
            onClick={() => setDemoStep(Math.min(5, demoStep + 1))}
            disabled={demoStep === 5}
            style={buttonStyle(theme)}
          >
            Next →
          </button>
        </div>
        <p style={{ marginTop: '10px', fontSize: '14px' }}>
          Active Layout: {dashboard.activeLayout?.id || 'default'} | 
          Edit Mode: {dashboard.isEditing ? 'On' : 'Off'} |
          Available Widgets: {dashboard.availableWidgets.length}
        </p>
      </div>

      {/* 📱 Responsive Info */}
      <div style={{ 
        backgroundColor: theme.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
        padding: '15px',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3>📱 Responsive Dashboard</h3>
        <p>
          <strong>Screen:</strong> {responsive.width}x{responsive.height} | 
          <strong>Device:</strong> {responsive.isMobile ? 'Mobile' : responsive.isTablet ? 'Tablet' : 'Desktop'} |
          <strong>Sidebar:</strong> {sidebar.isOpen ? 'Open' : 'Closed'}
        </p>
      </div>

      {/* 📊 Redux Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} style={{
            backgroundColor: theme.mode === 'dark' ? '#2a2a2a' : '#f8f9fa',
            padding: '15px',
            borderRadius: '6px',
            textAlign: 'center',
            border: `2px solid ${theme.primaryColor || '#007bff'}`
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: theme.primaryColor || '#007bff' }}>{key}</h4>
            <p style={{ margin: 0, fontSize: '14px' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* 🎮 Interactive Demo Controls */}
      <div style={{ 
        backgroundColor: theme.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
        padding: '20px',
        borderRadius: '6px',
        marginBottom: '20px'
      }}>
        <h3>🎮 Interactive Redux Features</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '10px',
          marginTop: '15px'
        }}>
          <button 
            onClick={runAuthDemo}
            style={buttonStyle(theme)}
          >
            🔐 Auth State
          </button>
          
          <button 
            onClick={runSidebarDemo}
            style={buttonStyle(theme)}
          >
            📋 Toggle Sidebar
          </button>
          
          <button 
            onClick={runThemeDemo}
            style={buttonStyle(theme)}
          >
            🎨 Switch Theme
          </button>
          
          <button 
            onClick={runNotificationDemo}
            style={buttonStyle(theme)}
          >
            🔔 Add Notification
          </button>
          
          <button 
            onClick={runSearchDemo}
            style={buttonStyle(theme)}
          >
            🔍 Search Demo
          </button>
          
          <button 
            onClick={runModalDemo}
            style={buttonStyle(theme)}
          >
            📱 Open Modal
          </button>
          
          <button 
            onClick={runLoadingDemo}
            style={buttonStyle(theme)}
          >
            ⏳ Loading Demo
          </button>
          
          <button 
            onClick={runPreferencesDemo}
            style={buttonStyle(theme)}
          >
            ⚙️ Preferences
          </button>
        </div>
      </div>

      {/* 🔍 Current Search State */}
      {search.query && (
        <div style={{ 
          backgroundColor: theme.mode === 'dark' ? '#2a2a2a' : '#e3f2fd',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '2px solid #2196f3'
        }}>
          <h4>🔍 Current Search</h4>
          <p><strong>Query:</strong> "{search.query}"</p>
          <p><strong>Searching:</strong> {search.isSearching ? 'Yes' : 'No'}</p>
        </div>
      )}

      {/* 🔔 Notifications Display */}
      {notifications.notifications.length > 0 && (
        <div style={{ 
          backgroundColor: theme.mode === 'dark' ? '#2a2a2a' : '#f5f5f5',
          padding: '15px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>🔔 Active Notifications ({notifications.notifications.length})</h4>
            <button 
              onClick={notifications.clearAll}
              style={{
                ...buttonStyle(theme),
                fontSize: '12px',
                padding: '5px 10px'
              }}
            >
              Clear All
            </button>
          </div>
          {notifications.notifications.slice(0, 3).map((notification) => (
            <div key={notification.id} style={{
              backgroundColor: theme.mode === 'dark' ? '#3a3a3a' : '#ffffff',
              padding: '10px',
              margin: '5px 0',
              borderRadius: '4px',
              borderLeft: `4px solid ${getNotificationColor(notification.type)}`
            }}>
              <strong>{notification.title}</strong>: {notification.message}
            </div>
          ))}
        </div>
      )}

      {/* ⚡ Performance Info */}
      <div style={{ 
        backgroundColor: theme.mode === 'dark' ? '#1a3d1a' : '#e8f5e8',
        padding: '15px',
        borderRadius: '6px',
        border: '2px solid #4caf50'
      }}>
        <h4>⚡ Performance & Architecture Benefits</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>Modular:</strong> Each slice handles specific domain logic</li>
          <li><strong>Reusable:</strong> Hooks can be used across any component</li>
          <li><strong>Robust:</strong> Type-safe with comprehensive error handling</li>
          <li><strong>Scalable:</strong> Easy to add new features and slices</li>
          <li><strong>Flexible:</strong> Supports both legacy and modern patterns</li>
          <li><strong>Fluid:</strong> Smooth transitions and responsive design</li>
          <li><strong>Empowering:</strong> Rich feature set enhances user capabilities</li>
        </ul>
      </div>

      {/* 📱 Demo Modal */}
      {modal.isOpen('demo-modal') && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme.mode === 'dark' ? '#2a2a2a' : '#ffffff',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3>🎉 Redux Modal Demo</h3>
            <p>{modal.getData('demo-modal')?.message}</p>
            <button 
              onClick={() => modal.close('demo-modal')}
              style={buttonStyle(theme)}
            >
              Close Modal
            </button>
          </div>
        </div>
      )}

      {/* ⏳ Global Loading Overlay */}
      {loading.global && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: theme.mode === 'dark' ? '#2a2a2a' : '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${theme.primaryColor || '#007bff'}`,
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px'
            }}></div>
            <p>Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 🎨 Helper Functions
const buttonStyle = (theme: any) => ({
  backgroundColor: theme.primaryColor || '#007bff',
  color: '#ffffff',
  border: 'none',
  padding: '10px 15px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.2s ease',
});

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'success': return '#4caf50';
    case 'error': return '#f44336';
    case 'warning': return '#ff9800';
    case 'info': return '#2196f3';
    default: return '#9e9e9e';
  }
};

export default ReduxFeaturesDemo;
