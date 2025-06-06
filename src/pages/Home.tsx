import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import TrustBadgesSection from '../components/landing/TrustBadgesSection';
import FeatureHighlightsSection from '../components/landing/FeatureHighlightsSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import SocialProofSection from '../components/landing/SocialProofSection';
import ScarcityBannerSection from '../components/landing/ScarcityBannerSection';
import ReciprocitySection from '../components/landing/ReciprocitySection';
import FOMOSection from '../components/landing/FOMOSection';
import FAQSection from '../components/landing/FAQSection';
import AboutSection from '../components/landing/AboutSection';
import ContactSection from '../components/landing/ContactSection';
import './Home.css';

const Home: React.FC = () => {
    return (
        <>
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
        </>
    );
};

export default Home;