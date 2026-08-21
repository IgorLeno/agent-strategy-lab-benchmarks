export default function Hero() {
  return (
    <section id="hero" data-testid="hero" className="hero" aria-labelledby="hero-heading">
      <div className="hero__copy">
        <p className="eyebrow">Introducing LUMA</p>
        <h1 id="hero-heading">LUMA</h1>
        <p className="hero__positioning">The desk light that thinks like daylight.</p>
        <p className="hero__support">
          LUMA reads the time of day and shifts its color temperature, brightness and
          ambient glow to match — crisp and cool in the morning, warm and dim by night.
          One lamp, tuned to how your body actually works.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href="#pricing">
            Pre-order LUMA — $189
          </a>
          <a className="button button--secondary" href="#day-cycle">
            See it change through the day
          </a>
        </div>
        <dl className="hero__stats">
          <div>
            <dt>Color range</dt>
            <dd>1800K–6500K</dd>
          </div>
          <div>
            <dt>Light output</dt>
            <dd>1,100 lm</dd>
          </div>
          <div>
            <dt>Warranty</dt>
            <dd>3 years</dd>
          </div>
        </dl>
      </div>
      <div className="hero__visual" aria-hidden="true">
        <svg className="lamp-illustration" viewBox="0 0 360 420" fill="none">
          <defs>
            <radialGradient id="heroGlow" cx="50%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#ffe3b0" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#ff9d4d" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ff9d4d" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="heroBase" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a3a42" />
              <stop offset="100%" stopColor="#1a1a1f" />
            </linearGradient>
          </defs>
          <ellipse cx="180" cy="150" rx="150" ry="150" fill="url(#heroGlow)" />
          <rect x="150" y="330" width="60" height="18" rx="6" fill="url(#heroBase)" />
          <rect x="120" y="348" width="120" height="14" rx="7" fill="#101014" />
          <rect x="172" y="180" width="16" height="150" rx="8" fill="url(#heroBase)" />
          <path
            d="M120 150c0-38 27-68 60-68s60 30 60 68c0 26-16 42-30 46h-60c-14-4-30-20-30-46z"
            fill="#f4f0ea"
          />
          <path
            d="M120 150c0-38 27-68 60-68s60 30 60 68"
            stroke="#d8d2c4"
            strokeWidth="2"
          />
          <ellipse cx="180" cy="150" rx="46" ry="30" fill="#ffdca3" opacity="0.9" />
        </svg>
      </div>
    </section>
  );
}
