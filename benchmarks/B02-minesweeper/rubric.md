# B2 — Rubric (FROZEN)

Total: 100 points. Scored blind on `Candidate X` / `Candidate Y`.
Frozen before any run. Any change after outputs are observed makes the battery
`RUN_INVALID`.

Evidence used by the evaluator, per candidate:
- the built app played by hand at 1440x900 and at 390x844 (touch emulation);
- screenshots of covered / mid-game / win / loss states;
- the repository diff, including the tests.

| # | Criterion      | Weight |
| - | -------------- | ------ |
| 1 | Functionality  | 40     |
| 2 | Design         | 30     |
| 3 | UX             | 15     |
| 4 | Responsive     | 10     |
| 5 | Code           | 5      |

## 1. Functionality — 40

Each mandatory behaviour is worth up to the points below; partial credit for
partially correct behaviour.

| Behaviour                                        | Points |
| ------------------------------------------------ | ------ |
| Default 16x16 / 40 mines on first paint           | 3      |
| First click always safe                           | 6      |
| Reveal with correct adjacent counts               | 5      |
| Recursive flood reveal, correct edges, no overflow| 6      |
| Flags: place, remove, block reveal                | 5      |
| Mine counter (mines - flags, may go negative)     | 3      |
| Timer: starts, stops, resets correctly            | 3      |
| Win detection and end state                       | 4      |
| Loss detection, all mines shown, board locked     | 3      |
| Restart returns to a clean game                   | 2      |

The three difficulties (9x9/10, 16x16/40, 30x16/99) are covered under
Completeness inside this section: subtract up to 4 points if any is missing or
wrong.

## 2. Design — 30

- **27-30** — Looks like a shipped product: coherent palette, consistent
  spacing and type, well-crafted cell states, polished win/loss presentation.
- **21-26** — Clean and consistent, with a few unrefined details.
- **14-20** — Functional and plain; default-ish styling, some inconsistency.
- **7-13** — Visibly unstyled or inconsistent; jarring colors, misaligned grid.
- **1-6** — Raw HTML look.
- **0** — Actively broken visually.

Classic (or deliberately alternative but consistent and legible) number colors
are expected: subtract up to 4 within band if numbers are hard to read.

## 3. UX — 15

- Mouse: left reveal, right flag, no context menu over the board (up to 4).
- Touch: tap reveal, long press flag, no accidental double action, no text
  selection or native callout (up to 5).
- Feedback: hover/active/focus states, clear status, no layout jump (up to 3).
- Difficulty switching and restart are obvious and immediate (up to 3).

## 4. Responsive — 10

- **9-10** — Comfortable at 1440x900 and 390x844, including Expert on mobile,
  with board scrolling contained and no page-level horizontal scroll.
- **6-8** — Works with minor discomfort (small targets, tight controls).
- **3-5** — Expert board awkward or partially unreachable on mobile.
- **1-2** — Page scrolls horizontally or controls are unusable on mobile.
- **0** — Unusable at 390px.

## 5. Code — 5

- **5** — Pure game logic separated from components, typed, well-named,
  deterministic tests that genuinely cover the six required cases.
- **3-4** — Reasonable structure; tests present but shallow.
- **1-2** — Logic tangled into components; tests trivial.
- **0** — No meaningful tests or unreadable code.
