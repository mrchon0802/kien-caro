"use client";

import { useState } from "react";
import Board from "@/components/Board/index";
import Navbar from "@/components/Navbar/index";
import { createEmptyBoard, placeMove, checkWinAt } from "@/lib/gameLogic";

export default function HomePage() {
  const [board, setBoard] = useState(createEmptyBoard());

  const [currentTurn, setCurrentTurn] = useState<"X" | "O">("X");

  const [winningCells, setWinningCells] = useState<Array<[number, number]>>([]);

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
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <>
        <Navbar
          playerX={{
            id: "1",
            name: "Mín",
            symbol: "X",
            score: 2,
            online: true,
          }}
          playerO={{
            id: "2",
            name: "Chón",
            symbol: "O",
            score: 1,
            online: true,
          }}
        />
        <Board
          board={board}
          winningCells={winningCells}
          mySymbol={currentTurn}
          currentTurn={currentTurn}
          isGameOver={gameOver}
          onCellClick={handleCellClick}
        />
      </>
    </main>
  );
}
