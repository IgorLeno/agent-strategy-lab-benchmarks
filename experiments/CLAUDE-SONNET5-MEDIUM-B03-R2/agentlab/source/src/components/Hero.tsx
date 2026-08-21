export function Hero() {
  return (
    <section id="hero" data-testid="hero" className="hero section">
      <div className="hero__copy">
        <p className="eyebrow">Iluminação circadiana de mesa</p>
        <h1>
          LUMA. A luz que <span className="accent-text">segue o seu dia</span>, não o contrário.
        </h1>
        <p className="hero__lede">
          Uma luminária de mesa com branco adaptativo, cor ambiente e detecção de presença, que
          muda de manhã, foco, entardecer e noite automaticamente — para que a sua energia mude
          com ela, e não apesar dela.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href="#pricing">
            Comprar a LUMA
          </a>
          <a className="button button--secondary" href="#day-cycle">
            Ver o ciclo do dia
          </a>
        </div>
        <dl className="hero__stats">
          <div>
            <dt>Faixa de cor</dt>
            <dd>2000K–6500K</dd>
          </div>
          <div>
            <dt>CRI</dt>
            <dd>95+</dd>
          </div>
          <div>
            <dt>Garantia</dt>
            <dd>3 anos</dd>
          </div>
        </dl>
      </div>
      <div className="hero__visual" aria-hidden="true">
        <svg viewBox="0 0 420 420" className="hero__lamp-svg">
          <defs>
            <radialGradient id="lampGlow" cx="50%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#ffe3b0" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#ff9d6c" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ff9d6c" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lampBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a4f63" />
              <stop offset="100%" stopColor="#23263a" />
            </linearGradient>
          </defs>
          <circle cx="210" cy="150" r="150" fill="url(#lampGlow)" />
          <rect x="70" y="360" width="280" height="18" rx="9" fill="url(#lampBody)" />
          <rect x="196" y="180" width="18" height="182" rx="9" fill="url(#lampBody)" />
          <path
            d="M120 150 C 120 100, 300 100, 300 150 L 275 190 C 275 160, 145 160, 145 190 Z"
            fill="url(#lampBody)"
          />
          <ellipse cx="210" cy="150" rx="90" ry="46" fill="#ffcf8a" opacity="0.9" />
          <ellipse cx="210" cy="150" rx="60" ry="30" fill="#fff4d8" />
        </svg>
      </div>
    </section>
  );
}
