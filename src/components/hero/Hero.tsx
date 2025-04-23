import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
    const heroStyle = {
        backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/hero-bg.jpg)`
    };

    return (
        <div className="hero" style={heroStyle}>
            <div className="hero-overlay"></div>
            <div className="hero-content">
                <h1>Global Trading Solutions</h1>
                <p>Your trusted partner in international trade and business development</p>
                <div className="hero-cta">
                    <a href="/services" className="btn btn-primary">Our Services</a>
                    <a href="/contact" className="btn btn-secondary">Get in Touch</a>
                </div>
            </div>
            <div className="hero-overlay"></div>
        </div>
    );
};

export default Hero;
