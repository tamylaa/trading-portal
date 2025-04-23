import React from 'react';
import './FOMOSection.css';

const FOMOSection: React.FC = () => (
  <section className="fomo-section">
    <div className="fomo-content">
      <h2 className="fomo-title">Don’t Miss Out!</h2>
      <p className="fomo-desc">
        Join <strong>5,000+</strong> thriving traders and business owners who trust Tamyla to power their growth. New users are joining every day—secure your spot and experience the difference!
      </p>
      <button className="fomo-cta">Start Now</button>
    </div>
    <div className="fomo-live-feed">
      <span className="fomo-feed-icon" role="img" aria-label="Lightning">⚡</span>
      <span className="fomo-feed-text">12 people joined in the last hour</span>
    </div>
  </section>
);

export default FOMOSection;
