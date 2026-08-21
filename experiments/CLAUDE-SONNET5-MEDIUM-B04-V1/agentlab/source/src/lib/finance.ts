// Pure, testable aggregation logic for the ATLAS dashboard. No React here.
// data/financial.json is the only source of truth; every value below is
// derived from it at runtime.

export type SegmentName = 'Enterprise' | 'Mid-Market' | 'SMB';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface OpexBreakdown {
  sales_marketing: number;
  research_development: number;
  general_admin: number;
}

export interface SegmentMonthData {
  revenue: number;
  budget: number;
  cogs: number;
  opex: OpexBreakdown;
  customers_start: number;
  new_customers: number;
  churned_customers: number;
  customers_end: number;
}

export interface CashBlock {
  opening_balance: number;
  non_operating_outflow: number;
  closing_balance: number;
}

export interface MonthData {
  month: string;
  quarter: Quarter;
  segments: Record<SegmentName, SegmentMonthData>;
  cash: CashBlock;
}

export interface FinancialMeta {
  company: string;
  fiscal_year: number;
  currency: string;
  amounts_in: string;
  segments: SegmentName[];
  quarters: Quarter[];
  opex_categories: (keyof OpexBreakdown)[];
  notes: string[];
}

export interface FinancialDocument {
  meta: FinancialMeta;
  months: MonthData[];
}

export type PeriodKey = 'full-year' | 'q1' | 'q2' | 'q3' | 'q4';
export type SegmentKey = 'all' | 'enterprise' | 'mid-market' | 'smb';

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: 'full-year', label: 'Full Year' },
  { key: 'q1', label: 'Q1' },
  { key: 'q2', label: 'Q2' },
  { key: 'q3', label: 'Q3' },
  { key: 'q4', label: 'Q4' },
];

export const SEGMENTS: { key: SegmentKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'enterprise', label: 'Enterprise' },
  { key: 'mid-market', label: 'Mid-Market' },
  { key: 'smb', label: 'SMB' },
];

const SEGMENT_NAME_BY_KEY: Record<Exclude<SegmentKey, 'all'>, SegmentName> = {
  enterprise: 'Enterprise',
  'mid-market': 'Mid-Market',
  smb: 'SMB',
};

export interface Kpis {
  revenue: number;
  budget: number;
  budget_variance: number;
  cogs: number;
  opex: number;
  ebitda: number;
  cash: number;
  new_customers: number;
  churn_rate: number;
}

export function monthsForPeriod(doc: FinancialDocument, period: PeriodKey): MonthData[] {
  if (period === 'full-year') return doc.months;
  const quarter = period.toUpperCase() as Quarter;
  return doc.months.filter((month) => month.quarter === quarter);
}

export function segmentsForKey(doc: FinancialDocument, segment: SegmentKey): SegmentName[] {
  if (segment === 'all') return doc.meta.segments;
  return [SEGMENT_NAME_BY_KEY[segment]];
}

function opexTotal(opex: OpexBreakdown): number {
  return opex.sales_marketing + opex.research_development + opex.general_admin;
}

/** All KPI quantities required by the task, for a given (period, segment) pair. */
export function aggregate(doc: FinancialDocument, period: PeriodKey, segment: SegmentKey): Kpis {
  const months = monthsForPeriod(doc, period);
  const segments = segmentsForKey(doc, segment);

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

export interface MonthlyPoint {
  month: string;
  quarter: Quarter;
  revenue: number;
  budget: number;
}

/** Monthly revenue vs. budget series for the selected period and segments. */
export function monthlySeries(doc: FinancialDocument, period: PeriodKey, segment: SegmentKey): MonthlyPoint[] {
  const months = monthsForPeriod(doc, period);
  const segments = segmentsForKey(doc, segment);

  return months.map((month) => {
    let revenue = 0;
    let budget = 0;
    for (const name of segments) {
      const entry = month.segments[name];
      revenue += entry.revenue;
      budget += entry.budget;
    }
    return { month: month.month, quarter: month.quarter, revenue, budget };
  });
}

export interface SegmentBreakdown {
  segment: SegmentName;
  revenue: number;
  cogs: number;
  opex: number;
  ebitda: number;
  share: number;
}

/** Per-segment revenue/COGS/OpEx/EBITDA and share of total revenue, for a period. */
export function segmentBreakdown(doc: FinancialDocument, period: PeriodKey): SegmentBreakdown[] {
  const months = monthsForPeriod(doc, period);
  const totals = doc.meta.segments.map((name) => {
    let revenue = 0;
    let cogs = 0;
    let opex = 0;
    for (const month of months) {
      const entry = month.segments[name];
      revenue += entry.revenue;
      cogs += entry.cogs;
      opex += opexTotal(entry.opex);
    }
    return { segment: name, revenue, cogs, opex, ebitda: revenue - cogs - opex };
  });

  const totalRevenue = totals.reduce((sum, row) => sum + row.revenue, 0);

  return totals.map((row) => ({
    ...row,
    share: totalRevenue === 0 ? 0 : row.revenue / totalRevenue,
  }));
}

export const MONEY_KEYS: (keyof Kpis)[] = ['revenue', 'budget', 'budget_variance', 'cogs', 'opex', 'ebitda', 'cash'];
export const COUNT_KEYS: (keyof Kpis)[] = ['new_customers'];
export const RATE_KEYS: (keyof Kpis)[] = ['churn_rate'];
