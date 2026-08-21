import { useMemo, useState } from 'react';
import { financial } from './data';
import { aggregate, monthlySeries, segmentBreakdown, PERIODS, SEGMENTS } from './lib/finance';
import type { PeriodKey, SegmentKey } from './lib/finance';
import FilterBar from './components/FilterBar';
import KpiRow from './components/KpiRow';
import RevenueBudgetChart from './components/charts/RevenueBudgetChart';
import CostBreakdownChart from './components/charts/CostBreakdownChart';
import SegmentComparisonChart from './components/charts/SegmentComparisonChart';
import SegmentTable from './components/SegmentTable';

export default function App() {
  const [period, setPeriod] = useState<PeriodKey>('full-year');
  const [segment, setSegment] = useState<SegmentKey>('all');

  const kpis = useMemo(() => aggregate(financial, period, segment), [period, segment]);
  const series = useMemo(() => monthlySeries(financial, period, segment), [period, segment]);
  const breakdown = useMemo(() => segmentBreakdown(financial, period), [period]);

  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? period;
  const segmentLabel = SEGMENTS.find((s) => s.key === segment)?.label ?? segment;

  return (
    <div className="app">
      <header className="app__header">
        <h1>ATLAS Financial Dashboard</h1>
        <p className="app__subtitle">
          {financial.meta.company} · Fiscal Year {financial.meta.fiscal_year} · Viewing{' '}
          <strong>{periodLabel}</strong> · <strong>{segmentLabel}</strong> segment
        </p>
      </header>
      <main>
        <FilterBar period={period} segment={segment} onPeriodChange={setPeriod} onSegmentChange={setSegment} />
        <KpiRow kpis={kpis} />
        <section className="chart-grid" aria-label="Charts">
          <RevenueBudgetChart points={series} />
          <CostBreakdownChart cogs={kpis.cogs} opex={kpis.opex} ebitda={kpis.ebitda} />
          <SegmentComparisonChart rows={breakdown} activeSegment={segment} />
        </section>
        <section aria-labelledby="segment-table-heading">
          <h2 id="segment-table-heading">Segment Detail</h2>
          <SegmentTable rows={breakdown} />
        </section>
      </main>
    </div>
  );
}
