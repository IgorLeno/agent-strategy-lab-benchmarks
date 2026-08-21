import { useMemo, useState } from 'react';
import financial from '../data/financial.json';
import { Filters } from './components/Filters';
import { KpiGrid } from './components/KpiGrid';
import { SegmentTable } from './components/SegmentTable';
import { RevenueBudgetChart } from './components/charts/RevenueBudgetChart';
import { CostBreakdownChart } from './components/charts/CostBreakdownChart';
import { SegmentComparisonChart } from './components/charts/SegmentComparisonChart';
import { aggregate, monthlySeries, segmentSummaries } from './lib/finance';
import type { FinancialDocument, PeriodKey, SegmentFilterKey } from './lib/types';

const document = financial as FinancialDocument;

const PERIOD_LABELS: Record<PeriodKey, string> = {
  'full-year': 'Full Year 2025',
  q1: 'Q1 2025',
  q2: 'Q2 2025',
  q3: 'Q3 2025',
  q4: 'Q4 2025',
};

const SEGMENT_LABELS: Record<SegmentFilterKey, string> = {
  all: 'all segments',
  enterprise: 'Enterprise',
  'mid-market': 'Mid-Market',
  smb: 'SMB',
};

export default function App() {
  const [period, setPeriod] = useState<PeriodKey>('full-year');
  const [segment, setSegment] = useState<SegmentFilterKey>('all');

  const kpis = useMemo(() => aggregate(document, period, segment), [period, segment]);
  const series = useMemo(() => monthlySeries(document, period, segment), [period, segment]);
  const segments = useMemo(() => segmentSummaries(document, period), [period]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>ATLAS Financial Dashboard</h1>
        <p>
          {document.meta.company} · Fiscal Year {document.meta.fiscal_year} · Showing{' '}
          {PERIOD_LABELS[period]}, {SEGMENT_LABELS[segment]}
        </p>
      </header>

      <main>
        <Filters period={period} segment={segment} onPeriodChange={setPeriod} onSegmentChange={setSegment} />

        <KpiGrid aggregate={kpis} />
        <p className="cash-note">Cash reflects the company-wide closing balance for the period and does not change with the segment filter.</p>

        <section className="panels" aria-label="Charts">
          <div className="panel" data-testid="chart" data-chart="revenue-vs-budget">
            <h2>Revenue vs. Budget</h2>
            <p className="panel-subtitle">Monthly actuals against budget for the selected period</p>
            <RevenueBudgetChart data={series} />
          </div>

          <div className="panel" data-testid="chart" data-chart="cost-profitability">
            <h2>Cost &amp; Profitability</h2>
            <p className="panel-subtitle">COGS, OpEx and EBITDA by month</p>
            <CostBreakdownChart data={series} />
          </div>

          <div className="panel" data-testid="chart" data-chart="segment-comparison">
            <h2>Revenue by Segment</h2>
            <p className="panel-subtitle">Segment mix for the selected period</p>
            <SegmentComparisonChart data={segments} />
          </div>
        </section>

        <section className="panel" aria-label="Segment breakdown table">
          <h2>Segment Breakdown</h2>
          <p className="panel-subtitle">Revenue, cost and profitability per segment for the selected period</p>
          <SegmentTable data={segments} />
        </section>
      </main>
    </div>
  );
}
