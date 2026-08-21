// Asserções compartilhadas entre os benchmarks. Ficam aqui para que a
// validação externa seja literalmente o mesmo código nos dois braços do A/B.
import { existsSync } from 'node:fs';
import path from 'node:path';

export function requireDist(root) {
  const dist = path.join(root, 'dist', 'index.html');
  if (!existsSync(dist)) {
    console.error(`dist/index.html ausente em ${dist}. Rode \`npm run build\` antes de \`npm run check\`.`);
    process.exit(1);
  }
  return path.join(root, 'dist');
}

export async function pageOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: Math.max(doc.scrollWidth, document.body.scrollWidth),
      clientWidth: doc.clientWidth,
    };
  });
}

export async function countTestId(page, testId) {
  return page.$$eval(`[data-testid="${testId}"]`, (nodes) => nodes.length);
}

export async function textOfTestId(page, testId) {
  return page.$eval(`[data-testid="${testId}"]`, (node) => node.textContent?.trim() ?? '').catch(() => null);
}

/** Landmarks e título únicos — o mínimo de acessibilidade cobrado no TASK. */
export async function accessibilityBasics(page) {
  return page.evaluate(() => {
    const controls = [...document.querySelectorAll('button, a[href], input, select, textarea')];
    const unnamed = controls.filter((node) => {
      const label = (
        node.getAttribute('aria-label') ??
        node.getAttribute('title') ??
        node.textContent ??
        ''
      ).trim();
      if (label.length > 0) return false;
      const labelledBy = node.getAttribute('aria-labelledby');
      if (labelledBy && document.getElementById(labelledBy)) return false;
      if (node.id && document.querySelector(`label[for="${CSS.escape(node.id)}"]`)) return false;
      return !node.closest('label');
    });
    return {
      h1Count: document.querySelectorAll('h1').length,
      hasMain: document.querySelectorAll('main').length > 0,
      hasNav: document.querySelectorAll('nav').length > 0,
      hasHeader: document.querySelectorAll('header').length > 0,
      hasFooter: document.querySelectorAll('footer').length > 0,
      controlCount: controls.length,
      unnamedControls: unnamed.slice(0, 5).map((node) => node.outerHTML.slice(0, 120)),
    };
  });
}

export async function visibleTextLength(page, selector) {
  return page
    .$eval(selector, (node) => (node.innerText ?? node.textContent ?? '').trim().length)
    .catch(() => 0);
}

export async function boundingHeight(page, selector) {
  return page.$eval(selector, (node) => node.getBoundingClientRect().height).catch(() => 0);
}
