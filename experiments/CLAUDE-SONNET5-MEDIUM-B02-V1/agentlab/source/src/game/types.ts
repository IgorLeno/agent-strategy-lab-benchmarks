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

export const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'expert'];

export type CellState = 'covered' | 'revealed' | 'flagged' | 'exploded';

export interface CellData {
  mine: boolean;
  state: CellState;
  adjacent: number;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  difficulty: Difficulty;
  rows: number;
  cols: number;
  mines: number;
  cells: CellData[][];
  status: GameStatus;
  minesPlaced: boolean;
  flagCount: number;
  revealedCount: number;
  explodedCell: { row: number; col: number } | null;
}

export type RandomSource = () => number;
