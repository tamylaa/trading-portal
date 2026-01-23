import React from 'react';
import FAQ from './FAQ';

export default {
  title: 'ContentHub/FAQ',
  component: FAQ,
};

const items = [
  { question: 'How do I search content?', answer: 'Use the search bar and refine with filters.' },
  { question: 'How can I download a file?', answer: 'Click the download button on a result.' },
];

export const Default = () => <FAQ items={items} />;
