import { useCallback, useRef } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import type { CellData } from '../game/types';

const LONG_PRESS_MS = 500;

const ADJACENT_COLORS = ['', '#1a56db', '#15803d', '#dc2626', '#6d28d9', '#b45309', '#0e7490', '#111827', '#6b7280'];

interface CellProps {
  row: number;
  col: number;
  cell: CellData;
  disabled: boolean;
  onReveal: (row: number, col: number) => void;
  onFlag: (row: number, col: number) => void;
}

export function Cell({ row, col, cell, disabled, onReveal, onFlag }: CellProps) {
  const longPressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    onReveal(row, col);
  }, [disabled, onReveal, row, col]);

  const handleContextMenu = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      if (disabled) return;
      onFlag(row, col);
    },
    [disabled, onFlag, row, col],
  );

  const handleTouchStart = useCallback(() => {
    if (disabled) return;
    longPressFired.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      onFlag(row, col);
    }, LONG_PRESS_MS);
  }, [disabled, onFlag, row, col]);

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLButtonElement>) => {
      clearLongPress();
      event.preventDefault();
      if (longPressFired.current) {
        longPressFired.current = false;
        return;
      }
      if (!disabled) onReveal(row, col);
    },
    [clearLongPress, disabled, onReveal, row, col],
  );

  const handleTouchMove = useCallback(() => {
    clearLongPress();
  }, [clearLongPress]);

  const showAdjacent = cell.state === 'revealed' && !cell.mine;
  const dataAttrs = showAdjacent ? { 'data-adjacent': String(cell.adjacent) } : {};

  return (
    <button
      type="button"
      className={`cell cell--${cell.state}`}
      data-testid="cell"
      data-row={row}
      data-col={col}
      data-state={cell.state}
      {...dataAttrs}
      aria-label={describeCell(row, col, cell)}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      style={cell.state === 'revealed' && cell.adjacent > 0 ? { color: ADJACENT_COLORS[cell.adjacent] } : undefined}
    >
      {renderContent(cell)}
    </button>
  );
}

function renderContent(cell: CellData): string {
  if (cell.state === 'flagged') return '\u{1F6A9}';
  if (cell.state === 'exploded') return '\u{1F4A5}';
  if (cell.state === 'revealed') {
    if (cell.mine) return '\u{1F4A3}';
    return cell.adjacent > 0 ? String(cell.adjacent) : '';
  }
  return '';
}

function describeCell(row: number, col: number, cell: CellData): string {
  const position = `Row ${row + 1}, column ${col + 1}`;
  if (cell.state === 'covered') return `${position}, covered`;
  if (cell.state === 'flagged') return `${position}, flagged`;
  if (cell.state === 'exploded') return `${position}, exploded mine`;
  if (cell.mine) return `${position}, revealed mine`;
  return cell.adjacent > 0 ? `${position}, ${cell.adjacent} adjacent mines` : `${position}, empty`;
}
