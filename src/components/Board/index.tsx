"use client";

import { useState } from "react";

import styles from "./Board.module.css";
import Cell from "./Cell";

import { BOARD_SIZE } from "@/lib/gameLogic";

import type { BoardProps } from "./types";

export default function Board({
  board,
  winningCells = [],
  mySymbol,
  currentTurn,
  isGameOver,
  onCellClick,
}: BoardProps) {
  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);

  const isMyTurn = mySymbol === currentTurn && !isGameOver;

  const isWinningCell = (row: number, col: number) =>
    winningCells.some(([r, c]) => r === row && c === col);

  return (
    <div className={styles.boardWrapper}>
      <div
        className={styles.boardGrid}
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE},1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE},1fr)`,
          backgroundSize: `calc(100% / ${BOARD_SIZE}) calc(100% / ${BOARD_SIZE})`,
        }}
        role="grid"
        aria-label="Bàn cờ Caro"
      >
        {board.map((rowArr, row) =>
          rowArr.map((cell, col) => (
            <Cell
              key={`${row}-${col}`}
              row={row}
              col={col}
              cell={cell}
              isWin={isWinningCell(row, col)}
              isHover={
                hoverCell?.[0] === row &&
                hoverCell?.[1] === col &&
                !cell
              }
              isMyTurn={isMyTurn}
              isGameOver={isGameOver}
              mySymbol={mySymbol}
              onClick={onCellClick}
              onMouseEnter={() => setHoverCell([row, col])}
              onMouseLeave={() => setHoverCell(null)}
            />
          ))
        )}
      </div>
    </div>
  );
}