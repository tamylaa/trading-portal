import React from 'react';
import './ReciprocitySection.css';

const ReciprocitySection: React.FC = () => (
  <section className="reciprocity-section">
    <div className="reciprocity-content">
      <h2 className="reciprocity-title">Get Started with Free Resources</h2>
      <p className="reciprocity-desc">
        Download our exclusive trading guide, or sign up for a free trial and discover how Tamyla can help you trade smarter.
      </p>
      <div className="reciprocity-actions">
        <a href="/assets/resources/trading-guide.pdf" className="reciprocity-btn" download>Download Guide</a>
        <a href="#" className="reciprocity-btn alt">Start Free Trial</a>
      </div>
    </div>
    <div className="reciprocity-image">
      <img src="/assets/illustrations/free-resource.svg" alt="Free Trading Guide" />
    </div>
  </section>
);

export default ReciprocitySection;
