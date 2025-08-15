import React from 'react';
import './FeatureHighlightsSection.css';

const features = [
  {
    icon: '/assets/icons/lightning.svg',
    title: 'Lightning-Fast Execution',
    desc: 'Trade with confidence using our ultra-low latency platform built for speed and reliability.'
  },
  {
    icon: '/assets/icons/shield.svg',
    title: 'Bank-Grade Security',
    desc: 'Your data and funds are protected with advanced encryption and 24/7 monitoring.'
  },
  {
    icon: '/assets/icons/chart.svg',
    title: 'Powerful Analytics',
    desc: 'Make smarter decisions with real-time analytics, insights, and customizable dashboards.'
  },
  {
    icon: '/assets/icons/support.svg',
    title: 'Expert Support',
    desc: 'Our friendly team is here for you 24/7, ready to help you succeed.'
  }
];

const FeatureHighlightsSection: React.FC = () => (
  <section className="feature-highlights-section">
    <div className="landing-section-content">
      <h2 className="feature-highlights-title">Why Choose Tamyla?</h2>
      <div className="features-row">
        {features.map((f, idx) => (
          <div className="feature-card" key={idx}>
            <div className="feature-icon">
              <img src={f.icon} alt={f.title + ' icon'} />
            </div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureHighlightsSection;
