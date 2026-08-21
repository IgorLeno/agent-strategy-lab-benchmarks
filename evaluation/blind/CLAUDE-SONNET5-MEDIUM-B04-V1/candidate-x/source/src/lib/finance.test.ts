import { describe, expect, it } from 'vitest';
import financial from '../../data/financial.json';
import { aggregate, monthsForPeriod, segmentSummaries } from './finance';
import type { FinancialDocument } from './types';

const document = financial as FinancialDocument;

function sumField(
  months: FinancialDocument['months'],
  segments: FinancialDocument['meta']['segments'],
  field: 'revenue' | 'cogs',
): number {
  let total = 0;
  for (const month of months) {
    for (const name of segments) {
      total += month.segments[name][field];
    }
  }
  return total;
}

function sumOpex(
  months: FinancialDocument['months'],
  segments: FinancialDocument['meta']['segments'],
): number {
  let total = 0;
  for (const month of months) {
    for (const name of segments) {
      const opex = month.segments[name].opex;
      total += opex.sales_marketing + opex.research_development + opex.general_admin;
    }
  }
  return total;
}

describe('aggregate', () => {
  it('sums revenue, cogs, opex and derives EBITDA for Full Year + All segments', () => {
    const result = aggregate(document, 'full-year', 'all');
    const expectedRevenue = sumField(document.months, document.meta.segments, 'revenue');
    const expectedCogs = sumField(document.months, document.meta.segments, 'cogs');
    const expectedOpex = sumOpex(document.months, document.meta.segments);

    expect(result.revenue).toBeCloseTo(expectedRevenue, 2);
    expect(result.cogs).toBeCloseTo(expectedCogs, 2);
    expect(result.opex).toBeCloseTo(expectedOpex, 2);
    expect(result.ebitda).toBeCloseTo(expectedRevenue - expectedCogs - expectedOpex, 2);
  });

  it('selects exactly the three months of a quarter', () => {
    const q2Months = monthsForPeriod(document, 'q2');
    expect(q2Months.map((month) => month.month)).toEqual(['2025-04', '2025-05', '2025-06']);

    const result = aggregate(document, 'q2', 'all');
    const expectedRevenue = sumField(q2Months, document.meta.segments, 'revenue');
    expect(result.revenue).toBeCloseTo(expectedRevenue, 2);
  });

  it('excludes other segments when a single segment filter is applied', () => {
    const enterpriseOnly = aggregate(document, 'full-year', 'enterprise');
    const expectedRevenue = sumField(document.months, ['Enterprise'], 'revenue');
    const allSegmentsRevenue = sumField(document.months, document.meta.segments, 'revenue');

    expect(enterpriseOnly.revenue).toBeCloseTo(expectedRevenue, 2);
    expect(enterpriseOnly.revenue).toBeLessThan(allSegmentsRevenue);
  });

  it('computes churn rate as total churned over total customers at period start', () => {
    const result = aggregate(document, 'full-year', 'all');

    let churned = 0;
    let customersStart = 0;
    for (const month of document.months) {
      for (const name of document.meta.segments) {
        churned += month.segments[name].churned_customers;
        customersStart += month.segments[name].customers_start;
      }
    }

    expect(result.churn_rate).toBeCloseTo(churned / customersStart, 6);
  });

  it('resolves cash to the closing balance of the last month and ignores the segment filter', () => {
    const q1AllSegments = aggregate(document, 'q1', 'all');
    const q1Enterprise = aggregate(document, 'q1', 'enterprise');
    const lastMonthOfQ1 = monthsForPeriod(document, 'q1').at(-1);

    expect(lastMonthOfQ1).toBeDefined();
    expect(q1AllSegments.cash).toBeCloseTo(lastMonthOfQ1!.cash.closing_balance, 2);
    expect(q1AllSegments.cash).toBe(q1Enterprise.cash);
  });

  it('computes budget variance as revenue minus budget', () => {
    const result = aggregate(document, 'full-year', 'all');
    expect(result.budget_variance).toBeCloseTo(result.revenue - result.budget, 2);
  });
});

describe('segmentSummaries', () => {
  it('returns all three segments whose revenue shares sum to 1', () => {
    const summaries = segmentSummaries(document, 'full-year');
    expect(summaries).toHaveLength(3);
    expect(summaries.map((item) => item.segment).sort()).toEqual([
      'enterprise',
      'mid-market',
      'smb',
    ]);

    const totalShare = summaries.reduce((sum, item) => sum + item.share, 0);
    expect(totalShare).toBeCloseTo(1, 6);
  });
});
