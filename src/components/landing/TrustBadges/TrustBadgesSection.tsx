import React from 'react';
import './TrustBadgesSection.css';

const TrustBadgesSection: React.FC = () => (
  <section className="trust-badges-section">
    <div className="landing-section-content">
      <h2 className="trust-badges-title">Trusted & Recognized</h2>
      <div className="trust-badges-row">
        <div className="trust-badge">
          <img src="/assets/badges/ssl.webp" alt="SSL Secured" />
          <span>SSL Secured</span>
        </div>
        <div className="trust-badge">
          <img src="/assets/badges/award.webp" alt="Industry Award" />
          <span>Industry Award</span>
        </div>
        <div className="trust-badge">
          <img src="/assets/badges/press.webp" alt="Featured In Press" />
          <span>Featured In Press</span>
        </div>
        <div className="trust-badge">
          <img src="/assets/badges/certified.webp" alt="Certified Platform" />
          <span>Certified Platform</span>
        </div>
      </div>
    </div>
  </section>
);

export default TrustBadgesSection;
