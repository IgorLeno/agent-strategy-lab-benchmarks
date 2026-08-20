import type { Board as BoardModel } from '../game/types';
import { Cell } from './Cell';

interface BoardProps {
  board: BoardModel;
  interactive: boolean;
  onReveal: (row: number, col: number) => void;
  onToggleFlag: (row: number, col: number) => void;
}

export function Board({ board, interactive, onReveal, onToggleFlag }: BoardProps) {
  const cols = board[0]?.length ?? 0;

  return (
    <div className="board-scroll">
      <div
        className="board"
        data-testid="board"
        style={{ gridTemplateColumns: `repeat(${cols}, var(--cell-size))` }}
      >
        {board.map((rowCells, row) =>
          rowCells.map((cell, col) => (
            <Cell
              key={`${row}-${col}`}
              row={row}
              col={col}
              cell={cell}
              interactive={interactive}
              onReveal={() => onReveal(row, col)}
              onToggleFlag={() => onToggleFlag(row, col)}
            />
          )),
        )}
      </div>
    </div>
  );
}
