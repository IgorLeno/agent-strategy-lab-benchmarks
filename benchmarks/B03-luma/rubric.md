# B3 — Rubric (FROZEN)

Total: 100 points. Scored blind on `Candidate X` / `Candidate Y`.
Frozen before any run. Any change after outputs are observed makes the battery
`RUN_INVALID`.

Evidence used by the evaluator, per candidate:
- full-page screenshots at 1440x900 and 390x844;
- the built app driven by hand for the interactive parts;
- the repository diff.

| # | Criterion     | Weight |
| - | ------------- | ------ |
| 1 | Visual        | 45     |
| 2 | Hierarchy     | 15     |
| 3 | Responsive    | 15     |
| 4 | Interactions  | 10     |
| 5 | Completeness  | 10     |
| 6 | Code          | 5      |

## 1. Visual — 45

Craft of the page as a premium product launch.

- **40-45** — Looks like a funded product site: confident color system,
  deliberate typographic scale, considered composition, product imagery built
  from CSS/SVG that actually reads as a lamp, consistent detailing.
- **31-39** — Strong and coherent, a few sections weaker than the rest.
- **21-30** — Competent but generic: template-ish, safe palette, flat detailing.
- **11-20** — Visibly unpolished: default styling, inconsistent spacing, weak
  or absent product imagery.
- **1-10** — Unstyled document with sections.
- **0** — Broken rendering.

## 2. Hierarchy — 15

- **14-15** — The eye is led: hero dominates, sections have clear entry points,
  type scale and spacing encode importance, calls to action are unmissable.
- **10-13** — Clear, with one or two flat or competing regions.
- **6-9** — Uniform emphasis; the reader has to work.
- **1-5** — Hierarchy absent or misleading.
- **0** — No structure.

## 3. Responsive — 15

- **14-15** — Genuine reflow at 390x844: nothing clipped or overlapping, no
  page-level horizontal scroll, mobile composition deliberately different.
- **10-13** — Works with a few rough edges.
- **6-9** — Shrunk rather than reflowed; cramped but usable.
- **1-5** — Broken: horizontal scroll, clipping, overlap.
- **0** — Unusable at 390px.

## 4. Interactions — 10

- Day-cycle control changes both visual stage and copy (up to 4).
- FAQ accordion opens/closes with correct `aria-expanded` (up to 3).
- Nav links scroll to sections; hover/focus/active states everywhere (up to 2).
- `prefers-reduced-motion` respected (up to 1).

## 5. Completeness — 10

All eight sections present and genuinely populated.

- **10** — All eight, each substantial, real copy throughout.
- **7-9** — All eight, one thin.
- **4-6** — One section missing, or two clearly thin.
- **1-3** — Two or more missing, or placeholder copy present.
- **0** — Most sections missing.

Any lorem ipsum or "coming soon" caps this criterion at 3.

## 6. Code — 5

- **5** — Section components, typed props, content data separated from markup,
  consistent styling approach, no dead code.
- **3-4** — Reasonable with duplication.
- **1-2** — One giant component, copy-pasted blocks.
- **0** — Unreadable.
