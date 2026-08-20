const NAV_LINKS: { href: string; label: string }[] = [
  { href: '#day-cycle', label: 'Ciclo do dia' },
  { href: '#features', label: 'Recursos' },
  { href: '#specs', label: 'Especificações' },
  { href: '#pricing', label: 'Planos' },
  { href: '#faq', label: 'FAQ' },
];

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="#hero" className="brand-mark">
          <span className="brand-mark__glyph" aria-hidden="true" />
          LUMA
        </a>
        <nav className="site-nav" aria-label="Navegação principal">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#pricing" className="btn btn--small btn--primary">
          Comprar
        </a>
      </div>
    </header>
  );
}
