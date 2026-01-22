import React from 'react';
import HeroSection from '../components/landing/Hero';
import TrustBadgesSection from '../components/landing/TrustBadges';
import FeatureHighlightsSection from '../components/landing/FeatureHighlights';
import HowItWorksSection from '../components/landing/HowItWorks';
import SocialProofSection from '../components/landing/SocialProof';
import ScarcityBannerSection from '../components/landing/ScarcityBannerSection';
import ReciprocitySection from '../components/landing/ReciprocitySection';
import FOMOSection from '../components/landing/FOMOSection';
import FAQSection from '../components/landing/FAQSection';
import AboutSection from '../components/landing/AboutSection';
import ContactSection from '../components/landing/ContactSection';
import './Home.css';
import '../components/landing/LandingLayoutArchitecture.css';

const Home: React.FC = () => {
    return (
        <div className="landing-page-container">
            <HeroSection />
            <TrustBadgesSection />
            <FeatureHighlightsSection />
            <HowItWorksSection />
            <SocialProofSection />
            <ScarcityBannerSection />
            <ReciprocitySection />
            <FOMOSection />
            <FAQSection />
            <AboutSection />
            <ContactSection />
        </div>
    );
};

export default Home;