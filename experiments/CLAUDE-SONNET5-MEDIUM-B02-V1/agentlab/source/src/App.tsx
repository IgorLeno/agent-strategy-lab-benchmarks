import { Board } from './components/Board';
import { useMinesweeper } from './hooks/useMinesweeper';
import { DIFFICULTY_ORDER } from './game/types';
import type { Difficulty, GameStatus } from './game/types';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
};

const STATUS_LABELS: Record<GameStatus, string> = {
  playing: 'Playing',
  won: 'Won',
  lost: 'Lost',
};

const STATUS_EMOJI: Record<GameStatus, string> = {
  playing: '\u{1F642}',
  won: '\u{1F60E}',
  lost: '\u{1F635}',
};

export default function App() {
  const { game, elapsed, reveal, flag, restart } = useMinesweeper('intermediate');
  const minesRemaining = game.mines - game.flagCount;

  return (
    <div className="app">
      <h1>Minesweeper</h1>
      <div className="controls">
        <div className="difficulty" data-testid="difficulty" role="group" aria-label="Difficulty">
          {DIFFICULTY_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              data-difficulty={key}
              className={key === game.difficulty ? 'difficulty-btn difficulty-btn--active' : 'difficulty-btn'}
              aria-pressed={key === game.difficulty}
              onClick={() => restart(key)}
            >
              {DIFFICULTY_LABELS[key]}
            </button>
          ))}
        </div>
        <div className="status-row">
          <div className="counter" data-testid="mine-counter">
            {formatCount(minesRemaining)}
          </div>
          <button type="button" className="restart" data-testid="restart" aria-label="Restart game" onClick={() => restart()}>
            {STATUS_EMOJI[game.status]}
          </button>
          <div className="timer" data-testid="timer">
            {formatCount(elapsed)}
          </div>
        </div>
        <div className={`status status--${game.status}`} data-testid="status">
          {STATUS_LABELS[game.status]}
        </div>
      </div>
      <div className="board-wrapper">
        <Board game={game} onReveal={reveal} onFlag={flag} />
      </div>
    </div>
  );
}

function formatCount(value: number): string {
  const sign = value < 0 ? '-' : '';
  const digits = Math.abs(value).toString().padStart(2, '0');
  return `${sign}${digits}`;
}
