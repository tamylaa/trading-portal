import React, { useRef } from 'react';
import { ButtonSuccess, TamylaThemeProvider } from '@tamyla/ui-components-react';
import UIComponentErrorBoundary from '../UIComponentErrorBoundary';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  // Only use inline style for dynamic background image - all layout handled by CSS
  const heroSectionStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, #f4f8fb 60%, #eaf1f8 100%), url('${process.env.PUBLIC_URL}/assets/images/hero-bg.jpg') center/cover no-repeat`,
  };

  // Prevent duplicate button creation
  const buttonRef = useRef<HTMLDivElement>(null);
  const [buttonKey] = React.useState(() => `btn-${Date.now()}-${Math.random()}`);

  return (
    <section className="hero-section" style={heroSectionStyle}>
      <div className="landing-section-content">
        <div className="hero-content">
          <h1 className="hero-title">Maximize Your Merchant Exports Profits</h1>
          <p className="hero-subtitle">
            Secret Formulas for ambitious businesses and professionals to trade smarter, faster, safer and peacefully.
          </p>
          <div ref={buttonRef} key={buttonKey}>
            <UIComponentErrorBoundary 
              fallback={
                <button 
                  className="hero-cta-button fallback-button"
                  onClick={() => window.location.href = '/stories'}
                  style={{
                    padding: '16px 32px',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Get Started Today (Fallback)
                </button>
              }
            >
              <TamylaThemeProvider>
                <ButtonSuccess
                  size="lg"
                  fullWidth={true}
                  className="hero-cta-button"
                  onClick={() => window.location.href = '/stories'}
                >
                  Get Started Today
                </ButtonSuccess>
              </TamylaThemeProvider>
            </UIComponentErrorBoundary>
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
          <img src="/assets/images/hero-bg.jpg" alt="Trading Illustration" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
