import { describe, expect, it } from 'vitest';
import { financial } from '../data';
import { aggregate, monthsForPeriod, segmentBreakdown, segmentsForKey } from './finance';
import type { SegmentName } from './finance';

const SEGMENTS: SegmentName[] = ['Enterprise', 'Mid-Market', 'SMB'];

function opexTotal(opex: { sales_marketing: number; research_development: number; general_admin: number }) {
  return opex.sales_marketing + opex.research_development + opex.general_admin;
}

describe('aggregate — full year, all segments', () => {
  it('matches a manual sum over every month and segment', () => {
    let revenue = 0;
    let cogs = 0;
    let opex = 0;
    for (const month of financial.months) {
      for (const name of SEGMENTS) {
        const entry = month.segments[name];
        revenue += entry.revenue;
        cogs += entry.cogs;
        opex += opexTotal(entry.opex);
      }
    }
    const result = aggregate(financial, 'full-year', 'all');
    expect(result.revenue).toBeCloseTo(revenue, 2);
    expect(result.cogs).toBeCloseTo(cogs, 2);
    expect(result.opex).toBeCloseTo(opex, 2);
    expect(result.ebitda).toBeCloseTo(revenue - cogs - opex, 2);
  });
});

describe('quarter filter', () => {
  it('selects exactly the three months of the given quarter', () => {
    const q2Months = monthsForPeriod(financial, 'q2');
    expect(q2Months.map((m) => m.month)).toEqual(['2025-04', '2025-05', '2025-06']);
    expect(q2Months).toHaveLength(3);
    for (const month of q2Months) {
      expect(month.quarter).toBe('Q2');
    }
  });
});

describe('segment filter', () => {
  it('excludes the other segments from every aggregate', () => {
    const enterpriseOnly = aggregate(financial, 'full-year', 'enterprise');

    let expectedRevenue = 0;
    let expectedCogs = 0;
    for (const month of financial.months) {
      expectedRevenue += month.segments.Enterprise.revenue;
      expectedCogs += month.segments.Enterprise.cogs;
    }
    expect(enterpriseOnly.revenue).toBeCloseTo(expectedRevenue, 2);
    expect(enterpriseOnly.cogs).toBeCloseTo(expectedCogs, 2);

    // Sanity: Enterprise-only revenue must be less than the all-segment total.
    const all = aggregate(financial, 'full-year', 'all');
    expect(enterpriseOnly.revenue).toBeLessThan(all.revenue);

    expect(segmentsForKey(financial, 'smb')).toEqual(['SMB']);
  });
});

describe('churn rate', () => {
  it('is total churned customers over total customers at period start', () => {
    let churned = 0;
    let customersStart = 0;
    for (const month of financial.months) {
      for (const name of SEGMENTS) {
        churned += month.segments[name].churned_customers;
        customersStart += month.segments[name].customers_start;
      }
    }
    const result = aggregate(financial, 'full-year', 'all');
    expect(result.churn_rate).toBeCloseTo(churned / customersStart, 6);
  });
});

describe('cash', () => {
  it('resolves to the closing balance of the last month of the period', () => {
    const fullYear = aggregate(financial, 'full-year', 'all');
    const lastMonth = financial.months[financial.months.length - 1];
    expect(fullYear.cash).toBeCloseTo(lastMonth.cash.closing_balance, 2);

    const q1 = aggregate(financial, 'q1', 'all');
    expect(q1.cash).toBeCloseTo(financial.months[2].cash.closing_balance, 2);
  });

  it('stays unchanged when the segment filter changes', () => {
    const all = aggregate(financial, 'full-year', 'all');
    const enterprise = aggregate(financial, 'full-year', 'enterprise');
    const smb = aggregate(financial, 'full-year', 'smb');
    expect(all.cash).toBe(enterprise.cash);
    expect(all.cash).toBe(smb.cash);
  });
});

describe('segmentBreakdown', () => {
  it('shares of total revenue sum to 1', () => {
    const rows = segmentBreakdown(financial, 'full-year');
    const totalShare = rows.reduce((sum, row) => sum + row.share, 0);
    expect(totalShare).toBeCloseTo(1, 6);
    expect(rows).toHaveLength(3);
  });
});
