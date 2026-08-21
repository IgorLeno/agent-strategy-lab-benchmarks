import { useState } from 'react';
import { faqEntries } from '../content';
import { ChevronIcon } from './icons';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" data-testid="faq" className="faq" aria-labelledby="faq-heading">
      <div className="section-head">
        <p className="eyebrow">Questions</p>
        <h2 id="faq-heading">Frequently asked questions</h2>
        <p className="section-lede">Still unsure? Here is everything we get asked before checkout.</p>
      </div>

      <div className="faq__list">
        {faqEntries.map((entry, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;
          const buttonId = `faq-question-${index}`;
          return (
            <div className="faq-item" data-testid="faq-item" key={entry.question}>
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
                  <span>{entry.question}</span>
                  <ChevronIcon className={`faq-item__chevron${isOpen ? ' faq-item__chevron--open' : ''}`} />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`faq-item__panel${isOpen ? ' faq-item__panel--open' : ''}`}
              >
                <p className="faq-item__answer">{entry.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
