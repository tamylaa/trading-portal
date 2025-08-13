// Sidebar Navigation - Professional & Engaging
import React from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { uiActions } from '../../../store';
import './SidebarNavigation.css';

const SidebarNavigation = ({ 
  isOpen, 
  isMobile, 
  activeSection, 
  onSectionChange, 
  user, 
  streak 
}) => {
  const dispatch = useAppDispatch();
  
  const navigationItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      description: 'Your daily dashboard',
      badge: null
    },
    {
      id: 'content',
      label: 'Content Library',
      icon: '📁',
      description: 'Manage your files',
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      description: 'Performance insights',
      badge: 'New'
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: '🏆',
      description: 'Your progress',
      badge: streak > 5 ? '🔥' : null
    }
  ];

  const toggleSidebar = () => {
    dispatch(uiActions.toggleSidebar());
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}
      
      <nav className={`sidebar-navigation ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info">
              <h3 className="user-name">{user?.name || 'User'}</h3>
              <p className="user-status">
                {streak > 0 && (
                  <span className="streak-badge">
                    🔥 {streak} day streak
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {isOpen ? '←' : '→'}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="sidebar-menu">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
            >
              <span className="menu-icon">{item.icon}</span>
              <div className="menu-content">
                <span className="menu-label">{item.label}</span>
                <span className="menu-description">{item.description}</span>
              </div>
              {item.badge && (
                <span className="menu-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Progress Section */}
        <div className="sidebar-progress">
          <h4>Today's Goals</h4>
          <div className="mini-progress">
            <div className="progress-item">
              <span>Daily Login</span>
              <span className="check">✅</span>
            </div>
            <div className="progress-item">
              <span>Check Analytics</span>
              <span className="check">⏳</span>
            </div>
            <div className="progress-item">
              <span>Upload Content</span>
              <span className="check">⏳</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="sidebar-stats">
          <div className="stat-item">
            <span className="stat-value">{user?.contentCount || 0}</span>
            <span className="stat-label">Files</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{user?.viewCount || 0}</span>
            <span className="stat-label">Views</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{streak}</span>
            <span className="stat-label">Streak</span>
          </div>
        </div>
      </nav>
    </>
  );
};

export default SidebarNavigation;
