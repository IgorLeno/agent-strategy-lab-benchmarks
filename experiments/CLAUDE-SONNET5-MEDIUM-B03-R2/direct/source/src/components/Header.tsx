const NAV_LINKS = [
  { href: '#day-cycle', label: 'Day cycle' },
  { href: '#features', label: 'Features' },
  { href: '#specs', label: 'Specs' },
  { href: '#social-proof', label: 'Reviews' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="brand" href="#hero" aria-label="LUMA, back to top">
          <span className="brand__mark" aria-hidden="true" />
          LUMA
        </a>
        <nav className="primary-nav" aria-label="Primary">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="button button--ghost header-cta" href="#pricing">
          Pre-order
        </a>
      </div>
    </header>
  );
}
