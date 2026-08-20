import { FOOTER_GROUPS } from '../data/content';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="footer" data-testid="footer" className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <a href="#hero" className="brand-mark">
            <span className="brand-mark__glyph" aria-hidden="true" />
            LUMA
          </a>
          <p>
            Luz de mesa inteligente com branco adaptativo, cor ambiente e detecção de presença.
            Desenhada para acompanhar o seu dia, não para competir com ele.
          </p>
        </div>

        <nav className="site-footer__nav" aria-label="Links do rodapé">
          {FOOTER_GROUPS.map((group) => (
            <div className="site-footer__group" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#hero">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="site-footer__legal">
        <p>© {year} LUMA Studio Ltda. Todos os direitos reservados. LUMA é um produto fictício criado para fins de demonstração.</p>
      </div>
    </footer>
  );
}
