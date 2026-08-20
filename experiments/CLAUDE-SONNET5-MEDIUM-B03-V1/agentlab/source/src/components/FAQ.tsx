import { useState } from 'react';
import { FAQ_ITEMS } from '../data/content';
import { ChevronIcon } from './icons';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" data-testid="faq" className="faq section">
      <div className="section__heading">
        <p className="eyebrow">Perguntas frequentes</p>
        <h2>Tudo o que você quer saber antes de comprar</h2>
        <p className="section__lede">
          Não achou sua pergunta aqui? Fale com a gente pela Central de ajuda no rodapé.
        </p>
      </div>

      <ul className="faq__list">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;
          const buttonId = `faq-button-${index}`;
          return (
            <li
              key={item.question}
              data-testid="faq-item"
              className={`faq-item${isOpen ? ' is-open' : ''}`}
            >
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
                  <ChevronIcon className="faq-item__chevron" />
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={buttonId} className="faq-item__answer">
                <div className="faq-item__answer-inner">
                  <p>{item.answer}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
