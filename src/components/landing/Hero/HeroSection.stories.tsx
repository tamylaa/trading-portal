import React from 'react';
import HeroSection from './HeroSection';

export default {
  title: 'Landing/Hero',
  component: HeroSection,
};

export const Default = () => <HeroSection />;

export const WithAction = () => (
  <HeroSection />
);
