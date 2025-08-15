import React from 'react';
import './SocialProofSection.css';

const testimonials = [
  {
    quote: "Tamyla helped us scale our trading operations with confidence. The platform is reliable and the support is top-notch!",
    name: "Priya S.",
    role: "Founder, FinEdge Solutions",
    avatar: "/assets/avatars/priya.jpg"
  },
  {
    quote: "The intuitive dashboard and security features made Tamyla our go-to trading portal.",
    name: "James L.",
    role: "CTO, Quantum Trade Group",
    avatar: "/assets/avatars/james.jpg"
  },
  {
    quote: "We saw a 30% boost in efficiency after switching to Tamyla. Highly recommended!",
    name: "Sara K.",
    role: "Operations Lead, MarketWise",
    avatar: ""
  }
];

const logos = [
  '/assets/logos/client1.svg',
  '/assets/logos/client2.svg',
  '/assets/logos/client3.svg',
  '/assets/logos/client4.svg'
];

const SocialProofSection: React.FC = () => (
  <section className="social-proof-section">
    <div className="landing-section-content">
      <h2 className="social-proof-title">What Our Users Say</h2>
      <div className="testimonials-row">
      {testimonials.map((t, idx) => (
        <div className="testimonial" key={idx}>
          <div className="testimonial-avatar">
            {t.avatar ? (
              <img src={t.avatar} alt={t.name + ' photo'} />
            ) : (
              <span className="testimonial-avatar-fallback">{t.name.charAt(0)}</span>
            )}
          </div>
          <p className="testimonial-quote">“{t.quote}”</p>
          <div className="testimonial-user">
            <span className="testimonial-user-name">{t.name}</span>
            <span className="testimonial-user-role">{t.role}</span>
          </div>
        </div>
      ))}
    </div>
    <div className="social-proof-logos">
      {logos.map((logo, idx) => (
        <img src={logo} alt={`Client Logo ${idx+1}`} key={logo} />
      ))}
    </div>
    </div>
  </section>
);

export default SocialProofSection;
