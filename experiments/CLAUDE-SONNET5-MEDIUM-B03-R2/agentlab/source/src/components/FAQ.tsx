import { useState } from 'react';
import { faqEntries } from '../data/faq';

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="faq" data-testid="faq" className="faq section">
      <div className="section__head">
        <p className="eyebrow">Perguntas frequentes</p>
        <h2>Tudo o que perguntam antes de comprar</h2>
      </div>
      <ul className="faq__list">
        {faqEntries.map((entry) => {
          const isOpen = entry.id === openId;
          return (
            <li key={entry.id} data-testid="faq-item" className="faq-item">
              <h3 className="faq-item__heading">
                <button
                  type="button"
                  data-testid="faq-question"
                  className="faq-item__question"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${entry.id}`}
                  onClick={() => setOpenId(isOpen ? null : entry.id)}
                >
                  <span>{entry.question}</span>
                  <span className="faq-item__icon" aria-hidden="true">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
              </h3>
              <div
                id={`faq-answer-${entry.id}`}
                className={isOpen ? 'faq-item__answer faq-item__answer--open' : 'faq-item__answer'}
              >
                <p>{entry.answer}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
