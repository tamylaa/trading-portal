import React from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonSuccess } from '@tamyla/ui-components-react';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  // Only use inline style for dynamic background image - all layout handled by CSS
  const heroSectionStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, #f4f8fb 60%, #eaf1f8 100%), image-set(url('${process.env.PUBLIC_URL}/assets/images/hero-bg.avif') type('image/avif') 1x, url('${process.env.PUBLIC_URL}/assets/images/hero-bg.webp') type('image/webp') 1x, url('${process.env.PUBLIC_URL}/assets/images/hero-bg.jpg') type('image/jpeg') 1x) center/cover no-repeat`,
  };

  const { t } = useTranslation();

  // Debug logging for button rendering
  React.useEffect(() => {
    console.log('HeroSection mounted, ButtonSuccess should render once');
  }, []);

  return (
    <section className="hero-section" style={heroSectionStyle}>
      <div className="landing-section-content">
        <div className="hero-content">
          <h1 className="hero-title">{t('hero.title')}</h1>
          <p className="hero-subtitle">
            {t('hero.subtitle')}
          </p>
          {/* Single ButtonSuccess component - if duplicated, check CSP and component lifecycle */}
          <ButtonSuccess
            size="lg"
            fullWidth={true}
            className="hero-cta-button"
            onClick={() => {
              console.log('Button clicked - navigating to stories');
              window.location.href = '/stories';
            }}
          >
            {t('hero.cta')}
          </ButtonSuccess>
          <div className="hero-microcopy">{t('hero.microcopy')}</div>
          <div className="hero-social-proof">
            <span>{t('hero.trustedBy')}</span>
            <span className="hero-badges">
              <img src="/assets/badges/ssl.webp" alt={t('hero.badges.ssl')} />
              <img src="/assets/badges/award.webp" alt={t('hero.badges.award')} />
              <img src="/assets/badges/press.webp" alt={t('hero.badges.press')} />
            </span>
          </div>
        </div>
        <div className="hero-image">
          <picture>
            <source type="image/avif" srcSet="/assets/images/hero-bg.avif" />
            <source type="image/webp" srcSet="/assets/images/hero-bg.webp" />
            <img src="/assets/images/hero-bg.jpg" alt={t('hero.imageAlt')} />
          </picture>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
