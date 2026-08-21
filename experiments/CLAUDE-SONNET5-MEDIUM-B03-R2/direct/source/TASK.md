# B3 — LUMA Landing Page (React + TypeScript)

Build a premium marketing landing page for **LUMA**, a fictional smart desktop
light.

The product does not exist. You are inventing its positioning, copy and visual
identity — but not its category: LUMA is a desk lamp with adaptive white
temperature, ambient color, presence detection and an app.

---

## 1. Environment

- Node 22 with npm. The toolchain is already installed in `node_modules/`.
- **There is no network access.** Do not add, remove, upgrade or vendor any
  dependency, and do not run `npm install`. Everything required is present:
  React 19, TypeScript, Vite, Vitest, Testing Library, puppeteer-core.
- The application is a Vite SPA. Entry point: `index.html` -> `src/main.tsx`.
- Work only inside this repository.

## 2. Required sections

All eight, in a deliberate order, each substantial enough to stand on its own:

1. **Hero** — product name, positioning line, supporting copy, primary and
   secondary call to action, and a visual representation of the product.
2. **Day cycle** — an interactive demonstration of how LUMA's light changes
   across the day (for example morning / focus / evening / night). Changing the
   selected moment must visibly change the illustration and the copy.
3. **Features** — the distinctive capabilities, each with an icon or graphic,
   a title and a short description.
4. **Specs** — concrete technical specifications in a scannable structure
   (dimensions, lumens, CRI, color temperature range, power, connectivity,
   materials, warranty).
5. **Social proof** — testimonials and/or press quotes with attributed names
   and roles, plus at least one quantified claim.
6. **Pricing** — at least two purchase options with differences that matter,
   a highlighted recommendation, and a call to action per option.
7. **FAQ** — at least six questions in an interactive accordion; opening one
   reveals its answer.
8. **Footer** — navigation groups, brand block, and legal line.

Nothing may be a placeholder: no lorem ipsum, no "coming soon", no empty
sections. The copy must read like a real product launch.

## 3. Assets

- **CSS, inline SVG, and local files you create are the only allowed sources of
  visuals.** No remote fonts, images, scripts, styles or API calls at runtime.
  The validated build must work fully offline.
- No stock photography and no `<img>` pointing at a remote URL. Build the
  product imagery from CSS and SVG.
- The system font stack is fine; a locally defined `@font-face` is fine if you
  ship the file yourself.

## 4. Interactions (must actually work)

- The day-cycle control changes state and the visual output.
- The FAQ accordion opens and closes.
- Navigation links to sections scroll to those sections.
- Hover, focus and active states on every interactive element.
- Any motion respects `prefers-reduced-motion`.

## 5. Responsive

- Correct at 1440x900 and at 390x844.
- No horizontal page scrolling at 390px, nothing clipped or overlapping.
- The layout must genuinely reflow — not just shrink.

## 6. Accessibility (basic)

- Exactly one `<h1>`, and a coherent heading hierarchy below it.
- `<header>`, `<main>`, `<footer>` landmarks; navigation inside `<nav>`.
- Real controls: `<button>`, `<a>`, `<input>`. No clickable `<div>`s.
- Every control has an accessible name; the accordion exposes its expanded
  state (`aria-expanded`) and the day-cycle control exposes which option is
  selected (`aria-pressed`, `aria-current`, or a radio group).
- Decorative SVG is hidden from assistive technology.

## 7. Required markup contract

External validation depends on these hooks. They are part of the task.

Each section has both the `id` and the `data-testid` below, on the same element:

| Section      | `id`           | `data-testid`  |
| ------------ | -------------- | -------------- |
| Hero         | `hero`         | `hero`         |
| Day cycle    | `day-cycle`    | `day-cycle`    |
| Features     | `features`     | `features`     |
| Specs        | `specs`        | `specs`        |
| Social proof | `social-proof` | `social-proof` |
| Pricing      | `pricing`      | `pricing`      |
| FAQ          | `faq`          | `faq`          |
| Footer       | `footer`       | `footer`       |

Additionally:

- `data-testid="day-cycle-option"` on **each** selectable moment of the day
  (at least three), each a real control.
- `data-testid="day-cycle-stage"` on the element that visually represents the
  currently selected moment.
- `data-testid="faq-item"` on each FAQ entry, with the question inside a real
  `<button>` carrying `data-testid="faq-question"` and `aria-expanded`.
- `data-testid="pricing-plan"` on each purchase option.

Do not use these attributes anywhere else.

## 8. Quality bar

Judged as a premium product page:

- Deliberate typographic scale and vertical rhythm.
- A coherent, confident color system — not default blues on white.
- Composition and spacing that create hierarchy; the eye should know where to go.
- Details: gradients, shadows, radii, borders, states — consistent, not random.
- Clean, readable, typed code, split into components. No `any`, no dead code.
- No TypeScript errors, no runtime console errors, no React key warnings.

## 9. Validation (this is exactly what will be run)

```
npm run typecheck
npm run build
npm test
npm run check
```

`npm run check` serves the existing `dist/` produced by `npm run build` and
drives a headless Chrome over it. Run `npm run build` before `npm run check`.

`scripts/` (the external validation harness), `vitest.config.ts`,
`vite.config.ts`, `tsconfig.json` and `package.json` are the validation
contract: **do not modify them**. Add your own tests under `src/`.

## 10. Definition of done

- All four validation commands exit 0.
- All eight sections exist, are populated with real copy, and are visually
  finished at 1440x900 and 390x844.
- Day cycle and FAQ interactions work in the built application.
- No runtime network requests.
