// Recomputação INDEPENDENTE das grandezas do B4 a partir de data/financial.json.
// É deliberadamente uma segunda implementação: se o candidato e este arquivo
// concordarem, o número foi derivado do dado, não inventado.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const SEGMENT_KEYS = {
  enterprise: 'Enterprise',
  'mid-market': 'Mid-Market',
  smb: 'SMB',
};

export const PERIODS = ['full-year', 'q1', 'q2', 'q3', 'q4'];

export async function loadFinancial(root) {
  return JSON.parse(await readFile(path.join(root, 'data', 'financial.json'), 'utf8'));
}

function monthsFor(document, period) {
  if (period === 'full-year') return document.months;
  const quarter = period.toUpperCase();
  return document.months.filter((month) => month.quarter === quarter);
}

function segmentsFor(document, segment) {
  if (segment === 'all') return document.meta.segments;
  const name = SEGMENT_KEYS[segment];
  if (!name) throw new Error(`segmento desconhecido: ${segment}`);
  return [name];
}

/** Todas as grandezas exigidas pelo TASK, para um par (período, segmento). */
export function aggregate(document, period, segment) {
  const months = monthsFor(document, period);
  const segments = segmentsFor(document, segment);

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
      opex += entry.opex.sales_marketing + entry.opex.research_development + entry.opex.general_admin;
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

export const MONEY_KEYS = ['revenue', 'budget', 'budget_variance', 'cogs', 'opex', 'ebitda', 'cash'];
export const COUNT_KEYS = ['new_customers'];
export const RATE_KEYS = ['churn_rate'];

export function toleranceFor(key) {
  if (RATE_KEYS.includes(key)) return 1e-6;
  if (COUNT_KEYS.includes(key)) return 0;
  return 0.01;
}
