const FOOTER_GROUPS = [
  {
    title: 'Produto',
    links: [
      { label: 'Ciclo do dia', href: '#day-cycle' },
      { label: 'Recursos', href: '#features' },
      { label: 'Especificações', href: '#specs' },
      { label: 'Preços', href: '#pricing' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Depoimentos', href: '#social-proof' },
      { label: 'Perguntas frequentes', href: '#faq' },
      { label: 'Contato', href: '#hero' },
    ],
  },
  {
    title: 'Suporte',
    links: [
      { label: 'Central de ajuda', href: '#faq' },
      { label: 'Garantia', href: '#specs' },
      { label: 'Status do pedido', href: '#pricing' },
    ],
  },
];

export function Footer() {
  return (
    <footer id="footer" data-testid="footer" className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <a className="brand" href="#hero">
            <span className="brand__mark" aria-hidden="true" />
            LUMA
          </a>
          <p>
            Iluminação de mesa com branco adaptativo, cor ambiente e detecção de presença, pensada
            para acompanhar o seu dia do primeiro café à última leitura antes de dormir.
          </p>
        </div>
        <div className="site-footer__groups">
          {FOOTER_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <p className="site-footer__group-title">{group.title}</p>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="site-footer__legal">
        <p>© 2026 LUMA Lighting Co. Todos os direitos reservados.</p>
        <p>LUMA é um produto fictício criado para fins de demonstração.</p>
      </div>
    </footer>
  );
}
