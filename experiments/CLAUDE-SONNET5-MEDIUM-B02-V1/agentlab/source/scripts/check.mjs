#!/usr/bin/env node
// Validação externa DETERMINÍSTICA do B2. Joga o Minesweeper construído em
// `dist/` num Chrome headless e verifica as regras obrigatórias do TASK.
// Não avalia estética.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveStatic } from './lib/serve.mjs';
import {
  VIEWPORT_DESKTOP,
  VIEWPORT_MOBILE_TOUCH,
  launchBrowser,
  openPage,
  sleep,
} from './lib/browser.mjs';
import { assertLocalOnly, createReport } from './lib/report.mjs';
import { accessibilityBasics, pageOverflow, requireDist } from './lib/dom.mjs';
import {
  CELL,
  cellAdjacent,
  cellState,
  clickCell,
  contextMenuPrevented,
  readBoard,
  readNumber,
  readStatus,
  restart,
  selectDifficulty,
} from './lib/minesweeper.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = requireDist(root);
const report = createReport('B2 — minesweeper');

const server = await serveStatic(dist);
const { browser, close } = await launchBrowser();

try {
  const desktop = await openPage(browser, server.origin, VIEWPORT_DESKTOP);
  const page = desktop.page;

  assertLocalOnly(report, 'desktop', desktop.requests, server.origin);

  // ------------------------------------------------------------- contrato
  const cells = await page.$$eval(CELL, (nodes) => nodes.length).catch(() => 0);
  report.check('board padrão 16x16 (256 células)', cells === 256, `${cells} células`);

  const counter = await readNumber(page, 'mine-counter');
  report.check('contador de minas inicial = 40', counter === 40, `valor lido: ${counter}`);

  const timer = await readNumber(page, 'timer');
  report.check('timer presente e zerado', timer === 0, `valor lido: ${timer}`);

  const hasRestart = (await page.$('[data-testid="restart"]')) !== null;
  report.check('controle de restart presente', hasRestart);
  const hasStatus = (await readStatus(page)) !== null;
  report.check('indicador de status presente', hasStatus);

  const coveredAtStart = (await readBoard(page)).filter((cell) => cell.state === 'covered').length;
  report.check('todas as células começam cobertas', coveredAtStart === cells && cells > 0, `${coveredAtStart}/${cells}`);

  // ------------------------------------------------------- mouse e flags
  await clickCell(page, 0, 0, { button: 'right' });
  const flaggedState = await cellState(page, 0, 0);
  const counterAfterFlag = await readNumber(page, 'mine-counter');
  report.check('botão direito coloca bandeira', flaggedState === 'flagged', `estado: ${flaggedState}`);
  report.check('contador decrementa com a bandeira', counterAfterFlag === 39, `valor lido: ${counterAfterFlag}`);

  await clickCell(page, 0, 0);
  const flaggedAfterLeftClick = await cellState(page, 0, 0);
  report.check('célula com bandeira não é revelada', flaggedAfterLeftClick === 'flagged', `estado: ${flaggedAfterLeftClick}`);

  await clickCell(page, 0, 0, { button: 'right' });
  const unflagged = await cellState(page, 0, 0);
  const counterAfterUnflag = await readNumber(page, 'mine-counter');
  report.check('bandeira é removida', unflagged === 'covered', `estado: ${unflagged}`);
  report.check('contador restaura ao remover a bandeira', counterAfterUnflag === 40, `valor lido: ${counterAfterUnflag}`);

  // A sonda dispara um `contextmenu` sintético e, num candidato correto,
  // também alterna a bandeira — por isso vem depois das asserções acima e é
  // seguida de restart.
  report.check('menu de contexto suprimido sobre o board', await contextMenuPrevented(page, 0, 0));
  await restart(page);

  // ------------------------------------------- primeiro clique e flood
  const ROUNDS = 10;
  let unsafeFirstClicks = 0;
  let floodObserved = false;
  let zeroCellSeen = false;

  for (let round = 0; round < ROUNDS; round += 1) {
    await restart(page);
    await clickCell(page, 8, 8);
    const state = await cellState(page, 8, 8);
    const status = (await readStatus(page)) ?? '';
    if (state === 'exploded' || status.includes('lost')) unsafeFirstClicks += 1;
    if ((await cellAdjacent(page, 8, 8)) === '0') {
      zeroCellSeen = true;
      const revealed = (await readBoard(page)).filter((cell) => cell.state === 'revealed').length;
      if (revealed >= 3) floodObserved = true;
    }
  }

  report.check(
    `primeiro clique seguro em ${ROUNDS} partidas`,
    unsafeFirstClicks === 0,
    `${unsafeFirstClicks} partidas terminaram no primeiro clique`,
  );
  report.check('região vazia aberta pelo primeiro clique', zeroCellSeen, 'nenhuma célula com data-adjacent="0" em 10 partidas');
  report.check('flood reveal expande a região vazia', floodObserved, 'célula vazia revelada sem revelar vizinhos');

  // ------------------------------------------------------------- timer
  await restart(page);
  await clickCell(page, 8, 8);
  await sleep(1_700);
  const runningTimer = await readNumber(page, 'timer');
  report.check('timer avança depois do primeiro reveal', (runningTimer ?? 0) >= 1, `valor lido: ${runningTimer}`);

  await restart(page);
  const timerAfterRestart = await readNumber(page, 'timer');
  const counterAfterRestart = await readNumber(page, 'mine-counter');
  const coveredAfterRestart = (await readBoard(page)).filter((cell) => cell.state === 'covered').length;
  report.check('restart zera o timer', timerAfterRestart === 0, `valor lido: ${timerAfterRestart}`);
  report.check('restart restaura o contador', counterAfterRestart === 40, `valor lido: ${counterAfterRestart}`);
  report.check('restart recobre o board', coveredAfterRestart === 256, `${coveredAfterRestart}/256`);

  // -------------------------------------------------------- dificuldades
  const difficulties = [
    ['beginner', 81, 10],
    ['expert', 480, 99],
    ['intermediate', 256, 40],
  ];
  for (const [key, expectedCells, expectedMines] of difficulties) {
    const switched = await selectDifficulty(page, key);
    const actualCells = await page.$$eval(CELL, (nodes) => nodes.length).catch(() => 0);
    const actualMines = await readNumber(page, 'mine-counter');
    report.check(`dificuldade ${key} selecionável`, switched);
    report.check(`dificuldade ${key}: ${expectedCells} células`, actualCells === expectedCells, `${actualCells} células`);
    report.check(`dificuldade ${key}: ${expectedMines} minas`, actualMines === expectedMines, `valor lido: ${actualMines}`);
  }

  // ------------------------------------- estado terminal e board travado
  await selectDifficulty(page, 'beginner');
  await restart(page);
  let terminal = null;
  for (let row = 0; row < 9 && terminal === null; row += 1) {
    for (let col = 0; col < 9 && terminal === null; col += 1) {
      if ((await cellState(page, row, col)) !== 'covered') continue;
      await clickCell(page, row, col);
      const status = (await readStatus(page)) ?? '';
      if (status.includes('lost')) terminal = 'lost';
      else if (status.includes('won')) terminal = 'won';
    }
  }
  report.check('o jogo chega a um estado terminal', terminal !== null, `status final: ${terminal}`);

  if (terminal === 'lost') {
    const exploded = (await readBoard(page)).filter((cell) => cell.state === 'exploded').length;
    report.check('a mina acionada é marcada como exploded', exploded >= 1, `${exploded} células exploded`);
  }

  const beforeLock = await readBoard(page);
  const stillCovered = beforeLock.find((cell) => cell.state === 'covered');
  if (stillCovered) {
    await clickCell(page, stillCovered.row, stillCovered.col);
    const after = await cellState(page, stillCovered.row, stillCovered.col);
    report.check('board travado depois do fim de jogo', after === 'covered' || after === 'flagged', `estado: ${after}`);
  } else {
    report.check('board travado depois do fim de jogo', true, 'nenhuma célula coberta restante');
  }

  const accessibility = await accessibilityBasics(page);
  report.check('acessibilidade: exatamente um <h1>', accessibility.h1Count === 1, `${accessibility.h1Count} encontrados`);
  report.check(
    'acessibilidade: todo controle tem nome acessível',
    accessibility.unnamedControls.length === 0,
    accessibility.unnamedControls.join(' | '),
  );

  report.check('desktop: sem erros de console', desktop.consoleErrors.length === 0, desktop.consoleErrors.slice(0, 3).join(' | '));
  report.check('desktop: sem exceções', desktop.pageErrors.length === 0, desktop.pageErrors.slice(0, 3).join(' | '));
  await page.close();

  // ------------------------------------------------------ mobile e touch
  const mobile = await openPage(browser, server.origin, VIEWPORT_MOBILE_TOUCH);
  await selectDifficulty(mobile.page, 'expert');

  const overflow = await pageOverflow(mobile.page);
  report.check(
    'mobile 390x844 (expert): sem scroll horizontal da página',
    overflow.scrollWidth <= overflow.clientWidth + 1,
    `scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`,
  );

  await selectDifficulty(mobile.page, 'intermediate');
  const target = await mobile.page.$('[data-testid="cell"][data-row="0"][data-col="0"]');
  const box = target ? await target.boundingBox() : null;
  if (box) {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const handle = await mobile.page.touchscreen.touchStart(x, y);
    await sleep(800);
    if (handle && typeof handle.end === 'function') await handle.end();
    else await mobile.page.touchscreen.touchEnd();
    await sleep(120);
    const state = await cellState(mobile.page, 0, 0);
    report.check('touch: long press coloca bandeira', state === 'flagged', `estado: ${state}`);
  } else {
    report.check('touch: long press coloca bandeira', false, 'célula (0,0) não encontrada no viewport mobile');
  }

  const tapTarget = await mobile.page.$('[data-testid="cell"][data-row="4"][data-col="4"]');
  const tapBox = tapTarget ? await tapTarget.boundingBox() : null;
  if (tapBox) {
    await mobile.page.touchscreen.tap(tapBox.x + tapBox.width / 2, tapBox.y + tapBox.height / 2);
    await sleep(150);
    const state = await cellState(mobile.page, 4, 4);
    report.check('touch: tap revela a célula', state === 'revealed' || state === 'exploded', `estado: ${state}`);
  } else {
    report.check('touch: tap revela a célula', false, 'célula (4,4) não encontrada no viewport mobile');
  }

  report.check('mobile: sem erros de console', mobile.consoleErrors.length === 0, mobile.consoleErrors.slice(0, 3).join(' | '));
  await mobile.page.close();
} finally {
  await close();
  await server.close();
}

report.finish();
