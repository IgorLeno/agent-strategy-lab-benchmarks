import { useState } from 'react';
import { faqItems } from '../data/content';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" data-testid="faq" className="faq">
      <div className="section-heading">
        <p className="eyebrow">FAQ</p>
        <h2>Questions, answered.</h2>
      </div>
      <ul className="faq__list">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;
          const buttonId = `faq-question-${index}`;
          return (
            <li key={item.question} data-testid="faq-item" className="faq-item">
              <h3 className="faq-item__heading">
                <button
                  type="button"
                  id={buttonId}
                  data-testid="faq-question"
                  className="faq-item__question"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <span className="faq-item__icon" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="faq-item__answer"
                data-open={isOpen}
                hidden={!isOpen}
              >
                <p>{item.answer}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
