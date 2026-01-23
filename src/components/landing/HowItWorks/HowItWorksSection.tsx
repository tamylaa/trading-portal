import React from 'react';
import './HowItWorksSection.css';

const steps = [
  {
    icon: '/assets/icons/signup.svg',
    title: 'Sign Up Instantly',
    desc: 'Create your free account in seconds. No credit card required.'
  },
  {
    icon: '/assets/icons/setup.svg',
    title: 'Set Up & Explore',
    desc: 'Personalize your dashboard and connect your favorite tools.'
  },
  {
    icon: '/assets/icons/trade.svg',
    title: 'Start Trading',
    desc: 'Access powerful analytics and trade with confidence from day one.'
  }
];

const HowItWorksSection: React.FC = () => (
  <section className="how-it-works-section">
    <div className="landing-section-content">
      <h2 className="how-it-works-title">How It Works</h2>
      <div className="how-steps-row">
        {steps.map((s, idx) => (
          <div className="how-step-card" key={idx}>
            <div className="how-step-icon">
              <img src={s.icon} alt={s.title + ' icon'} />
            </div>
            <h3 className="how-step-title">{s.title}</h3>
            <p className="how-step-desc">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
