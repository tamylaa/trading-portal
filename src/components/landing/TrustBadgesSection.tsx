import React from 'react';
import './TrustBadgesSection.css';

const TrustBadgesSection: React.FC = () => (
  <section className="trust-badges-section">
    <h2 className="trust-badges-title">Trusted & Recognized</h2>
    <div className="trust-badges-row">
      <div className="trust-badge">
        <img src="/assets/badges/ssl.svg" alt="SSL Secured" />
        <span>SSL Secured</span>
      </div>
      <div className="trust-badge">
        <img src="/assets/badges/award.svg" alt="Industry Award" />
        <span>Industry Award</span>
      </div>
      <div className="trust-badge">
        <img src="/assets/badges/press.svg" alt="Featured In Press" />
        <span>Featured In Press</span>
      </div>
      <div className="trust-badge">
        <img src="/assets/badges/certified.svg" alt="Certified Platform" />
        <span>Certified Platform</span>
      </div>
    </div>
  </section>
);

export default TrustBadgesSection;
