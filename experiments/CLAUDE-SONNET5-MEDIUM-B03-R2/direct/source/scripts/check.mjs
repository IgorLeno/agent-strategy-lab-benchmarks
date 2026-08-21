#!/usr/bin/env node
// Validação externa DETERMINÍSTICA do B3. Verifica presença e substância das
// oito seções obrigatórias, as interações exigidas, acessibilidade básica,
// ausência de rede e o comportamento nos dois viewports. Não avalia estética.
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

const SECTIONS = [
  'hero',
  'day-cycle',
  'features',
  'specs',
  'social-proof',
  'pricing',
  'faq',
  'footer',
];

const PLACEHOLDER_PATTERNS = [/lorem ipsum/i, /coming soon/i, /todo:/i, /placeholder/i];

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = requireDist(root);
const report = createReport('B3 — LUMA landing page');

const server = await serveStatic(dist);
const { browser, close } = await launchBrowser();

try {
  const desktop = await openPage(browser, server.origin, VIEWPORT_DESKTOP);
  const page = desktop.page;

  assertLocalOnly(report, 'desktop', desktop.requests, server.origin);
  report.check('desktop: sem erros de console', desktop.consoleErrors.length === 0, desktop.consoleErrors.slice(0, 3).join(' | '));
  report.check('desktop: sem exceções', desktop.pageErrors.length === 0, desktop.pageErrors.slice(0, 3).join(' | '));

  // ------------------------------------------------------- seções exigidas
  for (const section of SECTIONS) {
    const found = await page.evaluate((id) => {
      const byId = document.getElementById(id);
      const byTestId = document.querySelector(`[data-testid="${id}"]`);
      if (!byId || !byTestId) return null;
      const sameElement = byId === byTestId;
      const box = byId.getBoundingClientRect();
      const text = (byId.innerText ?? byId.textContent ?? '').trim();
      return { sameElement, height: box.height, textLength: text.length };
    }, section);

    report.check(`seção "${section}": id + data-testid no mesmo elemento`, found?.sameElement === true, found ? '' : 'não encontrada');
    if (found) {
      report.check(`seção "${section}": tem altura renderizada`, found.height >= 120, `${Math.round(found.height)}px`);
      report.check(`seção "${section}": tem conteúdo real`, found.textLength >= 80, `${found.textLength} caracteres`);
    }
  }

  const pageText = await page.evaluate(() => document.body.innerText ?? '');
  const placeholders = PLACEHOLDER_PATTERNS.filter((pattern) => pattern.test(pageText)).map(String);
  report.check('sem texto de placeholder', placeholders.length === 0, placeholders.join(', '));
  report.check('a página tem copy substancial', pageText.length >= 2_500, `${pageText.length} caracteres`);

  // ---------------------------------------------------------- day cycle
  const dayCycleOptions = await page.$$('[data-testid="day-cycle-option"]');
  report.check('day-cycle: ao menos 3 opções', dayCycleOptions.length >= 3, `${dayCycleOptions.length} opções`);

  const stageBefore = await page
    .$eval('[data-testid="day-cycle-stage"]', (node) => node.outerHTML)
    .catch(() => null);
  report.check('day-cycle: stage presente', stageBefore !== null);

  if (dayCycleOptions.length >= 2 && stageBefore !== null) {
    const dayCycleTextBefore = await page.$eval('[data-testid="day-cycle"]', (node) => (node.innerText ?? '').trim());
    await dayCycleOptions[dayCycleOptions.length - 1].click();
    await sleep(400);
    const stageAfter = await page.$eval('[data-testid="day-cycle-stage"]', (node) => node.outerHTML);
    const dayCycleTextAfter = await page.$eval('[data-testid="day-cycle"]', (node) => (node.innerText ?? '').trim());
    report.check(
      'day-cycle: selecionar outro momento muda o stage',
      stageAfter !== stageBefore,
      'o elemento data-testid="day-cycle-stage" não mudou',
    );
    report.check(
      'day-cycle: selecionar outro momento muda a copy',
      dayCycleTextAfter !== dayCycleTextBefore,
      'o texto da seção não mudou',
    );
  }

  // ---------------------------------------------------------------- FAQ
  const faqItems = await page.$$('[data-testid="faq-item"]');
  report.check('faq: ao menos 6 perguntas', faqItems.length >= 6, `${faqItems.length} itens`);

  const faqQuestions = await page.$$('[data-testid="faq-question"]');
  report.check('faq: perguntas são botões com data-testid', faqQuestions.length >= 6, `${faqQuestions.length} botões`);

  if (faqQuestions.length > 0) {
    const tag = await faqQuestions[0].evaluate((node) => node.tagName.toLowerCase());
    report.check('faq: a pergunta é um <button>', tag === 'button', `tag: ${tag}`);

    const expandedBefore = await faqQuestions[0].evaluate((node) => node.getAttribute('aria-expanded'));
    const answerHeightBefore = await faqItems[0].evaluate((node) => node.getBoundingClientRect().height);
    await faqQuestions[0].click();
    await sleep(450);
    const expandedAfter = await faqQuestions[0].evaluate((node) => node.getAttribute('aria-expanded'));
    const answerHeightAfter = await faqItems[0].evaluate((node) => node.getBoundingClientRect().height);

    report.check(
      'faq: aria-expanded alterna ao abrir',
      expandedBefore !== null && expandedAfter !== null && expandedBefore !== expandedAfter,
      `antes=${expandedBefore} depois=${expandedAfter}`,
    );
    report.check(
      'faq: abrir revela a resposta',
      answerHeightAfter > answerHeightBefore + 4,
      `altura ${Math.round(answerHeightBefore)}px -> ${Math.round(answerHeightAfter)}px`,
    );
  }

  // ------------------------------------------------------------- pricing
  const plans = await page.$$('[data-testid="pricing-plan"]');
  report.check('pricing: ao menos 2 opções', plans.length >= 2, `${plans.length} planos`);

  // ------------------------------------------------------ acessibilidade
  const accessibility = await accessibilityBasics(page);
  report.check('acessibilidade: exatamente um <h1>', accessibility.h1Count === 1, `${accessibility.h1Count} encontrados`);
  report.check('acessibilidade: landmark <main>', accessibility.hasMain);
  report.check('acessibilidade: landmark <footer>', accessibility.hasFooter);
  report.check('acessibilidade: landmark <nav>', accessibility.hasNav);
  report.check(
    'acessibilidade: todo controle tem nome acessível',
    accessibility.unnamedControls.length === 0,
    accessibility.unnamedControls.join(' | '),
  );

  const headingOrder = await page.evaluate(() =>
    [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((node) => Number(node.tagName.slice(1))),
  );
  const skips = headingOrder.filter((level, index) => index > 0 && level - headingOrder[index - 1] > 1);
  report.check('acessibilidade: hierarquia de headings sem saltos', skips.length === 0, `${skips.length} saltos`);

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

  const missingOnMobile = [];
  for (const section of SECTIONS) {
    const height = await mobile.page
      .$eval(`[data-testid="${section}"]`, (node) => node.getBoundingClientRect().height)
      .catch(() => 0);
    if (height < 60) missingOnMobile.push(section);
  }
  report.check('mobile: as oito seções continuam renderizadas', missingOnMobile.length === 0, missingOnMobile.join(', '));

  report.check('mobile: sem erros de console', mobile.consoleErrors.length === 0, mobile.consoleErrors.slice(0, 3).join(' | '));
  await mobile.page.close();
} finally {
  await close();
  await server.close();
}

report.finish();
