import type {
  Aggregate,
  FinancialDocument,
  MonthData,
  MonthlyPoint,
  PeriodKey,
  SegmentFilterKey,
  SegmentName,
  SegmentSummary,
} from './types';

export const PERIODS: PeriodKey[] = ['full-year', 'q1', 'q2', 'q3', 'q4'];

export const SEGMENT_FILTERS: SegmentFilterKey[] = ['all', 'enterprise', 'mid-market', 'smb'];

export const SEGMENT_KEYS: Record<Exclude<SegmentFilterKey, 'all'>, SegmentName> = {
  enterprise: 'Enterprise',
  'mid-market': 'Mid-Market',
  smb: 'SMB',
};

export function monthsForPeriod(document: FinancialDocument, period: PeriodKey): MonthData[] {
  if (period === 'full-year') return document.months;
  const quarter = period.toUpperCase();
  return document.months.filter((month) => month.quarter === quarter);
}

export function segmentNamesForFilter(
  document: FinancialDocument,
  segment: SegmentFilterKey,
): SegmentName[] {
  if (segment === 'all') return document.meta.segments;
  return [SEGMENT_KEYS[segment]];
}

function opexTotal(opex: MonthData['segments'][SegmentName]['opex']): number {
  return opex.sales_marketing + opex.research_development + opex.general_admin;
}

/** Todas as grandezas exigidas pelo TASK, para um par (período, segmento). */
export function aggregate(
  document: FinancialDocument,
  period: PeriodKey,
  segment: SegmentFilterKey,
): Aggregate {
  const months = monthsForPeriod(document, period);
  const segments = segmentNamesForFilter(document, segment);

  let revenue = 0;
  let budget = 0;
  let cogs = 0;
  let opex = 0;
  let newCustomers = 0;
  let churned = 0;
  let customersStart = 0;

  for (const month of months) {
    for (const name of segments) {
      const entry = month.segments[name];
      revenue += entry.revenue;
      budget += entry.budget;
      cogs += entry.cogs;
      opex += opexTotal(entry.opex);
      newCustomers += entry.new_customers;
      churned += entry.churned_customers;
      customersStart += entry.customers_start;
    }
  }

  const lastMonth = months[months.length - 1];

  return {
    revenue,
    budget,
    budget_variance: revenue - budget,
    cogs,
    opex,
    ebitda: revenue - cogs - opex,
    cash: lastMonth.cash.closing_balance,
    new_customers: newCustomers,
    churn_rate: customersStart === 0 ? 0 : churned / customersStart,
  };
}

/** Série mensal (dentro do período selecionado) para os gráficos de série temporal. */
export function monthlySeries(
  document: FinancialDocument,
  period: PeriodKey,
  segment: SegmentFilterKey,
): MonthlyPoint[] {
  const months = monthsForPeriod(document, period);
  const segments = segmentNamesForFilter(document, segment);

  return months.map((month) => {
    let revenue = 0;
    let budget = 0;
    let cogs = 0;
    let opex = 0;

    for (const name of segments) {
      const entry = month.segments[name];
      revenue += entry.revenue;
      budget += entry.budget;
      cogs += entry.cogs;
      opex += opexTotal(entry.opex);
    }

    return {
      month: month.month,
      revenue,
      budget,
      cogs,
      opex,
      ebitda: revenue - cogs - opex,
    };
  });
}

/** Resumo por segmento (sempre os três, independente do filtro) para a tabela e o gráfico de comparação. */
export function segmentSummaries(
  document: FinancialDocument,
  period: PeriodKey,
): SegmentSummary[] {
  const months = monthsForPeriod(document, period);
  const filters: Exclude<SegmentFilterKey, 'all'>[] = ['enterprise', 'mid-market', 'smb'];

  const raw = filters.map((filterKey) => {
    const name = SEGMENT_KEYS[filterKey];
    let revenue = 0;
    let cogs = 0;
    let opex = 0;

    for (const month of months) {
      const entry = month.segments[name];
      revenue += entry.revenue;
      cogs += entry.cogs;
      opex += opexTotal(entry.opex);
    }

    return {
      segment: filterKey,
      name,
      revenue,
      cogs,
      opex,
      ebitda: revenue - cogs - opex,
    };
  });

  const totalRevenue = raw.reduce((sum, item) => sum + item.revenue, 0);

  return raw.map((item) => ({
    ...item,
    share: totalRevenue === 0 ? 0 : item.revenue / totalRevenue,
  }));
}

export const MONEY_KEYS: (keyof Aggregate)[] = [
  'revenue',
  'budget',
  'budget_variance',
  'cogs',
  'opex',
  'ebitda',
  'cash',
];
export const COUNT_KEYS: (keyof Aggregate)[] = ['new_customers'];
export const RATE_KEYS: (keyof Aggregate)[] = ['churn_rate'];
