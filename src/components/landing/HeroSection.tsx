import React from 'react';
import { ButtonSuccess } from '@tamyla/ui-components-react';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  // Only use inline style for dynamic background image - all layout handled by CSS
  const heroSectionStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, #f4f8fb 60%, #eaf1f8 100%), image-set(url('${process.env.PUBLIC_URL}/assets/images/hero-bg.avif') type('image/avif') 1x, url('${process.env.PUBLIC_URL}/assets/images/hero-bg.webp') type('image/webp') 1x, url('${process.env.PUBLIC_URL}/assets/images/hero-bg.jpg') type('image/jpeg') 1x) center/cover no-repeat`,
  };

  return (
    <section className="hero-section" style={heroSectionStyle}>
      <div className="landing-section-content">
        <div className="hero-content">
          <h1 className="hero-title">Maximize Your Merchant Exports Profits</h1>
          <p className="hero-subtitle">
            Secret Formulas for ambitious businesses and professionals to trade smarter, faster, safer and peacefully.
          </p>
          <div className="hero-cta-container">
            <ButtonSuccess
              size="lg"
              fullWidth={true}
              className="hero-cta-button"
              onClick={() => window.location.href = '/stories'}
            >
              Get Started Today
            </ButtonSuccess>
          </div>
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
          <picture>
            <source type="image/avif" srcSet="/assets/images/hero-bg.avif" />
            <source type="image/webp" srcSet="/assets/images/hero-bg.webp" />
            <img src="/assets/images/hero-bg.jpg" alt="Trading Illustration" />
          </picture>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
