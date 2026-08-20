import { useRef } from 'react';
import type { Cell as CellModel } from '../game/types';

const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD_PX = 10;

const NUMBER_LABEL: Record<number, string> = {
  1: 'n1',
  2: 'n2',
  3: 'n3',
  4: 'n4',
  5: 'n5',
  6: 'n6',
  7: 'n7',
  8: 'n8',
};

interface CellProps {
  row: number;
  col: number;
  cell: CellModel;
  interactive: boolean;
  onReveal: () => void;
  onToggleFlag: () => void;
}

export function Cell({ row, col, cell, interactive, onReveal, onToggleFlag }: CellProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchMoved = useRef(false);
  const longPressFired = useRef(false);
  const suppressNextClick = useRef(false);

  const clearLongPressTimer = () => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleClick = () => {
    if (suppressNextClick.current) {
      suppressNextClick.current = false;
      return;
    }
    if (!interactive) return;
    onReveal();
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!interactive) return;
    onToggleFlag();
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (!interactive) return;
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    touchMoved.current = false;
    longPressFired.current = false;
    clearLongPressTimer();
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onToggleFlag();
    }, LONG_PRESS_MS);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touch = event.touches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    if (Math.hypot(dx, dy) > MOVE_THRESHOLD_PX) {
      touchMoved.current = true;
      clearLongPressTimer();
    }
  };

  const handleTouchEnd = () => {
    clearLongPressTimer();
    if (longPressFired.current) {
      suppressNextClick.current = true;
      return;
    }
    if (!touchMoved.current && interactive) {
      suppressNextClick.current = true;
      onReveal();
    }
  };

  const state = cell.state;
  const showAdjacent = state === 'revealed' && !cell.mine;
  const showsMine = state === 'exploded' || (state === 'revealed' && cell.mine);
  const showsFlag = state === 'flagged';

  const classNames = ['cell', `cell-${state}`];
  if (showAdjacent && cell.adjacent > 0) classNames.push(NUMBER_LABEL[cell.adjacent]);

  return (
    <div
      data-testid="cell"
      data-row={row}
      data-col={col}
      data-state={state}
      data-adjacent={showAdjacent ? String(cell.adjacent) : undefined}
      className={classNames.join(' ')}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {showsFlag ? '🚩' : showsMine ? '💣' : showAdjacent && cell.adjacent > 0 ? cell.adjacent : ''}
    </div>
  );
}
