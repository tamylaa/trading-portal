import React from 'react';
import { useSidebar } from '../../contexts/SidebarContext';
import './sidebar.css';

export const SidebarHeader: React.FC = () => {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <div className="sidebar-header">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">
          {/* SVG icon */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="18" height="18" rx="4" fill="var(--color-text-primary)" fillOpacity="0.13"/>
            <path d="M7 11L10 14L15 9" stroke="var(--color-text-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="sidebar-logo-text">Tamyla Portal</span>
      </div>
      <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}>
        <span className="toggle-icon">{isOpen ? '<' : '>'}</span>
      </button>
    </div>
  );
}
