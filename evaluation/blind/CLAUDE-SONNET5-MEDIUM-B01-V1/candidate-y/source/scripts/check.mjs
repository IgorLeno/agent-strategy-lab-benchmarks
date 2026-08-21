#!/usr/bin/env node
// Validação externa DETERMINÍSTICA do B1. Serve `dist/` num origin http real e
// dirige o Chrome do sistema. Não avalia estética: verifica o contrato de
// marcação, os dois viewports, acessibilidade básica e ausência de rede.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveStatic } from './lib/serve.mjs';
import {
  VIEWPORT_DESKTOP,
  VIEWPORT_MOBILE,
  launchBrowser,
  openPage,
} from './lib/browser.mjs';
import { assertLocalOnly, createReport } from './lib/report.mjs';
import {
  accessibilityBasics,
  countTestId,
  pageOverflow,
  requireDist,
  visibleTextLength,
} from './lib/dom.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = requireDist(root);
const report = createReport('B1 — screenshot-to-interface');

const server = await serveStatic(dist);
const { browser, close } = await launchBrowser();

try {
  // ---------------------------------------------------------------- desktop
  const desktop = await openPage(browser, server.origin, VIEWPORT_DESKTOP);
  const page = desktop.page;

  report.check('desktop: sem erros de console', desktop.consoleErrors.length === 0, desktop.consoleErrors.slice(0, 3).join(' | '));
  report.check('desktop: sem exceções', desktop.pageErrors.length === 0, desktop.pageErrors.slice(0, 3).join(' | '));
  assertLocalOnly(report, 'desktop', desktop.requests, server.origin);

  const referenceRequests = desktop.requests.filter((url) => /reference/i.test(url));
  report.check('a referência não é servida como asset', referenceRequests.length === 0, referenceRequests.join(', '));

  const rootTextLength = await visibleTextLength(page, '#root');
  report.check('#root renderiza conteúdo', rootTextLength > 200, `${rootTextLength} caracteres visíveis`);

  for (const [testId, expected] of [
    ['app-shell', 1],
    ['sidebar', 1],
    ['chart', 1],
    ['projects-table', 1],
    ['activity', 1],
    ['quota', 1],
  ]) {
    const found = await countTestId(page, testId);
    report.check(`marcação: data-testid="${testId}" (${expected})`, found === expected, `encontrados ${found}`);
  }

  const statCards = await countTestId(page, 'stat-card');
  report.check('marcação: 4 data-testid="stat-card"', statCards === 4, `encontrados ${statCards}`);

  const tableRows = await page
    .$eval('[data-testid="projects-table"]', (node) => node.querySelectorAll('tbody tr').length)
    .catch(() => 0);
  report.check('tabela de projetos com 5 linhas', tableRows === 5, `encontradas ${tableRows}`);

  const accessibility = await accessibilityBasics(page);
  report.check('acessibilidade: exatamente um <h1>', accessibility.h1Count === 1, `${accessibility.h1Count} encontrados`);
  report.check('acessibilidade: landmark <main>', accessibility.hasMain);
  report.check('acessibilidade: landmark <nav>', accessibility.hasNav);
  report.check('acessibilidade: controles reais presentes', accessibility.controlCount >= 5, `${accessibility.controlCount} controles`);
  report.check(
    'acessibilidade: todo controle tem nome acessível',
    accessibility.unnamedControls.length === 0,
    accessibility.unnamedControls.join(' | '),
  );

  const clickableDivs = await page.$$eval('div[onclick], div[role="button"]', (nodes) => nodes.length);
  report.check('acessibilidade: sem <div> clicável', clickableDivs === 0, `${clickableDivs} encontrados`);

  const desktopOverflow = await pageOverflow(page);
  report.check(
    'desktop 1440x900: sem scroll horizontal da página',
    desktopOverflow.scrollWidth <= desktopOverflow.clientWidth + 1,
    `scrollWidth=${desktopOverflow.scrollWidth} clientWidth=${desktopOverflow.clientWidth}`,
  );

  await page.close();

  // ----------------------------------------------------------------- mobile
  const mobile = await openPage(browser, server.origin, VIEWPORT_MOBILE);

  report.check('mobile: sem erros de console', mobile.consoleErrors.length === 0, mobile.consoleErrors.slice(0, 3).join(' | '));
  report.check('mobile: sem exceções', mobile.pageErrors.length === 0, mobile.pageErrors.slice(0, 3).join(' | '));

  const mobileOverflow = await pageOverflow(mobile.page);
  report.check(
    'mobile 390x844: sem scroll horizontal da página',
    mobileOverflow.scrollWidth <= mobileOverflow.clientWidth + 1,
    `scrollWidth=${mobileOverflow.scrollWidth} clientWidth=${mobileOverflow.clientWidth}`,
  );

  const overflowingNodes = await mobile.page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    return [...document.querySelectorAll('body *')]
      .filter((node) => {
        const box = node.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return false;
        if (box.right <= viewportWidth + 1) return false;
        // Overflow contido no próprio container é permitido pelo TASK.
        let ancestor = node.parentElement;
        while (ancestor) {
          const style = getComputedStyle(ancestor);
          if (/(auto|scroll)/.test(`${style.overflowX}${style.overflow}`)) return false;
          ancestor = ancestor.parentElement;
        }
        return true;
      })
      .slice(0, 5)
      .map((node) => `${node.tagName.toLowerCase()}${node.className ? `.${String(node.className).split(' ')[0]}` : ''}`);
  });
  report.check(
    'mobile 390x844: nenhum elemento vaza do viewport',
    overflowingNodes.length === 0,
    overflowingNodes.join(', '),
  );

  const mobileShell = await countTestId(mobile.page, 'app-shell');
  report.check('mobile: a mesma tela é renderizada', mobileShell === 1, `app-shell=${mobileShell}`);

  await mobile.page.close();
} finally {
  await close();
  await server.close();
}

report.finish();
