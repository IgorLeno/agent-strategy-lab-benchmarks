export interface OpexCategories {
  sales_marketing: number;
  research_development: number;
  general_admin: number;
}

export interface SegmentMonthData {
  revenue: number;
  budget: number;
  cogs: number;
  opex: OpexCategories;
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

export const SEGMENT_NAMES = ['Enterprise', 'Mid-Market', 'SMB'] as const;
export type SegmentName = (typeof SEGMENT_NAMES)[number];

export interface MonthData {
  month: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  segments: Record<SegmentName, SegmentMonthData>;
  cash: CashBlock;
}

export interface FinancialMeta {
  company: string;
  fiscal_year: number;
  currency: string;
  amounts_in: string;
  segments: SegmentName[];
  quarters: string[];
  opex_categories: string[];
  notes: string[];
}

export interface FinancialDocument {
  meta: FinancialMeta;
  months: MonthData[];
}

export type PeriodKey = 'full-year' | 'q1' | 'q2' | 'q3' | 'q4';
export type SegmentFilterKey = 'all' | 'enterprise' | 'mid-market' | 'smb';

export interface Aggregate {
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

export interface MonthlyPoint {
  month: string;
  revenue: number;
  budget: number;
  cogs: number;
  opex: number;
  ebitda: number;
}

export interface SegmentSummary {
  segment: SegmentFilterKey;
  name: SegmentName;
  revenue: number;
  cogs: number;
  opex: number;
  ebitda: number;
  share: number;
}
