# B4 — ATLAS Financial Dashboard (React + TypeScript)

Build **ATLAS**, a CFO-grade financial dashboard for a fiscal year of company
data.

---

## 1. Environment

- Node 22 with npm. The toolchain is already installed in `node_modules/`.
- **There is no network access.** Do not add, remove, upgrade or vendor any
  dependency, and do not run `npm install`. Everything required is present:
  React 19, TypeScript, Vite, Vitest, Testing Library, puppeteer-core.
- The application is a Vite SPA. Entry point: `index.html` -> `src/main.tsx`.
- Charting libraries are **not** available. Build the charts yourself with SVG
  (or CSS). This is expected, not a workaround.
- Work only inside this repository.

## 2. Single source of truth

`data/financial.json` is the **only** source of numbers.

- Every displayed figure must be computed from that file at runtime.
- **Do not invent, hardcode, round-trip through a copy, extrapolate or mock any
  value.** No number may appear in the UI that cannot be derived from the JSON.
- Do not edit `data/financial.json`.

The file contains 12 months of fiscal year 2025. Each month carries, **per
segment** (`Enterprise`, `Mid-Market`, `SMB`): `revenue`, `budget`, `cogs`,
`opex` (three categories), `customers_start`, `new_customers`,
`churned_customers`, `customers_end`. Each month also carries a company-level
`cash` block with `opening_balance`, `non_operating_outflow` and
`closing_balance`.

### Derivation rules (exact)

For the currently selected months **M** and segments **S**:

| Quantity          | Definition                                                        |
| ----------------- | ----------------------------------------------------------------- |
| Revenue           | sum of `revenue` over M x S                                        |
| Budget            | sum of `budget` over M x S                                         |
| Budget variance   | Revenue - Budget                                                   |
| COGS              | sum of `cogs` over M x S                                           |
| OpEx              | sum of the three `opex` categories over M x S                      |
| EBITDA            | Revenue - COGS - OpEx                                              |
| Cash              | `cash.closing_balance` of the **last month in M** (company-level)  |
| New customers     | sum of `new_customers` over M x S                                  |
| Churn rate        | sum(`churned_customers`) / sum(`customers_start`) over M x S       |

EBITDA is never read from the file — it does not exist there. Cash is a
company-level quantity: the segment filter does **not** change it, and the UI
must say so.

## 3. Required content

- **KPI row** with, at minimum: Revenue, Budget (with variance vs. actual),
  COGS, OpEx, EBITDA (with margin), Cash, New customers, Churn rate.
- **Charts**, at least three, all built from the same filtered data:
  1. revenue vs. budget over time (monthly across the selected period);
  2. a cost/profitability breakdown (COGS, OpEx, EBITDA);
  3. a segment comparison.
- **A segment table** with per-segment revenue, COGS, OpEx, EBITDA and share of
  total.
- Every chart is labelled, has readable axes or legends, and is not decorative:
  a CFO must be able to read values off it.

## 4. Filters

- **Period**: `Full Year`, `Q1`, `Q2`, `Q3`, `Q4`.
- **Segments**: `All` plus each individual segment. Multi-select is welcome; a
  single-select that supports `All` + each segment is the minimum.
- Filters apply to **everything**: KPIs, charts and table recompute together and
  stay mutually consistent. No stale panel.
- The active filter state is visible at a glance.

## 5. Responsive

- Correct at 1440x900 and at 390x844.
- No horizontal page scrolling at 390px, nothing clipped or overlapping.
- Charts and the table must remain readable on mobile: reflow, or scroll inside
  their own container.

## 6. Accessibility (basic)

- Exactly one `<h1>`; coherent heading hierarchy.
- `<main>` landmark; filters in a labelled group; real controls only.
- Every control has an accessible name; selected state is exposed
  (`aria-pressed`, `aria-current`, or native form semantics).
- Charts have a text alternative (accessible name plus a summary or an
  associated table); decorative SVG is hidden from assistive technology.

## 7. Required markup contract

External validation depends on these hooks. They are part of the task.

**KPIs** — one element per KPI:

- `data-testid="kpi"`, `data-kpi="<key>"`, and `data-value="<raw number>"`.
- `<key>` is exactly one of: `revenue`, `budget`, `budget_variance`, `cogs`,
  `opex`, `ebitda`, `cash`, `new_customers`, `churn_rate`.
- `data-value` is the **raw** computed number, not formatted: no currency
  symbol, no thousands separator, `.` as the decimal separator, no suffix
  (`1234567.89`, not `$1.23M`). `churn_rate` is a decimal fraction
  (`0.0142`, not `1.42%`).
- The visible text of the card is formatted for humans, as you see fit.
- Money values are checked with a tolerance of 0.01, `churn_rate` with 1e-6.

**Filters**:

- `data-testid="filter-period"` on the period control, exposing options as
  `<button data-period="full-year|q1|q2|q3|q4">` or a `<select>` with those
  exact `value`s.
- `data-testid="filter-segment"` on the segment control, exposing options as
  `<button data-segment="all|enterprise|mid-market|smb">` or a `<select>` with
  those exact `value`s.
- Selecting an option must update the DOM without a page reload.

**Charts and table**:

- `data-testid="chart"` on each chart container, with a `data-chart` name.
- `data-testid="segment-table"` on the segment table, with one
  `data-testid="segment-row"` per segment carrying
  `data-segment="enterprise|mid-market|smb"`.

Do not use these attributes anywhere else.

## 8. Tests (mandatory)

Write real unit tests with Vitest under `src/`. At minimum, cover:

1. Full Year + All segments aggregation for Revenue, COGS, OpEx and EBITDA;
2. a quarter filter selecting exactly the right three months;
3. a segment filter excluding the other segments from every aggregate;
4. churn rate computed as total churned over total customers at period start;
5. Cash resolving to the closing balance of the last month of the period and
   staying unchanged when the segment filter changes.

Keep the aggregation logic in pure, testable modules separate from the React
components, and test it directly.

## 9. Quality bar

- Dense but calm: a dashboard a CFO reads, not a toy.
- Consistent number formatting, aligned figures, deliberate use of color for
  positive/negative variance.
- Clean, readable, typed code. No `any`, no dead code, no unused exports.
- No TypeScript errors, no runtime console errors, no React key warnings.

## 10. Validation (this is exactly what will be run)

```
npm run typecheck
npm run build
npm test
npm run check
```

`npm run check` serves the existing `dist/` produced by `npm run build`,
recomputes every KPI from `data/financial.json` independently, and compares it
against the DOM under several filter combinations. Run `npm run build` before
`npm run check`.

`scripts/` (the external validation harness), `vitest.config.ts`,
`vite.config.ts`, `tsconfig.json`, `package.json` and `data/financial.json` are
the validation contract: **do not modify them**. Add your own tests under
`src/`.

## 11. Definition of done

- All four validation commands exit 0.
- Every KPI matches an independent recomputation from the JSON, under Full Year
  and under quarter and segment filters.
- Charts, KPIs and table stay consistent with each other under every filter.
- Correct at 1440x900 and 390x844, with no invented data anywhere.
