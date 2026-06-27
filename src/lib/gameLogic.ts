// lib/gameLogic.ts

export const BOARD_SIZE = 15;
export const WIN_COUNT = 5;

export type CellValue = "X" | "O" | null;
export type Board = CellValue[][];

/**
 * Tạo bàn cờ trống BOARD_SIZE x BOARD_SIZE
 */
export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

/**
 * Đánh 1 quân vào bàn cờ tại (row, col), trả về bàn cờ MỚI (không mutate bàn cũ)
 * Trả về null nếu ô đó đã có quân hoặc vị trí không hợp lệ -> để component tự xử lý báo lỗi
 */
export function placeMove(
  board: Board,
  row: number,
  col: number,
  player: "X" | "O"
): Board | null {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return null;
  if (board[row][col] !== null) return null;

  const newBoard = board.map((r) => [...r]);
  newBoard[row][col] = player;
  return newBoard;
}

/**
 * Kết quả kiểm tra thắng: ai thắng và danh sách toạ độ 5 quân thắng (để highlight UI)
 */
export interface WinResult {
  winner: "X" | "O";
  winningCells: Array<[number, number]>;
}

const DIRECTIONS: Array<[number, number]> = [
  [0, 1], // ngang
  [1, 0], // dọc
  [1, 1], // chéo xuống phải
  [1, -1], // chéo xuống trái
];

/**
 * Kiểm tra toàn bàn cờ xem có ai thắng chưa.
 * Dùng sau MỖI lượt đánh để check trạng thái game.
 */
export function checkWin(board: Board): WinResult | null {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const player = board[row][col];
      if (!player) continue;

      for (const [dr, dc] of DIRECTIONS) {
        const cells: Array<[number, number]> = [[row, col]];

        for (let step = 1; step < WIN_COUNT; step++) {
          const r = row + dr * step;
          const c = col + dc * step;
          if (
            r < 0 ||
            r >= BOARD_SIZE ||
            c < 0 ||
            c >= BOARD_SIZE ||
            board[r][c] !== player
          ) {
            break;
          }
          cells.push([r, c]);
        }

        if (cells.length === WIN_COUNT) {
          return { winner: player, winningCells: cells };
        }
      }
    }
  }
  return null;
}

/**
 * Kiểm tra hoà cờ: bàn đầy mà không ai thắng
 */
export function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== null));
}

/**
 * Hàm tiện ích: chỉ kiểm tra quanh 1 ô vừa đánh (tối ưu hơn checkWin toàn bàn,
 * dùng khi muốn check nhanh ngay sau 1 lượt đánh thay vì quét lại từ đầu)
 */
export function checkWinAt(
  board: Board,
  row: number,
  col: number
): WinResult | null {
  const player = board[row][col];
  if (!player) return null;

  for (const [dr, dc] of DIRECTIONS) {
    const cells: Array<[number, number]> = [[row, col]];

    // Đi theo chiều thuận
    for (let step = 1; step < WIN_COUNT; step++) {
      const r = row + dr * step;
      const c = col + dc * step;
      if (
        r < 0 ||
        r >= BOARD_SIZE ||
        c < 0 ||
        c >= BOARD_SIZE ||
        board[r][c] !== player
      )
        break;
      cells.push([r, c]);
    }

    // Đi theo chiều ngược
    for (let step = 1; step < WIN_COUNT; step++) {
      const r = row - dr * step;
      const c = col - dc * step;
      if (
        r < 0 ||
        r >= BOARD_SIZE ||
        c < 0 ||
        c >= BOARD_SIZE ||
        board[r][c] !== player
      )
        break;
      cells.unshift([r, c]);
    }

    if (cells.length >= WIN_COUNT) {
      // Lấy đúng 5 quân liên tiếp đầu tiên tìm thấy
      return { winner: player, winningCells: cells.slice(0, WIN_COUNT) };
    }
  }

  return null;
}