import { describe, expect, it } from 'vitest';
import { createCustomGame, createGameFromLayout, revealCell, toggleFlag } from './logic';
import { mulberry32 } from './rng';

describe('first click safety', () => {
  it('never places a mine on the first revealed cell, even when the layout is forced', () => {
    // 3x3 board with 8 mines: every cell except the one revealed must become
    // a mine, which forces the placement algorithm to react to the click.
    const game = createCustomGame(3, 3, 8, 'beginner');
    const rng = mulberry32(42);
    const next = revealCell(game, 1, 1, rng);

    expect(next.cells[1][1].mine).toBe(false);
    expect(next.cells[1][1].state).toBe('revealed');
    expect(next.status).not.toBe('lost');

    const mineCount = next.cells.flat().filter((cell) => cell.mine).length;
    expect(mineCount).toBe(8);
  });
});

describe('flood reveal', () => {
  it('expands the empty region and stops at numbered cells without crossing a mine wall', () => {
    // 5x5 board with a full mine column at col=2, splitting the board in two.
    const mines: Array<[number, number]> = [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
    ];
    const game = createGameFromLayout(5, 5, mines);
    const next = revealCell(game, 0, 0);

    expect(next.status).toBe('playing');
    // left region (cols 0-1) fully revealed, including the numbered boundary
    expect(next.cells[0][0].state).toBe('revealed');
    expect(next.cells[0][0].adjacent).toBe(0);
    expect(next.cells[2][1].state).toBe('revealed');
    expect(next.cells[2][1].adjacent).toBeGreaterThan(0);

    // right region (cols 3-4) is unreachable and must stay untouched
    expect(next.cells[0][3].state).toBe('covered');
    expect(next.cells[4][4].state).toBe('covered');

    // mines themselves are never auto-revealed by the flood
    expect(next.cells[2][2].state).toBe('covered');

    const revealedCount = next.cells.flat().filter((cell) => cell.state === 'revealed').length;
    expect(revealedCount).toBe(10);
  });
});

describe('mine counter', () => {
  it('decrements when a flag is placed and restores when it is removed', () => {
    const game = createGameFromLayout(3, 3, [[2, 2]]);
    expect(game.mines - game.flagCount).toBe(1);

    const flagged = toggleFlag(game, 0, 0);
    expect(flagged.flagCount).toBe(1);
    expect(flagged.mines - flagged.flagCount).toBe(0);

    const unflagged = toggleFlag(flagged, 0, 0);
    expect(unflagged.flagCount).toBe(0);
    expect(unflagged.mines - unflagged.flagCount).toBe(1);
  });
});

describe('flag protection', () => {
  it('prevents a flagged cell from being revealed', () => {
    const game = createGameFromLayout(3, 3, [[2, 2]]);
    const flagged = toggleFlag(game, 0, 0);
    const attempted = revealCell(flagged, 0, 0);

    expect(attempted.cells[0][0].state).toBe('flagged');
    expect(attempted.status).toBe('playing');
  });
});

describe('win detection', () => {
  it('marks the game as won once every non-mine cell is revealed', () => {
    const game = createGameFromLayout(2, 2, [[1, 1]]);
    let state = revealCell(game, 0, 0);
    expect(state.status).toBe('playing');
    state = revealCell(state, 0, 1);
    expect(state.status).toBe('playing');
    state = revealCell(state, 1, 0);

    expect(state.status).toBe('won');
    // remaining mines are shown as flagged on a win
    expect(state.cells[1][1].state).toBe('flagged');
  });
});

describe('loss detection', () => {
  it('ends the game and locks the board when a mine is revealed', () => {
    const game = createGameFromLayout(3, 3, [[1, 1]]);
    const afterHit = revealCell(game, 1, 1);

    expect(afterHit.status).toBe('lost');
    expect(afterHit.cells[1][1].state).toBe('exploded');
    expect(afterHit.explodedCell).toEqual({ row: 1, col: 1 });

    const attemptAfterLoss = revealCell(afterHit, 0, 0);
    expect(attemptAfterLoss).toBe(afterHit);
    expect(attemptAfterLoss.cells[0][0].state).toBe('covered');
  });
});
