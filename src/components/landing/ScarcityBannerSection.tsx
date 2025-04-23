import React from 'react';
import './ScarcityBannerSection.css';

const ScarcityBannerSection: React.FC = () => (
  <section className="scarcity-banner-section">
    <div className="scarcity-banner-content">
      <span className="scarcity-offer">Limited Time Offer</span>
      <span className="scarcity-message">
        Get <strong>2 months free</strong> on your annual subscription – offer ends soon!
      </span>
      <button className="scarcity-cta">Claim Offer</button>
    </div>
  </section>
);

export default ScarcityBannerSection;
