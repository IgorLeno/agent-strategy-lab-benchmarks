const FOOTER_GROUPS = [
  {
    heading: 'Product',
    links: [
      { label: 'Day cycle', href: '#day-cycle' },
      { label: 'Features', href: '#features' },
      { label: 'Specs', href: '#specs' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Reviews', href: '#social-proof' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Contact', href: 'mailto:hello@luma-light.example' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Shipping & returns', href: '#faq' },
      { label: 'Warranty', href: '#specs' },
      { label: 'Pre-order status', href: '#pricing' },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="footer" data-testid="footer" className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <a className="brand" href="#hero" aria-label="LUMA, back to top">
            <span className="brand__mark" aria-hidden="true" />
            LUMA
          </a>
          <p>
            LUMA is a desk light engineered around your circadian rhythm — adaptive white,
            ambient color and presence sensing, in one lamp.
          </p>
        </div>
        <nav className="site-footer__nav" aria-label="Footer">
          {FOOTER_GROUPS.map((group) => (
            <div className="site-footer__group" key={group.heading}>
              <h2>{group.heading}</h2>
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
        <p>&copy; 2026 LUMA Lighting Co. All rights reserved. LUMA is a fictional product.</p>
      </div>
    </footer>
  );
}
