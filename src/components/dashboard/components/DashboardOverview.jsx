// Dashboard Overview - Main widget with key metrics
import React from 'react';
import { Link } from 'react-router-dom';
import './DashboardOverview.css';

const DashboardOverview = ({ streak, progress }) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const metrics = [
    {
      label: 'Files Uploaded',
      value: '24',
      change: '+3 today',
      icon: '📁',
      color: '#667eea'
    },
    {
      label: 'Total Views',
      value: '1,234',
      change: '+127 this week',
      icon: '👁️',
      color: '#764ba2'
    },
    {
      label: 'Storage Used',
      value: '2.4GB',
      change: 'of 10GB',
      icon: '💾',
      color: '#f093fb'
    },
    {
      label: 'Active Streak',
      value: `${streak} days`,
      change: 'Keep it up!',
      icon: '🔥',
      color: '#ffa726'
    }
  ];

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <div className="time-display">
          <h1 className="current-time">{currentTime}</h1>
          <p className="current-date">{currentDate}</p>
        </div>
        <div className="progress-summary">
          <div className="circular-progress">
            <svg className="progress-circle" width="80" height="80">
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="35"
                fill="none"
                stroke="#667eea"
                strokeWidth="6"
                strokeLinecap="round"
                style={{
                  strokeDasharray: `${2 * Math.PI * 35}`,
                  strokeDashoffset: `${2 * Math.PI * 35 * (1 - progress / 100)}`,
                  transition: 'stroke-dashoffset 0.5s ease-in-out'
                }}
              />
            </svg>
            <div className="progress-text">
              <span className="progress-number">{Math.round(progress)}%</span>
              <span className="progress-label">Complete</span>
            </div>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-card" style={{ '--color': metric.color }}>
            <div className="metric-icon">{metric.icon}</div>
            <div className="metric-content">
              <h3 className="metric-value">{metric.value}</h3>
              <p className="metric-label">{metric.label}</p>
              <span className="metric-change">{metric.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="content-section">
        <h2>Content Hub</h2>
        <p className="section-description">
          Access your comprehensive content management system. Search, upload, and manage your content files in one centralized location.
        </p>
        
        <div className="content-hub-actions">
          <Link to="/content-access" className="content-hub-link">
            <div className="content-hub-card">
              <div className="content-hub-icon">📁</div>
              <div className="content-hub-info">
                <h3>Open Content Hub</h3>
                <p>Search, upload, and manage all your content</p>
                <div className="content-hub-features">
                  <span className="feature-badge">🔍 Search</span>
                  <span className="feature-badge">📤 Upload</span>
                  <span className="feature-badge">🖼️ Gallery</span>
                </div>
              </div>
              <div className="content-hub-arrow">→</div>
            </div>
          </Link>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">📎</span>
            <div className="activity-content">
              <p className="activity-text">Uploaded new image: banner.jpg</p>
              <span className="activity-time">2 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📊</span>
            <div className="activity-content">
              <p className="activity-text">Viewed analytics dashboard</p>
              <span className="activity-time">5 hours ago</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🏆</span>
            <div className="activity-content">
              <p className="activity-text">Achievement unlocked: 7-day streak!</p>
              <span className="activity-time">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
