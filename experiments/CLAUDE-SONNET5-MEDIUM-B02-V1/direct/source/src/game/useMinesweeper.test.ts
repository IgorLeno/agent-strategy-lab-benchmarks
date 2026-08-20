import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMinesweeper } from './useMinesweeper';

/** A rng that always sorts candidates in the same, predictable order. */
function fixedRng(): () => number {
  let i = 0;
  return () => {
    const value = (i * 0.37) % 1;
    i += 1;
    return value;
  };
}

describe('useMinesweeper', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts on beginner with a fully covered board and full mine count', () => {
    const { result } = renderHook(() => useMinesweeper('beginner', fixedRng()));
    expect(result.current.status).toBe('playing');
    expect(result.current.minesRemaining).toBe(10);
    expect(result.current.elapsed).toBe(0);
    expect(result.current.board).toHaveLength(9);
    expect(result.current.board[0]).toHaveLength(9);
    expect(result.current.board.flat().every((cell) => cell.state === 'covered')).toBe(true);
  });

  it('decrements the mine counter on flag, restores it on unflag', () => {
    const { result } = renderHook(() => useMinesweeper('beginner', fixedRng()));

    act(() => result.current.toggleFlag(0, 0));
    expect(result.current.minesRemaining).toBe(9);

    act(() => result.current.toggleFlag(0, 0));
    expect(result.current.minesRemaining).toBe(10);
  });

  it('does not reveal a flagged cell', () => {
    const { result } = renderHook(() => useMinesweeper('beginner', fixedRng()));

    act(() => result.current.toggleFlag(3, 3));
    act(() => result.current.reveal(3, 3));

    expect(result.current.board[3][3].state).toBe('flagged');
  });

  it('starts the timer on first reveal and stops it on loss, locking the board', () => {
    const { result } = renderHook(() => useMinesweeper('beginner', fixedRng()));

    act(() => result.current.reveal(4, 4));
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.elapsed).toBeGreaterThan(0);

    // Force a loss by revealing every remaining covered cell until a mine is hit,
    // or, if none is a mine (unlikely with 10 mines on 81 cells), assert win instead.
    let lastStatus = result.current.status;
    for (let row = 0; row < 9 && lastStatus === 'playing'; row += 1) {
      for (let col = 0; col < 9 && lastStatus === 'playing'; col += 1) {
        if (result.current.board[row][col].state !== 'covered') continue;
        act(() => result.current.reveal(row, col));
        lastStatus = result.current.status;
      }
    }

    expect(lastStatus).not.toBe('playing');
    const elapsedAtEnd = result.current.elapsed;
    const timeAtEnd = result.current.status;

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.elapsed).toBe(elapsedAtEnd); // timer stopped

    if (timeAtEnd === 'lost') {
      const exploded = result.current.board.flat().filter((cell) => cell.state === 'exploded');
      expect(exploded.length).toBeGreaterThanOrEqual(1);

      // Board is locked: revealing another covered cell is a no-op.
      const covered = result.current.board.flat().find((cell) => cell.state === 'covered');
      if (covered) {
        const before = result.current.board;
        const target = result.current.board.flat().findIndex((cell) => cell === covered);
        const row = Math.floor(target / 9);
        const col = target % 9;
        act(() => result.current.reveal(row, col));
        expect(result.current.board).toBe(before);
      }
    }
  });

  it('reaches a win state when every non-mine cell is revealed', () => {
    const { result } = renderHook(() => useMinesweeper('beginner', fixedRng()));

    act(() => result.current.reveal(0, 0));

    let guard = 0;
    while (result.current.status === 'playing' && guard < 200) {
      const flat = result.current.board.flat();
      const target = flat.find((cell) => cell.state === 'covered' && !cell.mine);
      if (!target) break;
      const index = flat.indexOf(target);
      const row = Math.floor(index / 9);
      const col = index % 9;
      act(() => result.current.reveal(row, col));
      guard += 1;
    }

    expect(result.current.status).toBe('won');
    const unflaggedMines = result.current.board.flat().filter((cell) => cell.mine && cell.state !== 'flagged');
    expect(unflaggedMines).toHaveLength(0);
  });
});
