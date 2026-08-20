export function Hero() {
  return (
    <section id="hero" data-testid="hero" className="hero section">
      <div className="hero__content">
        <p className="eyebrow">Luz de mesa inteligente</p>
        <h1>
          A luz que aprende <span className="text-gradient">o formato do seu dia</span>
        </h1>
        <p className="hero__lede">
          LUMA ajusta temperatura, cor e presença automaticamente — do amanhecer que te acorda ao brilho
          mínimo que te encontra na escuridão. Uma luminária, um app, um dia inteiro sob controle.
        </p>
        <div className="hero__actions">
          <a href="#pricing" className="btn btn--primary btn--large">
            Comprar LUMA
          </a>
          <a href="#day-cycle" className="btn btn--ghost btn--large">
            Ver como funciona
          </a>
        </div>
        <dl className="hero__stats">
          <div>
            <dt>Temperatura de cor</dt>
            <dd>2700K–6500K</dd>
          </div>
          <div>
            <dt>CRI</dt>
            <dd>97+</dd>
          </div>
          <div>
            <dt>Garantia</dt>
            <dd>3 anos</dd>
          </div>
        </dl>
      </div>

      <div className="hero__visual" aria-hidden="true">
        <svg viewBox="0 0 420 460" className="lamp-illustration">
          <defs>
            <radialGradient id="lampGlow" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#ff9f4d" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ff9f4d" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lampBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a3d46" />
              <stop offset="100%" stopColor="#17181d" />
            </linearGradient>
          </defs>
          <ellipse cx="210" cy="150" rx="150" ry="150" fill="url(#lampGlow)" />
          <rect x="60" y="410" width="300" height="16" rx="8" fill="#0f1013" />
          <rect x="150" y="330" width="120" height="14" rx="7" fill="url(#lampBody)" />
          <rect x="196" y="150" width="28" height="190" rx="14" fill="url(#lampBody)" />
          <path d="M120 150 C120 90 170 60 210 60 C250 60 300 90 300 150 L300 168 C300 190 280 205 210 205 C140 205 120 190 120 168 Z" fill="url(#lampBody)" />
          <ellipse cx="210" cy="168" rx="90" ry="24" fill="#ffb26b" opacity="0.9" />
          <ellipse cx="210" cy="168" rx="70" ry="16" fill="#ffe3ba" />
        </svg>
      </div>
    </section>
  );
}
