// Professional Sidebar Navigation - Complete Navigation System
import React from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '../../../contexts/SidebarContext';
import './SidebarNavigation.css';

const SidebarNavigation = ({ 
  activeSection, 
  onSectionChange, 
  user, 
  streak 
}) => {
  // DEBUG: Check if component is rendering
  console.log('🔍 SidebarNavigation rendering:', { activeSection, user, streak });
  
  // Use existing header toggle system
  const { isOpen, toggleSidebar } = useSidebar();
  const isMobile = window.innerWidth <= 768;
  
  console.log('🔍 Sidebar state:', { isOpen, isMobile });
  
  // Complete navigation structure combining old sidebar items with new professional design
  const navigationItems = [
    // Main Navigation
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      description: 'Main landing page',
      route: '/',
      badge: null,
      section: 'main'
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Your daily dashboard',
      route: '/dashboard',
      badge: null,
      section: 'main'
    },
    {
      id: 'content-upload',
      label: 'Upload Content',
      icon: '📁',
      description: 'Manage your files',
      route: '/content-upload',
      badge: null,
      section: 'main'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      description: 'Performance insights',
      route: '/analytics',
      badge: 'New',
      section: 'main'
    },
    {
      id: 'trades',
      label: 'Trading',
      icon: '💹',
      description: 'Trade management',
      route: '/trades',
      badge: null,
      section: 'main'
    },
    // Account Section
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      description: 'Account settings',
      route: '/profile',
      badge: null,
      section: 'account'
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: '🏆',
      description: 'Your progress',
      route: '/achievements',
      badge: streak > 5 ? '🔥' : null,
      section: 'account'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'App preferences',
      route: '/settings',
      badge: null,
      section: 'account'
    }
  ];
  
  // Group navigation items by section
  const mainItems = navigationItems.filter(item => item.section === 'main');
  const accountItems = navigationItems.filter(item => item.section === 'account');

  const handleToggle = () => {
    // Use existing header toggle system
    toggleSidebar();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={handleToggle}
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
            onClick={handleToggle}
            aria-label="Toggle sidebar"
          >
            {isOpen ? '←' : '→'}
          </button>
        </div>

        {/* Main Navigation Items */}
        <div className="sidebar-menu">
          <div className="menu-section">
            <h4 className="section-title">Main Menu</h4>
            {mainItems.map((item) => (
              <Link
                key={item.id}
                to={item.route}
                className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  onSectionChange && onSectionChange(item.id);
                  // Auto-close sidebar on mobile after navigation
                  if (isMobile) handleToggle();
                }}
              >
                <span className="menu-icon">{item.icon}</span>
                <div className="menu-content">
                  <span className="menu-label">{item.label}</span>
                  <span className="menu-description">{item.description}</span>
                </div>
                {item.badge && (
                  <span className="menu-badge">{item.badge}</span>
                )}
              </Link>
            ))}
          </div>

          <hr className="sidebar-divider" />

          {/* Account Navigation Items */}
          <div className="menu-section">
            <h4 className="section-title">Account</h4>
            {accountItems.map((item) => (
              <Link
                key={item.id}
                to={item.route}
                className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  onSectionChange && onSectionChange(item.id);
                  // Auto-close sidebar on mobile after navigation
                  if (isMobile) handleToggle();
                }}
              >
                <span className="menu-icon">{item.icon}</span>
                <div className="menu-content">
                  <span className="menu-label">{item.label}</span>
                  <span className="menu-description">{item.description}</span>
                </div>
                {item.badge && (
                  <span className="menu-badge">{item.badge}</span>
                )}
              </Link>
            ))}
          </div>
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
