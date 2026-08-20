import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { useMinesweeper } from './game/useMinesweeper';

export default function App() {
  const { board, difficulty, status, elapsed, minesRemaining, reveal, toggleFlag, restart } =
    useMinesweeper('intermediate');

  return (
    <div className="app">
      <h1>Minesweeper</h1>
      <Controls
        difficulty={difficulty}
        status={status}
        minesRemaining={minesRemaining}
        elapsed={elapsed}
        onSelectDifficulty={(next) => restart(next)}
        onRestart={() => restart()}
      />
      <Board board={board} interactive={status === 'playing'} onReveal={reveal} onToggleFlag={toggleFlag} />
    </div>
  );
}
