import Lamp from './Lamp';

export default function Hero() {
  return (
    <section id="hero" data-testid="hero" className="hero">
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="eyebrow">Introducing LUMA</p>
          <h1>Light that keeps pace with your day.</h1>
          <p className="hero__lead">
            LUMA is a desktop light that shifts from a crisp, focus-ready white in the
            afternoon to an ember-warm glow at night — automatically, without a single
            tap. One lamp, tuned to every hour you spend at your desk.
          </p>
          <div className="hero__actions">
            <a href="#pricing" className="button button--primary">
              Order LUMA — from $179
            </a>
            <a href="#day-cycle" className="button button--secondary">
              See it change through the day
            </a>
          </div>
          <dl className="hero__stats">
            <div>
              <dt>Color range</dt>
              <dd>1800K – 6500K</dd>
            </div>
            <div>
              <dt>Color accuracy</dt>
              <dd>97 CRI</dd>
            </div>
            <div>
              <dt>Warranty</dt>
              <dd>3 years</dd>
            </div>
          </dl>
        </div>
        <div className="hero__visual">
          <Lamp
            gradientId="hero-lamp"
            colorFrom="#ffb168"
            colorTo="#fff6e6"
            glow="#ffcf8a"
            className="hero__lamp"
          />
        </div>
      </div>
    </section>
  );
}
