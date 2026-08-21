const NAV_LINKS = [
  { href: '#day-cycle', label: 'Ciclo do dia' },
  { href: '#features', label: 'Recursos' },
  { href: '#specs', label: 'Specs' },
  { href: '#social-proof', label: 'Depoimentos' },
  { href: '#pricing', label: 'Preços' },
  { href: '#faq', label: 'FAQ' },
];

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="#hero">
          <span className="brand__mark" aria-hidden="true" />
          LUMA
        </a>
        <nav className="site-nav" aria-label="Seções principais">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <a className="button button--ghost site-header__cta" href="#pricing">
          Comprar
        </a>
      </div>
    </header>
  );
}
