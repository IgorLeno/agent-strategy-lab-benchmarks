import { describe, expect, it } from 'vitest';
import {
  countFlags,
  createBoard,
  flagRemainingMines,
  isWin,
  placeMines,
  revealAllMines,
  revealCell,
  revealMineAt,
  toggleFlag,
} from './board';

/** Deterministic RNG: always returns values from a fixed sequence, cycling. */
function seededRng(sequence: number[]): () => number {
  let i = 0;
  return () => {
    const value = sequence[i % sequence.length];
    i += 1;
    return value;
  };
}

describe('placeMines: first click is safe', () => {
  it('never places a mine on the clicked cell, across many seeds', () => {
    const rows = 9;
    const cols = 9;
    const mines = 10;
    for (let seed = 0; seed < 25; seed += 1) {
      const rng = seededRng([seed / 25, (seed * 7) % 1, 0.999, 0.001]);
      const board = createBoard(rows, cols);
      const placed = placeMines(board, rows, cols, mines, 4, 4, rng);
      expect(placed[4][4].mine).toBe(false);
    }
  });

  it('places exactly the requested number of mines', () => {
    const rows = 16;
    const cols = 16;
    const mines = 40;
    const board = createBoard(rows, cols);
    const placed = placeMines(board, rows, cols, mines, 0, 0, seededRng([0.1, 0.5, 0.9]));
    const mineCount = placed.flat().filter((cell) => cell.mine).length;
    expect(mineCount).toBe(mines);
  });

  it('keeps the safe cell neighbourhood mine-free', () => {
    const rows = 9;
    const cols = 9;
    const board = createBoard(rows, cols);
    const placed = placeMines(board, rows, cols, 10, 4, 4, seededRng([0.2, 0.4, 0.6, 0.8]));
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        expect(placed[4 + dr][4 + dc].mine).toBe(false);
      }
    }
  });
});

describe('revealCell: flood reveal', () => {
  it('expands an empty region and stops at numbered cells', () => {
    // 3x3 board, single mine in the corner (2,2). Clicking (0,0) should
    // flood-reveal the whole zero region and reveal, but not expand past,
    // the numbered cells bordering the mine.
    const rows = 3;
    const cols = 3;
    let board = createBoard(rows, cols);
    board[2][2].mine = true;
    board[1][2].adjacent = 1;
    board[2][1].adjacent = 1;
    board[1][1].adjacent = 1;

    const revealed = revealCell(board, rows, cols, 0, 0);

    expect(revealed[0][0].state).toBe('revealed');
    expect(revealed[0][1].state).toBe('revealed');
    expect(revealed[1][0].state).toBe('revealed');
    expect(revealed[1][1].state).toBe('revealed'); // numbered cell, revealed but not expanded from
    expect(revealed[1][2].state).toBe('revealed');
    expect(revealed[2][1].state).toBe('revealed');
    expect(revealed[2][2].state).toBe('covered'); // the mine itself must stay covered
  });

  it('does not overflow the call stack on the largest board', () => {
    const rows = 16;
    const cols = 30;
    const board = createBoard(rows, cols); // no mines: entire board is one empty region
    expect(() => revealCell(board, rows, cols, 0, 0)).not.toThrow();
    const revealed = revealCell(board, rows, cols, 0, 0);
    const revealedCount = revealed.flat().filter((cell) => cell.state === 'revealed').length;
    expect(revealedCount).toBe(rows * cols);
  });
});

describe('flags and mine counter', () => {
  it('toggling a flag is reflected by countFlags', () => {
    const board = createBoard(9, 9);
    expect(countFlags(board)).toBe(0);

    const flagged = toggleFlag(board, 0, 0);
    expect(flagged[0][0].state).toBe('flagged');
    expect(countFlags(flagged)).toBe(1);

    const unflagged = toggleFlag(flagged, 0, 0);
    expect(unflagged[0][0].state).toBe('covered');
    expect(countFlags(unflagged)).toBe(0);
  });

  it('a flagged cell is not revealed by revealCell', () => {
    const rows = 3;
    const cols = 3;
    const board = createBoard(rows, cols);
    const flagged = toggleFlag(board, 1, 1);
    expect(flagged[1][1].state).toBe('flagged');

    // revealCell only acts on covered cells, so a flagged cell must stay put.
    const afterAttempt = revealCell(flagged, rows, cols, 1, 1);
    expect(afterAttempt[1][1].state).toBe('flagged');
  });
});

describe('win detection', () => {
  it('is won once every non-mine cell is revealed', () => {
    const rows = 2;
    const cols = 2;
    let board = createBoard(rows, cols);
    board[0][0].mine = true;
    expect(isWin(board)).toBe(false);

    board = revealCell(board, rows, cols, 0, 1);
    board = revealCell(board, rows, cols, 1, 0);
    board = revealCell(board, rows, cols, 1, 1);
    expect(isWin(board)).toBe(true);
  });

  it('flagRemainingMines marks the untouched mines as flagged on a win', () => {
    const rows = 2;
    const cols = 2;
    let board = createBoard(rows, cols);
    board[0][0].mine = true;
    board = revealCell(board, rows, cols, 0, 1);
    board = revealCell(board, rows, cols, 1, 0);
    board = revealCell(board, rows, cols, 1, 1);
    const finalBoard = flagRemainingMines(board);
    expect(finalBoard[0][0].state).toBe('flagged');
  });
});

describe('loss detection', () => {
  it('revealing a mine exposes it as exploded and reveals the rest', () => {
    const rows = 3;
    const cols = 3;
    let board = createBoard(rows, cols);
    board[1][1].mine = true;
    board[2][2].mine = true;

    board = revealMineAt(board, 1, 1);
    board = revealAllMines(board);

    expect(board[1][1].state).toBe('exploded');
    expect(board[2][2].state).toBe('revealed');
    expect(board[2][2].mine).toBe(true);
  });

  it('the board stops accepting reveals once the game is over (enforced by caller state, not board)', () => {
    // The board module itself is a pure data structure; "locking" is a
    // status concern owned by the game hook. Here we only verify that an
    // already-revealed/exploded cell is a no-op for revealCell.
    const rows = 2;
    const cols = 2;
    let board = createBoard(rows, cols);
    board[0][0].mine = true;
    board = revealMineAt(board, 0, 0);
    const attempt = revealCell(board, rows, cols, 0, 0);
    expect(attempt[0][0].state).toBe('exploded');
  });
});
