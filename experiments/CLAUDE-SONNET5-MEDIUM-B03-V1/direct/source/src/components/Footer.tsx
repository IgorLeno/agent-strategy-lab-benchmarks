const FOOTER_GROUPS = [
  {
    title: 'Product',
    links: [
      { label: 'Day cycle', href: '#day-cycle' },
      { label: 'Features', href: '#features' },
      { label: 'Specs', href: '#specs' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#hero' },
      { label: 'Press', href: '#social-proof' },
      { label: 'Careers', href: '#hero' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', href: '#faq' },
      { label: 'Warranty', href: '#specs' },
      { label: 'Contact', href: '#faq' },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="footer" data-testid="footer" className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <a href="#hero" className="brand">
            <span className="brand__mark" aria-hidden="true" />
            LUMA
          </a>
          <p>
            A desktop light tuned to the shape of your day. Designed in-house, built
            for desks that see real work.
          </p>
        </div>
        <nav className="site-footer__nav" aria-label="Footer">
          {FOOTER_GROUPS.map((group) => (
            <div className="site-footer__group" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="site-footer__legal">
        <p>© 2026 LUMA Home Goods, Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
