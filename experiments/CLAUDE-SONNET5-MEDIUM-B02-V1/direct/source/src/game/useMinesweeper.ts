import { useCallback, useEffect, useRef, useState } from 'react';
import {
  countFlags,
  createBoard,
  flagRemainingMines,
  isWin,
  placeMines,
  revealAllMines,
  revealCell,
  revealMineAt,
  toggleFlag as toggleFlagOnBoard,
} from './board';
import type { Rng } from './board';
import type { Board, Difficulty, GameStatus } from './types';
import { DIFFICULTIES } from './types';

interface GameState {
  board: Board;
  difficulty: Difficulty;
  status: GameStatus;
  minesPlaced: boolean;
  elapsed: number;
}

function freshState(difficulty: Difficulty): GameState {
  const { rows, cols } = DIFFICULTIES[difficulty];
  return {
    board: createBoard(rows, cols),
    difficulty,
    status: 'playing',
    minesPlaced: false,
    elapsed: 0,
  };
}

export function useMinesweeper(initialDifficulty: Difficulty, rng: Rng = Math.random) {
  const [state, setState] = useState<GameState>(() => freshState(initialDifficulty));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current !== null) return;
    timerRef.current = setInterval(() => {
      setState((prev) => (prev.status === 'playing' ? { ...prev, elapsed: prev.elapsed + 1 } : prev));
    }, 1000);
  }, []);

  useEffect(() => stopTimer, [stopTimer]);

  const restart = useCallback(
    (difficulty?: Difficulty) => {
      stopTimer();
      setState((prev) => freshState(difficulty ?? prev.difficulty));
    },
    [stopTimer],
  );

  const reveal = useCallback(
    (row: number, col: number) => {
      setState((prev) => {
        if (prev.status !== 'playing') return prev;
        const clickedCell = prev.board[row][col];
        if (clickedCell.state !== 'covered') return prev;

        const { rows, cols, mines } = DIFFICULTIES[prev.difficulty];
        let board = prev.board;
        let minesPlaced = prev.minesPlaced;
        if (!minesPlaced) {
          board = placeMines(board, rows, cols, mines, row, col, rng);
          minesPlaced = true;
          startTimer();
        }

        if (board[row][col].mine) {
          board = revealMineAt(board, row, col);
          board = revealAllMines(board);
          stopTimer();
          return { ...prev, board, minesPlaced, status: 'lost' };
        }

        board = revealCell(board, rows, cols, row, col);
        if (isWin(board)) {
          board = flagRemainingMines(board);
          stopTimer();
          return { ...prev, board, minesPlaced, status: 'won' };
        }

        return { ...prev, board, minesPlaced };
      });
    },
    [startTimer, stopTimer],
  );

  const toggleFlag = useCallback((row: number, col: number) => {
    setState((prev) => {
      if (prev.status !== 'playing') return prev;
      const cell = prev.board[row][col];
      if (cell.state !== 'covered' && cell.state !== 'flagged') return prev;
      return { ...prev, board: toggleFlagOnBoard(prev.board, row, col) };
    });
  }, []);

  const { mines } = DIFFICULTIES[state.difficulty];
  const minesRemaining = mines - countFlags(state.board);

  return {
    board: state.board,
    difficulty: state.difficulty,
    status: state.status,
    elapsed: state.elapsed,
    minesRemaining,
    reveal,
    toggleFlag,
    restart,
  };
}
