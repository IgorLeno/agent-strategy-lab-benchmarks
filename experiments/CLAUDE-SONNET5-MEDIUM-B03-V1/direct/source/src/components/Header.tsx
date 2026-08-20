const NAV_LINKS = [
  { href: '#day-cycle', label: 'Day cycle' },
  { href: '#features', label: 'Features' },
  { href: '#specs', label: 'Specs' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="#hero" className="brand">
          <span className="brand__mark" aria-hidden="true" />
          LUMA
        </a>
        <nav className="site-nav" aria-label="Primary">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="button button--ghost site-header__cta" href="#pricing">
          Order LUMA
        </a>
      </div>
    </header>
  );
}
