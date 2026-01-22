import React from 'react';
import './ReciprocitySection.css';

const ReciprocitySection: React.FC = () => (
  <section className="reciprocity-section">
    <div className="landing-section-content">
      <div className="reciprocity-content">
        <h2 className="reciprocity-title">Get Started with Free Resources</h2>
        <p className="reciprocity-desc">
          Download our exclusive trading guide, or sign up for a free trial and discover how Tamyla can help you trade smarter.
        </p>
        <div className="reciprocity-actions">
          <a href="/assets/resources/trading-guide.pdf" className="reciprocity-btn" download>Download Guide</a>
          {/* Changed from anchor to button for accessibility */}
          <button type="button" className="reciprocity-btn alt" aria-label="Start Free Trial">Start Free Trial</button>
        </div>
      </div>
      <div className="reciprocity-image">
        <img src="/assets/illustrations/free-resource.svg" alt="Free Trading Guide" />
      </div>
    </div>
  </section>
);

export default ReciprocitySection;
