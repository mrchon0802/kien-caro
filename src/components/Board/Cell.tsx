"use client";

import styles from "./Board.module.css";
import type { CellProps } from "./types";

export default function Cell({
  row,
  col,
  cell,
  isWin,
  isHover,
  isMyTurn,
  isGameOver,
  mySymbol,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: CellProps) {
  return (
    <button
      type="button"
      role="gridcell"
      aria-label={
        cell
          ? `Ô ${row + 1}, ${col + 1}: Quân ${cell}`
          : `Ô trống ${row + 1}, ${col + 1}`
      }
      className={`${styles.boardCell} ${isWin ? styles.boardCellWin : ""}`}
      disabled={!!cell || isGameOver || !isMyTurn}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick(row, col)}
    >
      {cell && (
        <span
          className={`${styles.symbol} ${
            cell === "X" ? styles.symbolX : styles.symbolO
          }`}
        >
          {cell}
        </span>
      )}

      {isHover && isMyTurn && (
        <span
          className={`${styles.previewSymbol} ${
            mySymbol === "X" ? styles.previewSymbolX : styles.previewSymbolO
          }`}
        >
          {mySymbol}
        </span>
      )}
    </button>
  );
}
