# B1 — Rubric (FROZEN)

Total: 100 points. Scored blind on `Candidate X` / `Candidate Y`.
Frozen before any run. Any change after outputs are observed makes the battery
`RUN_INVALID`.

Evidence used by the evaluator, per candidate:
- screenshot of the built app at 1440x900, side by side with `reference.png`;
- screenshot of the built app at 390x844;
- the repository diff.

| # | Criterion          | Weight |
| - | ------------------ | ------ |
| 1 | Visual fidelity    | 60     |
| 2 | Responsive         | 15     |
| 3 | Completeness       | 10     |
| 4 | Build/correctness  | 10     |
| 5 | Code quality       | 5      |

## 1. Visual fidelity — 60

How close the 1440x900 render is to `reference.png`.

- **54-60** — Near-indistinguishable at a glance. Layout proportions, spacing
  rhythm, color values, type scale and weights, radii and borders all match.
  Differences require pixel comparison to find.
- **42-53** — Clearly the same interface. Small drifts in spacing, shade, font
  size or weight; every block is where it belongs.
- **30-41** — Recognisably the same design, but several visible deviations:
  wrong proportions in one region, noticeably different palette, inconsistent
  spacing.
- **18-29** — Same general structure, different-looking product. Palette,
  density or typography substantially off.
- **6-17** — Loose interpretation; the structure itself departs from the
  reference.
- **0-5** — Unrelated to the reference.

Deduct within band for: wrong text content, wrong numbers, missing states
(active nav item, tag colors, progress fills), misaligned columns.

## 2. Responsive — 15

The 390x844 render.

- **14-15** — Deliberate adaptation: content reflows, nothing clipped or
  overlapping, no page-level horizontal scroll, hierarchy preserved, wide
  content handled inside its own scroll container.
- **10-13** — Works, with one or two rough edges (cramped block, awkward
  wrapping).
- **6-9** — Usable but visibly unconsidered; desktop layout barely adapted.
- **1-5** — Broken: page scrolls horizontally, content clipped or overlapping.
- **0** — Unusable at 390px.

## 3. Completeness — 10

Every section of the reference present, and **nothing invented**.

- **10** — All regions present; no invented section, widget, nav entry, row or
  metric.
- **7-9** — One minor omission or one small invented detail.
- **4-6** — A whole region missing, or an invented region.
- **1-3** — Several regions missing or invented.
- **0** — Bears no relation to the reference content.

## 4. Build/correctness — 10

- **10** — All four validation commands pass on the first attempt; no console
  errors or React warnings at either viewport.
- **7-9** — Passes, but only after the single allowed repair.
- **4-6** — Passes with runtime console errors or React warnings.
- **1-3** — Validation partially fails.
- **0** — Does not build.

Note: the pass/repair fact is also recorded as a cost metric. Here it is scored
only as product correctness.

## 5. Code quality — 5

- **5** — Sensible component decomposition matching the visual structure, typed
  props, no `any`, no dead code, consistent styling approach.
- **3-4** — Reasonable, with some duplication or an oversized component.
- **1-2** — Monolithic or copy-pasted; typing weak.
- **0** — Unreadable or `any` everywhere.
