#!/usr/bin/env node
// Validação externa DETERMINÍSTICA do B4. Recomputa cada KPI a partir de
// data/financial.json e compara com o DOM sob várias combinações de filtro.
// Não avalia estética.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveStatic } from './lib/serve.mjs';
import {
  VIEWPORT_DESKTOP,
  VIEWPORT_MOBILE,
  launchBrowser,
  openPage,
  sleep,
} from './lib/browser.mjs';
import { assertLocalOnly, createReport } from './lib/report.mjs';
import { accessibilityBasics, pageOverflow, requireDist } from './lib/dom.mjs';
import { aggregate, loadFinancial, toleranceFor } from './lib/finance.mjs';

const KPI_KEYS = [
  'revenue',
  'budget',
  'budget_variance',
  'cogs',
  'opex',
  'ebitda',
  'cash',
  'new_customers',
  'churn_rate',
];

const COMBINATIONS = [
  ['full-year', 'all'],
  ['q2', 'all'],
  ['q4', 'all'],
  ['full-year', 'enterprise'],
  ['q1', 'smb'],
  ['full-year', 'mid-market'],
];

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = requireDist(root);
const financial = await loadFinancial(root);
const report = createReport('B4 — ATLAS dashboard');

/** Aceita as duas formas autorizadas pelo TASK: botões ou <select>. */
async function applyFilter(page, kind, value) {
  const attribute = kind === 'period' ? 'data-period' : 'data-segment';
  const button = await page.$(`[data-testid="filter-${kind}"] [${attribute}="${value}"]`);
  if (button) {
    await button.click();
  } else {
    const select = await page.$(`select[data-testid="filter-${kind}"], [data-testid="filter-${kind}"] select`);
    if (!select) return false;
    await select.select(value);
  }
  await sleep(150);
  return true;
}

async function readKpis(page) {
  return page.$$eval('[data-testid="kpi"]', (nodes) =>
    Object.fromEntries(
      nodes.map((node) => [node.getAttribute('data-kpi'), node.getAttribute('data-value')]),
    ),
  );
}

const server = await serveStatic(dist);
const { browser, close } = await launchBrowser();

try {
  const desktop = await openPage(browser, server.origin, VIEWPORT_DESKTOP);
  const page = desktop.page;

  assertLocalOnly(report, 'desktop', desktop.requests, server.origin);
  report.check('desktop: sem erros de console', desktop.consoleErrors.length === 0, desktop.consoleErrors.slice(0, 3).join(' | '));
  report.check('desktop: sem exceções', desktop.pageErrors.length === 0, desktop.pageErrors.slice(0, 3).join(' | '));

  // ------------------------------------------------------------- contrato
  const initialKpis = await readKpis(page);
  const missingKpis = KPI_KEYS.filter((key) => initialKpis[key] === undefined);
  report.check('todos os 9 KPIs expostos no DOM', missingKpis.length === 0, `faltando: ${missingKpis.join(', ')}`);

  const charts = await page.$$eval('[data-testid="chart"]', (nodes) =>
    nodes.map((node) => ({
      name: node.getAttribute('data-chart'),
      graphics: node.querySelectorAll('svg, canvas').length,
      height: node.getBoundingClientRect().height,
    })),
  );
  report.check('ao menos 3 gráficos', charts.length >= 3, `${charts.length} gráficos`);
  report.check('todo gráfico tem data-chart', charts.every((chart) => chart.name), JSON.stringify(charts.map((chart) => chart.name)));
  report.check(
    'todo gráfico renderiza conteúdo gráfico',
    charts.every((chart) => chart.graphics > 0 && chart.height > 40),
    JSON.stringify(charts),
  );

  const segmentRows = await page.$$eval('[data-testid="segment-row"]', (nodes) =>
    nodes.map((node) => node.getAttribute('data-segment')).sort(),
  );
  report.check(
    'tabela de segmentos com as três linhas',
    JSON.stringify(segmentRows) === JSON.stringify(['enterprise', 'mid-market', 'smb']),
    JSON.stringify(segmentRows),
  );

  // -------------------------------------------- KPIs sob cada combinação
  for (const [period, segment] of COMBINATIONS) {
    const periodApplied = await applyFilter(page, 'period', period);
    const segmentApplied = await applyFilter(page, 'segment', segment);
    report.check(`filtro aplicável: ${period} / ${segment}`, periodApplied && segmentApplied);
    if (!periodApplied || !segmentApplied) continue;

    const expected = aggregate(financial, period, segment);
    const actual = await readKpis(page);

    for (const key of KPI_KEYS) {
      const raw = actual[key];
      const value = raw === undefined || raw === null ? Number.NaN : Number(raw);
      const tolerance = toleranceFor(key);
      const ok = Number.isFinite(value) && Math.abs(value - expected[key]) <= tolerance;
      report.check(
        `${period}/${segment} — ${key}`,
        ok,
        `esperado ${expected[key]}, DOM ${raw === undefined ? 'ausente' : raw}`,
      );
    }
  }

  // ------------------------------------- caixa não muda com o segmento
  await applyFilter(page, 'period', 'full-year');
  await applyFilter(page, 'segment', 'all');
  const cashAll = (await readKpis(page)).cash;
  await applyFilter(page, 'segment', 'enterprise');
  const cashEnterprise = (await readKpis(page)).cash;
  report.check(
    'caixa é grandeza da empresa: não muda com o filtro de segmento',
    cashAll !== undefined && cashAll === cashEnterprise,
    `all=${cashAll} enterprise=${cashEnterprise}`,
  );

  // --------------------------- os painéis recomputam juntos, sem stale
  const readTable = () =>
    page.$eval('[data-testid="segment-table"]', (node) => (node.innerText ?? '').trim()).catch(() => null);
  const readFirstChart = () =>
    page.$eval('[data-testid="chart"]', (node) => node.outerHTML).catch(() => null);

  await applyFilter(page, 'segment', 'all');
  await applyFilter(page, 'period', 'full-year');
  const tableAtFullYear = await readTable();
  const chartAtFullYear = await readFirstChart();
  await applyFilter(page, 'period', 'q1');
  const tableAtQ1 = await readTable();
  const chartAtQ1 = await readFirstChart();

  report.check(
    'a tabela de segmentos recomputa com o filtro de período',
    tableAtFullYear !== null && tableAtQ1 !== null && tableAtFullYear !== tableAtQ1,
    'conteúdo idêntico (ou ausente) entre Full Year e Q1',
  );
  report.check(
    'os gráficos recomputam com o filtro de período',
    chartAtFullYear !== null && chartAtQ1 !== null && chartAtFullYear !== chartAtQ1,
    'o primeiro gráfico não mudou (ou está ausente) entre Full Year e Q1',
  );

  // ------------------------------------------------------ acessibilidade
  const accessibility = await accessibilityBasics(page);
  report.check('acessibilidade: exatamente um <h1>', accessibility.h1Count === 1, `${accessibility.h1Count} encontrados`);
  report.check('acessibilidade: landmark <main>', accessibility.hasMain);
  report.check(
    'acessibilidade: todo controle tem nome acessível',
    accessibility.unnamedControls.length === 0,
    accessibility.unnamedControls.join(' | '),
  );

  const desktopOverflow = await pageOverflow(page);
  report.check(
    'desktop 1440x900: sem scroll horizontal da página',
    desktopOverflow.scrollWidth <= desktopOverflow.clientWidth + 1,
    `scrollWidth=${desktopOverflow.scrollWidth} clientWidth=${desktopOverflow.clientWidth}`,
  );

  await page.close();

  // ----------------------------------------------------------------- mobile
  const mobile = await openPage(browser, server.origin, VIEWPORT_MOBILE);
  const mobileOverflow = await pageOverflow(mobile.page);
  report.check(
    'mobile 390x844: sem scroll horizontal da página',
    mobileOverflow.scrollWidth <= mobileOverflow.clientWidth + 1,
    `scrollWidth=${mobileOverflow.scrollWidth} clientWidth=${mobileOverflow.clientWidth}`,
  );

  const mobileKpis = await readKpis(mobile.page);
  const missingOnMobile = KPI_KEYS.filter((key) => mobileKpis[key] === undefined);
  report.check('mobile: os 9 KPIs continuam presentes', missingOnMobile.length === 0, `faltando: ${missingOnMobile.join(', ')}`);

  report.check('mobile: sem erros de console', mobile.consoleErrors.length === 0, mobile.consoleErrors.slice(0, 3).join(' | '));
  await mobile.page.close();
} finally {
  await close();
  await server.close();
}

report.finish();
