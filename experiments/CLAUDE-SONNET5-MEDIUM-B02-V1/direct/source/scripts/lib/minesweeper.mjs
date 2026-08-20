// Primitivas de interação com o contrato de marcação do B2. Ficam separadas do
// check para que cada asserção leia como uma frase sobre o jogo, não sobre o
// DOM.
export const CELL = '[data-testid="cell"]';

export async function readBoard(page) {
  return page.$$eval(CELL, (nodes) =>
    nodes.map((node) => ({
      row: Number(node.getAttribute('data-row')),
      col: Number(node.getAttribute('data-col')),
      state: node.getAttribute('data-state'),
      adjacent: node.getAttribute('data-adjacent'),
    })),
  );
}

export async function readNumber(page, testId) {
  const text = await page
    .$eval(`[data-testid="${testId}"]`, (node) => node.textContent ?? '')
    .catch(() => null);
  if (text === null) return null;
  const match = text.match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

export async function readStatus(page) {
  const text = await page
    .$eval('[data-testid="status"]', (node) => node.textContent ?? '')
    .catch(() => null);
  return text === null ? null : text.trim().toLowerCase();
}

export function cellSelector(row, col) {
  return `${CELL}[data-row="${row}"][data-col="${col}"]`;
}

export async function clickCell(page, row, col, options = {}) {
  const handle = await page.$(cellSelector(row, col));
  if (!handle) return false;
  await handle.click(options);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));
  return true;
}

export async function cellState(page, row, col) {
  return page.$eval(cellSelector(row, col), (node) => node.getAttribute('data-state')).catch(() => null);
}

export async function cellAdjacent(page, row, col) {
  return page.$eval(cellSelector(row, col), (node) => node.getAttribute('data-adjacent')).catch(() => null);
}

/** Aceita as duas formas autorizadas pelo TASK: botões ou <select>. */
export async function selectDifficulty(page, key) {
  const asButton = await page.$(`[data-testid="difficulty"] [data-difficulty="${key}"]`);
  if (asButton) {
    await asButton.click();
  } else {
    const select = await page.$('select[data-testid="difficulty"], [data-testid="difficulty"] select');
    if (!select) return false;
    await select.select(key);
  }
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 60)));
  return true;
}

export async function restart(page) {
  const button = await page.$('[data-testid="restart"]');
  if (!button) return false;
  await button.click();
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 60)));
  return true;
}

export async function contextMenuPrevented(page, row, col) {
  return page.$eval(cellSelector(row, col), (node) => {
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    node.dispatchEvent(event);
    return event.defaultPrevented;
  }).catch(() => false);
}
