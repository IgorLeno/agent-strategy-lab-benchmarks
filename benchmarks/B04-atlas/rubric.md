# B4 — Rubric (FROZEN)

Total: 100 points. Scored blind on `Candidate X` / `Candidate Y`.
Frozen before any run. Any change after outputs are observed makes the battery
`RUN_INVALID`.

Evidence used by the evaluator, per candidate:
- the built app at 1440x900 and 390x844, driven across filter combinations;
- an independent recomputation from `data/financial.json`;
- the repository diff, including the tests.

| # | Criterion      | Weight |
| - | -------------- | ------ |
| 1 | Correctness    | 30     |
| 2 | Visualization  | 25     |
| 3 | Filters        | 20     |
| 4 | Polish         | 15     |
| 5 | Responsive     | 5      |
| 6 | Code           | 5      |

## 1. Correctness — 30

Numbers must be derivable from the JSON and actually correct.

- **27-30** — Every KPI, chart series and table cell matches an independent
  recomputation under Full Year, every quarter and every segment; EBITDA
  derived, cash correctly company-level and period-terminal; churn computed as
  total churned over total customers at period start.
- **21-26** — All KPIs correct; one derived quantity subtly off (rounding,
  margin denominator, cash on a quarter filter).
- **13-20** — One KPI wrong, or aggregates drift under one filter combination.
- **6-12** — Several wrong values, or a quantity that cannot be traced to the
  JSON.
- **1-5** — Hardcoded or invented numbers present.
- **0** — Numbers unrelated to the data.

Any invented or hardcoded figure caps this criterion at 5.

## 2. Visualization — 25

- **23-25** — At least three charts, hand-built, genuinely readable: labelled
  axes or legends, sensible scales, values recoverable by eye, deliberate use
  of color, no chartjunk.
- **18-22** — Three charts, readable, with one weak encoding.
- **11-17** — Charts present but crude: missing labels, unclear scale, or one
  chart that is decorative rather than informative.
- **5-10** — One or two charts, poorly readable.
- **1-4** — Bars without meaning.
- **0** — No charts.

## 3. Filters — 20

- Period `Full Year` / `Q1`-`Q4` present and correct (up to 6).
- Segment `All` + each segment present and correct (up to 6).
- Every panel (KPIs, charts, table) recomputes together; no stale panel (up to 5).
- Active filter state visible and obvious (up to 3).

## 4. Polish — 15

- **14-15** — Reads like a real finance product: aligned figures, consistent
  formatting, calm density, deliberate positive/negative variance color,
  refined spacing and typography.
- **10-13** — Clean and consistent, a few unrefined details.
- **6-9** — Functional and plain.
- **1-5** — Cluttered or inconsistent; misaligned numbers, mixed formats.
- **0** — Unreadable presentation.

## 5. Responsive — 5

- **5** — Correct at 390x844: charts and table readable, contained scrolling,
  no page-level horizontal scroll.
- **3-4** — Works with rough edges.
- **1-2** — Charts or table clipped or overflowing the page.
- **0** — Unusable at 390px.

## 6. Code — 5

- **5** — Pure aggregation layer separated from components, typed, the five
  required test cases genuinely covered, no dead code.
- **3-4** — Reasonable; tests present but shallow.
- **1-2** — Aggregation tangled into components; trivial tests.
- **0** — No meaningful tests or unreadable code.
