import { DIFFICULTIES } from './types';
import type { CellData, Difficulty, GameState, RandomSource } from './types';

function emptyCell(): CellData {
  return { mine: false, state: 'covered', adjacent: 0 };
}

function makeCells(rows: number, cols: number): CellData[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, emptyCell));
}

function cloneCells(cells: CellData[][]): CellData[][] {
  return cells.map((row) => row.map((cell) => ({ ...cell })));
}

function neighborsOf(rows: number, cols: number, row: number, col: number): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) result.push([nr, nc]);
    }
  }
  return result;
}

function computeAdjacents(cells: CellData[][], rows: number, cols: number): void {
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (cells[r][c].mine) continue;
      let count = 0;
      for (const [nr, nc] of neighborsOf(rows, cols, r, c)) {
        if (cells[nr][nc].mine) count += 1;
      }
      cells[r][c].adjacent = count;
    }
  }
}

function shuffle<T>(items: T[], rng: RandomSource): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }
}

function allCellsExcept(rows: number, cols: number, safeRow: number, safeCol: number): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (r === safeRow && c === safeCol) continue;
      result.push([r, c]);
    }
  }
  return result;
}

/** Places mines avoiding the first-clicked cell (and, when the board is large
 * enough, its neighbours too) so the opening click always reveals an area. */
function placeMines(
  cells: CellData[][],
  rows: number,
  cols: number,
  mineCount: number,
  safeRow: number,
  safeCol: number,
  rng: RandomSource,
): void {
  const safeZone = new Set<string>([`${safeRow},${safeCol}`]);
  for (const [nr, nc] of neighborsOf(rows, cols, safeRow, safeCol)) safeZone.add(`${nr},${nc}`);

  const candidates: Array<[number, number]> = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (!safeZone.has(`${r},${c}`)) candidates.push([r, c]);
    }
  }

  const pool = candidates.length >= mineCount ? candidates : allCellsExcept(rows, cols, safeRow, safeCol);
  shuffle(pool, rng);
  for (let i = 0; i < mineCount; i += 1) {
    const [r, c] = pool[i];
    cells[r][c].mine = true;
  }
  computeAdjacents(cells, rows, cols);
}

function floodReveal(cells: CellData[][], rows: number, cols: number, startRow: number, startCol: number): void {
  const stack: Array<[number, number]> = [[startRow, startCol]];
  while (stack.length > 0) {
    const next = stack.pop();
    if (!next) break;
    const [r, c] = next;
    const cell = cells[r][c];
    if (cell.state === 'revealed' || cell.mine) continue;
    cell.state = 'revealed';
    if (cell.adjacent === 0) {
      for (const [nr, nc] of neighborsOf(rows, cols, r, c)) {
        if (cells[nr][nc].state === 'covered') stack.push([nr, nc]);
      }
    }
  }
}

function countFlags(cells: CellData[][]): number {
  let count = 0;
  for (const row of cells) for (const cell of row) if (cell.state === 'flagged') count += 1;
  return count;
}

function countRevealed(cells: CellData[][]): number {
  let count = 0;
  for (const row of cells) for (const cell of row) if (cell.state === 'revealed') count += 1;
  return count;
}

export function createCustomGame(rows: number, cols: number, mines: number, difficulty: Difficulty): GameState {
  return {
    difficulty,
    rows,
    cols,
    mines,
    cells: makeCells(rows, cols),
    status: 'playing',
    minesPlaced: false,
    flagCount: 0,
    revealedCount: 0,
    explodedCell: null,
  };
}

export function createGame(difficulty: Difficulty): GameState {
  const config = DIFFICULTIES[difficulty];
  return createCustomGame(config.rows, config.cols, config.mines, difficulty);
}

/** Test-only helper: builds a board with a fixed, known mine layout so flood
 * reveal / win / loss behaviour can be asserted without relying on the RNG. */
export function createGameFromLayout(rows: number, cols: number, minePositions: Array<[number, number]>): GameState {
  const cells = makeCells(rows, cols);
  for (const [r, c] of minePositions) cells[r][c].mine = true;
  computeAdjacents(cells, rows, cols);
  return {
    difficulty: 'beginner',
    rows,
    cols,
    mines: minePositions.length,
    cells,
    status: 'playing',
    minesPlaced: true,
    flagCount: 0,
    revealedCount: 0,
    explodedCell: null,
  };
}

export function revealCell(state: GameState, row: number, col: number, rng: RandomSource = Math.random): GameState {
  if (state.status !== 'playing') return state;
  const target = state.cells[row]?.[col];
  if (!target || target.state === 'flagged' || target.state === 'revealed') return state;

  const cells = cloneCells(state.cells);
  let minesPlaced = state.minesPlaced;

  if (!minesPlaced) {
    placeMines(cells, state.rows, state.cols, state.mines, row, col, rng);
    minesPlaced = true;
  }

  const cell = cells[row][col];

  if (cell.mine) {
    cell.state = 'exploded';
    for (const r of cells) {
      for (const c of r) {
        if (c.mine && c.state === 'covered') c.state = 'revealed';
      }
    }
    return {
      ...state,
      cells,
      minesPlaced,
      status: 'lost',
      explodedCell: { row, col },
      flagCount: countFlags(cells),
      revealedCount: countRevealed(cells),
    };
  }

  floodReveal(cells, state.rows, state.cols, row, col);
  const revealedCount = countRevealed(cells);
  const totalSafeCells = state.rows * state.cols - state.mines;
  const won = revealedCount === totalSafeCells;

  if (won) {
    for (const r of cells) {
      for (const c of r) {
        if (c.mine) c.state = 'flagged';
      }
    }
  }

  return {
    ...state,
    cells,
    minesPlaced,
    status: won ? 'won' : 'playing',
    revealedCount,
    flagCount: countFlags(cells),
  };
}

export function toggleFlag(state: GameState, row: number, col: number): GameState {
  if (state.status !== 'playing') return state;
  const target = state.cells[row]?.[col];
  if (!target || (target.state !== 'covered' && target.state !== 'flagged')) return state;

  const cells = cloneCells(state.cells);
  cells[row][col].state = cells[row][col].state === 'flagged' ? 'covered' : 'flagged';
  return { ...state, cells, flagCount: countFlags(cells) };
}
