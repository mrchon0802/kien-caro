// components/Board.tsx
"use client";

import { useState } from "react";
import { BOARD_SIZE, type Board as BoardType } from "@/lib/gameLogic";

interface BoardProps {
  board: BoardType;
  winningCells?: Array<[number, number]>;
  /** Quân của người chơi hiện tại trên máy này, dùng để biết có được phép đánh không */
  mySymbol: "X" | "O";
  /** Ai đang được đi lượt này */
  currentTurn: "X" | "O";
  /** Game đã kết thúc (thắng/hoà) thì khoá click */
  isGameOver: boolean;
  onCellClick: (row: number, col: number) => void;
}

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
    <div className="board-wrapper">
      <div
        className="board-grid"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
        }}
        role="grid"
        aria-label="Bàn cờ caro"
      >
        {board.map((rowArr, row) =>
          rowArr.map((cell, col) => {
            const isHover =
              hoverCell?.[0] === row && hoverCell?.[1] === col && !cell;
            const isWin = isWinningCell(row, col);

            return (
              <button
                key={`${row}-${col}`}
                type="button"
                role="gridcell"
                aria-label={
                  cell
                    ? `Ô ${row + 1},${col + 1}: ${cell === "X" ? "Quân X" : "Quân O"}`
                    : `Ô trống ${row + 1},${col + 1}`
                }
                className={`board-cell ${isWin ? "board-cell--win" : ""}`}
                disabled={!!cell || isGameOver || !isMyTurn}
                onMouseEnter={() => setHoverCell([row, col])}
                onMouseLeave={() => setHoverCell(null)}
                onClick={() => onCellClick(row, col)}
              >
                {cell && (
                  <span
                    className={`stone stone--${cell.toLowerCase()}`}
                    aria-hidden="true"
                  />
                )}
                {isHover && isMyTurn && (
                  <span
                    className={`stone-preview stone-preview--${mySymbol.toLowerCase()}`}
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })
        )}
      </div>

      <style jsx>{`
        .board-wrapper {
          /* Mobile-first: chiếm gần hết chiều rộng màn hình, không vượt quá
             chiều cao khả dụng (trừ khoảng cho header/footer ~220px) và
             không phình to quá mức trên màn hình lớn (max 560px). */
          width: min(96vw, calc(100vh - 220px), 560px);
          aspect-ratio: 1 / 1;
          padding: clamp(6px, 1.5vw, 14px);
          margin: 0 auto;
          box-sizing: border-box;
          background: linear-gradient(135deg, #c9925a 0%, #a8703f 100%);
          border-radius: 6px;
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .board-grid {
          position: relative;
          display: grid;
          width: 100%;
          height: 100%;
          background-color: #d9a868;
          background-image: linear-gradient(
              to right,
              rgba(0, 0, 0, 0.28) 1px,
              transparent 1px
            ),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.28) 1px, transparent 1px);
          background-size: calc(100% / ${BOARD_SIZE}) calc(100% / ${BOARD_SIZE});
          border: 2px solid rgba(0, 0, 0, 0.4);
          touch-action: manipulation; /* tránh double-tap zoom làm chậm phản hồi chạm */
        }

        .board-cell {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin: 0;
          background: transparent;
          border: none;
          cursor: pointer;
          position: relative;
          -webkit-tap-highlight-color: transparent; /* bỏ chớp xanh khi tap trên Chrome Android */
        }

        .board-cell:disabled {
          cursor: default;
        }

        .board-cell:focus-visible {
          outline: 2px solid #2b6cb0;
          outline-offset: -2px;
          z-index: 2;
        }

        .board-cell--win {
          background: rgba(255, 215, 0, 0.35);
        }

        .stone {
          width: 78%;
          height: 78%;
          border-radius: 50%;
          box-shadow: 0 2px 3px rgba(0, 0, 0, 0.4);
        }

        .stone--x {
          background: radial-gradient(circle at 35% 30%, #3a3a3a, #0a0a0a);
        }

        .stone--o {
          background: radial-gradient(circle at 35% 30%, #ffffff, #d4d4d4);
        }

        .stone-preview {
          position: absolute;
          width: 78%;
          height: 78%;
          border-radius: 50%;
          opacity: 0.35;
        }

        .stone-preview--x {
          background: #0a0a0a;
        }

        .stone-preview--o {
          background: #d4d4d4;
        }
      `}</style>
    </div>
  );
}