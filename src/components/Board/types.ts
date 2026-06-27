// src/components/Board/types.ts

import type { Board as BoardType } from "@/lib/gameLogic";

export interface BoardProps {
  board: BoardType;
  winningCells?: Array<[number, number]>;
  mySymbol: "X" | "O";
  currentTurn: "X" | "O";
  isGameOver: boolean;
  onCellClick: (row: number, col: number) => void;
}

export interface CellProps {
  row: number;
  col: number;

  cell: "X" | "O" | null;

  isWin: boolean;

  isHover: boolean;

  isMyTurn: boolean;

  isGameOver: boolean;

  mySymbol: "X" | "O";

  onClick: (row: number, col: number) => void;

  onMouseEnter: () => void;

  onMouseLeave: () => void;
}