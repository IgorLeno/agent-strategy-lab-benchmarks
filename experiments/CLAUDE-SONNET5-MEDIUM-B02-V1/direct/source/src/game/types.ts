export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

export type CellState = 'covered' | 'revealed' | 'flagged' | 'exploded';

export interface Cell {
  mine: boolean;
  adjacent: number;
  state: CellState;
}

export type Board = Cell[][];

export type GameStatus = 'playing' | 'won' | 'lost';
