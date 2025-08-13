// Simple placeholder components for now
import React from 'react';

export const ContentLibrary = () => (
  <div className="widget-content">
    <h2 className="widget-title">Content Library</h2>
    <p>Your content management hub - coming soon with advanced features!</p>
  </div>
);

export const Analytics = () => (
  <div className="widget-content">
    <h2 className="widget-title">Analytics</h2>
    <p>Performance insights and detailed analytics - coming soon!</p>
  </div>
);

export const Achievements = ({ streak }) => (
  <div className="widget-content">
    <h2 className="widget-title">Achievements</h2>
    <div className="achievement-list">
      <div className="achievement-item">
        <span className="achievement-icon">🔥</span>
        <span className="achievement-text">{streak} Day Login Streak</span>
      </div>
      <div className="achievement-item">
        <span className="achievement-icon">📁</span>
        <span className="achievement-text">First Upload</span>
      </div>
      <div className="achievement-item">
        <span className="achievement-icon">👀</span>
        <span className="achievement-text">100 Views</span>
      </div>
    </div>
  </div>
);
