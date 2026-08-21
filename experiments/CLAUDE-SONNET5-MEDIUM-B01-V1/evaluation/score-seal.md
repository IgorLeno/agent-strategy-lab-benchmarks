# Score seal — CLAUDE-SONNET5-MEDIUM-B01-V1

Scoring occurred **before** reveal.

These totals were sealed while the candidates were labelled only Candidate X and Candidate Y. Arm identity is not recorded in this file.

Evidence used: the canonical blind artifact `visual-b01-blind-review` (workflow run `32458290950`, artifact ID `9438007646`, digest `sha256:e714bff6893b08b66d4dcd5826ebe214c73dc2d4763268cd73a6720f07e18da5`), the frozen B01 rubric, and the sanitised validation summaries in the blind bundle. Scores were not recalculated after this seal.

| Criterion | X | Y | Out of |
| --- | ---: | ---: | ---: |
| Visual fidelity | 48 | 44 | 60 |
| Responsive | 14 | 10 | 15 |
| Completeness | 10 | 10 | 10 |
| Build/correctness | 10 | 10 | 10 |
| Code quality | 5 | 5 | 5 |
| **TOTAL** | **87** | **79** | **100** |

Candidate X: 87/100

Candidate Y: 79/100

Blind difference: Candidate X +8

Arithmetic check: `48 + 14 + 10 + 10 + 5 = 87`; `44 + 10 + 10 + 10 + 5 = 79`.

`score sealed before arm identity was revealed.`

## Candidate X

### Visual fidelity — 48/60

Band 42–53: clearly the same interface as the reference.

- sidebar and initial content position are close to the reference;
- four stat cards with dimensions relatively close to the reference;
- active `Overview` state preserved;
- chart is significantly taller than the reference;
- chart bars are too tall;
- `Recent projects` is shifted downward;
- the right column is compressed, especially `Activity`;
- `Quota` rises too far as a consequence;
- colour differences on indicators/trends and on some controls.

### Responsive — 14/15

Band 14–15: deliberate mobile adaptation.

- navigation becomes compact;
- layout switches to a single column;
- the wide table is contained inside its own block;
- no page-level horizontal scroll;
- no element overflows the viewport;
- no errors or exceptions on mobile.

### Completeness — 10/10

All reference blocks are present; no relevant region was invented.

### Build/correctness — 10/10

- `typecheck`: PASS
- `build`: PASS
- `test`: PASS
- `check`: PASS
- first pass: true
- repair used: false
- no console errors;
- no runtime exceptions.

### Code quality — 5/5

Sensible decomposition by visual components: separate components for sidebar, header, cards, chart, table, activity and quota. Structure is not monolithic. Styling approach is consistent.

## Candidate Y

### Visual fidelity — 44/60

Band 42–53: clearly the same interface as the reference.

- all major blocks are present;
- stat cards are taller and shifted downward;
- chart and table sit visibly lower than in the reference;
- the chart is also significantly taller;
- the active `Overview` visual state does not preserve the large selected background;
- perceptible weight/colour differences in table text;
- `Activity` and `Quota` sit vertically closer to the reference than in X, but the main layout has greater overall drift.

### Responsive — 10/15

Band 10–13: functional at 390px, with several rough edges.

- no page-level horizontal scroll;
- no element overflows the viewport;
- no errors or exceptions;
- the desktop sidebar remains as a large block above the content;
- the plan/upgrade block also occupies a large area before the main content;
- the header avatar wraps onto a separate line;
- adaptation is functional, but has several rough edges.

### Completeness — 10/10

All reference blocks are present; no relevant region was invented.

### Build/correctness — 10/10

- `typecheck`: PASS
- `build`: PASS
- `test`: PASS
- `check`: PASS
- first pass: true
- repair used: false
- no console errors;
- no runtime exceptions.

### Code quality — 5/5

Sensible decomposition by visual components: separate components for sidebar, header, cards, chart, table, activity and quota. Structure is not monolithic. Styling approach is consistent.

## Shared notes

Completeness, build/correctness and code quality are tied. The sealed quality gap is visual fidelity (−4 for Y) and responsive (−4 for Y).
