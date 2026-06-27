"use client";

import { useState } from "react";
import Board from "@/components/Board";
import {
  createEmptyBoard,
  placeMove,
  checkWinAt,
} from "@/lib/gameLogic";

export default function HomePage() {
  const [board, setBoard] = useState(createEmptyBoard());

  const [currentTurn, setCurrentTurn] = useState<"X" | "O">("X");

  const [winningCells, setWinningCells] = useState<
    Array<[number, number]>
  >([]);

  const [gameOver, setGameOver] = useState(false);

  function handleCellClick(row: number, col: number) {
    if (gameOver) return;

    const newBoard = placeMove(board, row, col, currentTurn);

    if (!newBoard) return;

    setBoard(newBoard);

    const result = checkWinAt(newBoard, row, col);

    if (result) {
      setWinningCells(result.winningCells);
      setGameOver(true);
      return;
    }

    setCurrentTurn(currentTurn === "X" ? "O" : "X");
  }

  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Board
        board={board}
        winningCells={winningCells}
        mySymbol={currentTurn}
        currentTurn={currentTurn}
        isGameOver={gameOver}
        onCellClick={handleCellClick}
      />
    </main>
  );
}