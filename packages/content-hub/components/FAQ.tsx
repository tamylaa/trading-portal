import React from 'react';

export interface FAQItem {
  question: string;
  answer: React.ReactNode;
  id?: string;
}

interface FAQProps {
  items?: FAQItem[];
  className?: string;
}

const FAQ: React.FC<FAQProps> = ({ items = [], className = '' }) => {
  if (!items || items.length === 0) {
    return (
      <section className={`content-hub-faq ${className}`}>
        <h2>FAQ</h2>
        <p>No FAQ items available.</p>
      </section>
    );
  }

  return (
    <section className={`content-hub-faq ${className}`} aria-label="FAQ">
      <h2>FAQ</h2>
      <div>
        {items.map((it, idx) => (
          <details key={it.id || idx} className="faq-item" style={{ marginBottom: 8 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{it.question}</summary>
            <div className="faq-answer" style={{ marginTop: 6 }}>{it.answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
