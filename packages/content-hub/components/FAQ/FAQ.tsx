import React, { useState } from 'react';
import './FAQ.css';

export type FAQItem = {
  question: string;
  answer: React.ReactNode;
};

type FAQProps = {
  items: readonly FAQItem[];
  className?: string;
};

const FAQ: React.FC<FAQProps> = ({ items, className = '' }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={`faq-container ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="faq-item">
          <button
            className={`faq-question ${openIndex === index ? 'active' : ''}`}
            onClick={() => toggleItem(index)}
            aria-expanded={openIndex === index}
            aria-controls={`faq-answer-${index}`}
            id={`faq-question-${index}`}
          >
            <span className="faq-question-text">{item.question}</span>
            <span className="faq-icon">
              {openIndex === index ? '−' : '+'}
            </span>
          </button>
          <div
            id={`faq-answer-${index}`}
            className={`faq-answer ${openIndex === index ? 'open' : ''}`}
            role="region"
            aria-labelledby={`faq-question-${index}`}
          >
            <div className="faq-answer-content">
              {typeof item.answer === 'string' ? (
                <p>{item.answer}</p>
              ) : (
                item.answer
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;