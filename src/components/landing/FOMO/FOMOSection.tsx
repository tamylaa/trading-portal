import React from 'react';
import './FOMOSection.css';

const FOMOSection: React.FC = () => (
  <section className="fomo-section">
    <div className="fomo-content">
      <h2 className="fomo-title">Live Market Momentum</h2>
      <p className="fomo-desc">Real-time alerts and price movements powering smarter decisions.</p>
      <button className="fomo-cta">See Live Feed</button>
      <div className="fomo-live-feed">
        <span className="fomo-feed-icon">🔔</span>
        <span>120 trades happened in the last hour</span>
      </div>
    </div>
  </section>
);

export default FOMOSection;
