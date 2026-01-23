import React from 'react';
import HeroSection from '../components/landing/Hero';
import TrustBadgesSection from '../components/landing/TrustBadges';
import FeatureHighlightsSection from '../components/landing/FeatureHighlights';
import HowItWorksSection from '../components/landing/HowItWorks';
import SocialProofSection from '../components/landing/SocialProof';
import ScarcityBannerSection from '../components/landing/ScarcityBanner';
import ReciprocitySection from '../components/landing/Reciprocity';
import FOMOSection from '../components/landing/FOMO';
import FAQSection from '../components/landing/FAQ';
import AboutSection from '../components/landing/About';
import ContactSection from '../components/landing/Contact';
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