import { useCallback, useEffect, useState } from 'react';
import { createGame, revealCell, toggleFlag } from '../game/logic';
import type { Difficulty, GameState } from '../game/types';

export interface MinesweeperApi {
  game: GameState;
  elapsed: number;
  reveal: (row: number, col: number) => void;
  flag: (row: number, col: number) => void;
  restart: (difficulty?: Difficulty) => void;
}

export function useMinesweeper(initialDifficulty: Difficulty): MinesweeperApi {
  const [game, setGame] = useState<GameState>(() => createGame(initialDifficulty));
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!game.minesPlaced || game.status !== 'playing') return undefined;
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [game.minesPlaced, game.status]);

  const reveal = useCallback((row: number, col: number) => {
    setGame((current) => revealCell(current, row, col));
  }, []);

  const flag = useCallback((row: number, col: number) => {
    setGame((current) => toggleFlag(current, row, col));
  }, []);

  const restart = useCallback((difficulty?: Difficulty) => {
    setGame((current) => createGame(difficulty ?? current.difficulty));
    setElapsed(0);
  }, []);

  return { game, elapsed, reveal, flag, restart };
}
