import React from 'react';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  const heroSectionStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, #f4f8fb 60%, #eaf1f8 100%), url('${process.env.PUBLIC_URL}/assets/images/hero-bg.jpg') center/cover no-repeat`,
    borderRadius: '1.5rem',
    boxShadow: '0 2px 24px rgba(36,40,60,0.07)',
    marginBottom: '2.5rem',
    minHeight: '450px',
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '3rem 2rem 2.5rem 2rem',
  };

  return (
    <section className="hero-section" style={heroSectionStyle}>
      <div className="hero-content">
        <h1 className="hero-title">Maximize Your Merchant Exports Profits</h1>
        <p className="hero-subtitle">
          Secret Formulas for ambitious businesses and professionals to trade smarter, faster, safer and peacefully.
        </p>
        <button className="hero-cta">Start Free Trial</button>
        <div className="hero-microcopy">No credit card required. Cancel anytime.</div>
        <div className="hero-social-proof">
          <span>Trusted by 5,000+ users</span>
          <span className="hero-badges">
            <img src="/assets/badges/ssl.svg" alt="SSL Secured" />
            <img src="/assets/badges/award.svg" alt="Award Winner" />
            <img src="/assets/badges/press.svg" alt="As Seen In" />
          </span>
        </div>
      </div>
      <div className="hero-image">
        <img src="/assets/images/hero-bg.jpg" alt="Trading Illustration" />
      </div>
    </section>
  );
};

export default HeroSection;
