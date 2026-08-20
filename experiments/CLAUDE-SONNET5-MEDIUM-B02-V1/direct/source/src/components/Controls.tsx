import type { Difficulty, GameStatus } from '../game/types';

const DIFFICULTY_OPTIONS: Array<{ key: Difficulty; label: string }> = [
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'expert', label: 'Expert' },
];

const STATUS_LABEL: Record<GameStatus, string> = {
  playing: 'Playing',
  won: 'You Won!',
  lost: 'You Lost',
};

const FACE: Record<GameStatus, string> = {
  playing: '🙂',
  won: '😎',
  lost: '😵',
};

interface ControlsProps {
  difficulty: Difficulty;
  status: GameStatus;
  minesRemaining: number;
  elapsed: number;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onRestart: () => void;
}

export function Controls({
  difficulty,
  status,
  minesRemaining,
  elapsed,
  onSelectDifficulty,
  onRestart,
}: ControlsProps) {
  return (
    <div className="controls">
      <div className="controls-row">
        <div className="mine-counter" data-testid="mine-counter" aria-label="Mines remaining">
          {String(minesRemaining).padStart(3, '0')}
        </div>

        <button
          type="button"
          className="restart-button"
          data-testid="restart"
          aria-label="Restart game"
          onClick={onRestart}
        >
          {FACE[status]}
        </button>

        <div className="timer" data-testid="timer" aria-label="Elapsed seconds">
          {String(elapsed).padStart(3, '0')}
        </div>
      </div>

      <div className="controls-row">
        <div className="difficulty" data-testid="difficulty" role="group" aria-label="Difficulty">
          {DIFFICULTY_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              data-difficulty={option.key}
              className={option.key === difficulty ? 'active' : ''}
              aria-pressed={option.key === difficulty}
              onClick={() => onSelectDifficulty(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="status" data-testid="status">
          {STATUS_LABEL[status]}
        </div>
      </div>
    </div>
  );
}
