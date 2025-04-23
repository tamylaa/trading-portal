import React, { useState } from 'react';
import './FAQSection.css';

const faqs = [
  {
    question: 'Is there a free trial? Do I need a credit card?',
    answer: 'Yes! You can start with a free trial—no credit card required. Explore all features risk-free.'
  },
  {
    question: 'How secure is my data and trading activity?',
    answer: 'Your security is our top priority. We use bank-grade encryption, 24/7 monitoring, and strict privacy controls.'
  },
  {
    question: 'Can I connect with my existing tools and accounts?',
    answer: 'Absolutely! Tamyla integrates with popular trading tools and platforms for a seamless experience.'
  },
  {
    question: 'What support do you offer?',
    answer: 'Our expert team is available 24/7 via live chat and email to help you succeed.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time—no questions asked.'
  }
];

const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section className="faq-section">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.map((faq, idx) => (
          <div className={`faq-item${openIdx === idx ? ' open' : ''}`} key={idx}>
            <button
              className="faq-question"
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              aria-expanded={openIdx === idx}
              aria-controls={`faq-answer-${idx}`}
            >
              {faq.question}
              <span className="faq-toggle-icon">{openIdx === idx ? '-' : '+'}</span>
            </button>
            <div
              className="faq-answer"
              id={`faq-answer-${idx}`}
              style={{ display: openIdx === idx ? 'block' : 'none' }}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
