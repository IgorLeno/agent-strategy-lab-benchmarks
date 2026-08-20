import type { Board, Cell } from './types';

export type Rng = () => number;

function makeCell(): Cell {
  return { mine: false, adjacent: 0, state: 'covered' };
}

export function createBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => makeCell()));
}

function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => ({ ...cell })));
}

function neighborsOf(row: number, col: number, rows: number, cols: number): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const r = row + dr;
      const c = col + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) result.push([r, c]);
    }
  }
  return result;
}

/**
 * Places `mineCount` mines, guaranteeing the safe cell and its immediate
 * neighbours stay mine-free so the first click reliably opens a region
 * instead of a single lucky number.
 */
export function placeMines(
  board: Board,
  rows: number,
  cols: number,
  mineCount: number,
  safeRow: number,
  safeCol: number,
  rng: Rng = Math.random,
): Board {
  const next = cloneBoard(board);
  const excluded = new Set<string>([`${safeRow},${safeCol}`]);
  for (const [r, c] of neighborsOf(safeRow, safeCol, rows, cols)) excluded.add(`${r},${c}`);

  const candidates: Array<[number, number]> = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (!excluded.has(`${r},${c}`)) candidates.push([r, c]);
    }
  }

  const placeable = Math.min(mineCount, candidates.length);
  for (let i = candidates.length - 1; i > 0 && candidates.length - i <= placeable; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  for (let i = 0; i < placeable; i += 1) {
    const [r, c] = candidates[candidates.length - 1 - i];
    next[r][c].mine = true;
  }

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (next[r][c].mine) continue;
      let count = 0;
      for (const [nr, nc] of neighborsOf(r, c, rows, cols)) {
        if (next[nr][nc].mine) count += 1;
      }
      next[r][c].adjacent = count;
    }
  }

  return next;
}

/** Iterative flood reveal (explicit stack) so the largest board never overflows the call stack. */
export function revealCell(board: Board, rows: number, cols: number, row: number, col: number): Board {
  const next = cloneBoard(board);
  const start = next[row][col];
  if (start.state !== 'covered') return next;

  const stack: Array<[number, number]> = [[row, col]];
  while (stack.length > 0) {
    const [r, c] = stack.pop() as [number, number];
    const cell = next[r][c];
    if (cell.state !== 'covered') continue;
    cell.state = 'revealed';
    if (!cell.mine && cell.adjacent === 0) {
      for (const [nr, nc] of neighborsOf(r, c, rows, cols)) {
        if (next[nr][nc].state === 'covered') stack.push([nr, nc]);
      }
    }
  }
  return next;
}

export function revealMineAt(board: Board, row: number, col: number): Board {
  const next = cloneBoard(board);
  next[row][col].state = 'exploded';
  return next;
}

export function revealAllMines(board: Board): Board {
  const next = cloneBoard(board);
  for (const row of next) {
    for (const cell of row) {
      if (cell.mine && cell.state === 'covered') cell.state = 'revealed';
    }
  }
  return next;
}

export function flagRemainingMines(board: Board): Board {
  const next = cloneBoard(board);
  for (const row of next) {
    for (const cell of row) {
      if (cell.mine && cell.state !== 'exploded') cell.state = 'flagged';
    }
  }
  return next;
}

export function toggleFlag(board: Board, row: number, col: number): Board {
  const next = cloneBoard(board);
  const cell = next[row][col];
  if (cell.state === 'covered') cell.state = 'flagged';
  else if (cell.state === 'flagged') cell.state = 'covered';
  return next;
}

export function countFlags(board: Board): number {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.state === 'flagged') count += 1;
    }
  }
  return count;
}

export function isWin(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.mine && cell.state !== 'revealed') return false;
    }
  }
  return true;
}
