import type { CSSProperties } from 'react';
import { Cell } from './Cell';
import type { GameState } from '../game/types';

interface BoardProps {
  game: GameState;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
}

export function Board({ game, onReveal, onFlag }: BoardProps) {
  const disabled = game.status !== 'playing';
  const style = { '--cols': game.cols } as CSSProperties;

  return (
    <div className="board" data-testid="board" style={style}>
      {game.cells.map((row, r) =>
        row.map((cell, c) => (
          <Cell key={`${r}-${c}`} row={r} col={c} cell={cell} disabled={disabled} onReveal={onReveal} onFlag={onFlag} />
        )),
      )}
    </div>
  );
}
