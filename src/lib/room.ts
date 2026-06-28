// lib/room.ts
import {
  ref,
  set,
  update,
  onValue,
  runTransaction,
  type Unsubscribe,
} from "firebase/database";
import { db } from "./firebase";
import {
  createEmptyBoard,
  placeMove,
  checkWinAt,
  isBoardFull,
  type Board,
} from "./gameLogic";

export type Symbol = "X" | "O";

export interface PlayerSlot {
  joined: boolean;
  name: string | null;
}

export interface RoomState {
  board: Board;
  currentTurn: Symbol;
  players: { X: PlayerSlot; O: PlayerSlot };
  score: { X: number; O: number };
  winner: Symbol | "draw" | null;
  winningCells: Array<[number, number]>;
  createdAt: number;
  lastMoveAt: number;
}

// Dạng dữ liệu thật sự lưu trên Firebase (board/winningCells là string JSON)
interface RawRoomState {
  board: string;
  currentTurn: Symbol;
  players: { X: PlayerSlot; O: PlayerSlot };
  score: { X: number; O: number };
  winner: Symbol | "draw" | null;
  winningCells: string;
  createdAt: number;
  lastMoveAt: number;
}

function toRaw(state: RoomState): RawRoomState {
  return {
    ...state,
    board: JSON.stringify(state.board),
    winningCells: JSON.stringify(state.winningCells),
  };
}

function fromRaw(raw: RawRoomState): RoomState {
  return {
    ...raw,
    board: JSON.parse(raw.board),
    winningCells: raw.winningCells ? JSON.parse(raw.winningCells) : [],
  };
}

/** Sinh roomId ngắn, dễ gửi qua link (6 ký tự, đủ khó đoán cho mục đích này) */
export function generateRoomId(): string {
  return Math.random().toString(36).slice(2, 8);
}

/**
 * Tạo phòng mới, người tạo luôn được gán quân X (đi trước).
 * Tên người chơi chưa có (null) — sẽ nhập sau qua setPlayerName.
 * Trả về roomId vừa tạo.
 */
export async function createRoom(): Promise<string> {
  const roomId = generateRoomId();
  const initialState: RoomState = {
    board: createEmptyBoard(),
    currentTurn: "X",
    players: {
      X: { joined: true, name: null },
      O: { joined: false, name: null },
    },
    score: { X: 0, O: 0 },
    winner: null,
    winningCells: [],
    createdAt: Date.now(),
    lastMoveAt: Date.now(),
  };

  await set(ref(db, `rooms/${roomId}`), toRaw(initialState));
  return roomId;
}

/**
 * Join vào phòng đã tồn tại. Dùng transaction để tránh race condition khi
 * 2 người cùng bấm join 1 lúc (chỉ 1 người được nhận quân O).
 * Trả về quân được gán cho NGƯỜI GỌI HÀM NÀY, hoặc null nếu phòng đầy/không
 * tồn tại/đã từng join trước đó theo cách khác.
 */
export async function joinRoom(roomId: string): Promise<Symbol | null> {
  const roomRef = ref(db, `rooms/${roomId}/players`);

  // Biến này được set bên trong callback transaction, dùng để biết chính
  // lần gọi này đã được gán quân gì (Firebase có thể gọi lại callback nhiều
  // lần nếu có xung đột, nên luôn lấy giá trị của lần cuối cùng commit).
  let assignedSymbol: Symbol | null = null;

  const result = await runTransaction(
    roomRef,
    (players: { X: PlayerSlot; O: PlayerSlot } | null) => {
      if (!players) {
        assignedSymbol = null;
        return players; // phòng không tồn tại -> không sửa gì
      }
      if (!players.X.joined) {
        assignedSymbol = "X";
        return { ...players, X: { ...players.X, joined: true } };
      }
      if (!players.O.joined) {
        assignedSymbol = "O";
        return { ...players, O: { ...players.O, joined: true } };
      }
      assignedSymbol = null; // phòng đã đầy
      return players;
    },
  );

  if (!result.committed) return null;
  return assignedSymbol;
}

/**
 * Đặt/đổi tên cho 1 người chơi trong phòng. Gọi sau khi đã được gán symbol
 * (qua createRoom hoặc joinRoom), trước khi ván cờ bắt đầu.
 */
export async function setPlayerName(
  roomId: string,
  symbol: Symbol,
  name: string,
): Promise<void> {
  await update(ref(db, `rooms/${roomId}/players/${symbol}`), {
    name: name.trim().slice(0, 20),
  });
}

/**
 * Đánh 1 quân vào phòng. Đọc board mới nhất, kiểm tra hợp lệ, ghi lại.
 * Nếu có người thắng, cộng điểm (+1) ngay trong transaction để tránh
 * mất đồng bộ. Hoà thì không cộng điểm cho ai.
 * Dùng transaction trên toàn bộ room để tránh 2 người đánh cùng lúc gây
 * mất đồng bộ (vd: mạng chậm, cả 2 click gần như đồng thời).
 */
export async function makeMove(
  roomId: string,
  row: number,
  col: number,
  player: Symbol,
): Promise<{ success: boolean; reason?: string }> {
  const roomRef = ref(db, `rooms/${roomId}`);

  let resultReason: string | undefined;

  const txResult = await runTransaction(roomRef, (raw: RawRoomState | null) => {
    if (!raw) {
      resultReason = "Phòng không tồn tại";
      return raw;
    }
    if (raw.winner) {
      resultReason = "Trận đã kết thúc";
      return raw; // không đổi gì
    }
    if (raw.currentTurn !== player) {
      resultReason = "Chưa đến lượt bạn";
      return raw;
    }
    if (!raw.players.X.name || !raw.players.O.name) {
      resultReason = "Chưa đủ 2 người chơi nhập tên";
      return raw;
    }

    const board: Board = JSON.parse(raw.board);
    const newBoard = placeMove(board, row, col, player);
    if (!newBoard) {
      resultReason = "Ô này đã có quân";
      return raw;
    }

    const winResult = checkWinAt(newBoard, row, col);
    const draw = !winResult && isBoardFull(newBoard);

    const score = { ...raw.score };
    if (winResult) {
      score[winResult.winner] = (score[winResult.winner] ?? 0) + 1;
    }

    return {
      ...raw,
      board: JSON.stringify(newBoard),
      currentTurn: player === "X" ? "O" : "X",
      score,
      winner: winResult ? winResult.winner : draw ? "draw" : null,
      winningCells: winResult ? JSON.stringify(winResult.winningCells) : "",
      lastMoveAt: Date.now(),
    };
  });

  if (!txResult.committed) {
    return { success: false, reason: resultReason ?? "Không thể đánh" };
  }
  return { success: true };
}

/**
 * Reset bàn cờ để chơi ván mới, giữ nguyên 2 người chơi và score trong phòng.
 */
export async function resetRoom(roomId: string): Promise<void> {
  await update(ref(db, `rooms/${roomId}`), {
    board: JSON.stringify(createEmptyBoard()),
    currentTurn: "X",
    winner: null,
    winningCells: "",
    lastMoveAt: Date.now(),
  });
}

/**
 * Lắng nghe realtime thay đổi của 1 phòng. Gọi callback mỗi khi data đổi.
 * Trả về hàm unsubscribe — PHẢI gọi khi component unmount để tránh leak.
 */
export function listenToRoom(
  roomId: string,
  callback: (state: RoomState | null) => void,
): Unsubscribe {
  const roomRef = ref(db, `rooms/${roomId}`);
  return onValue(roomRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback(fromRaw(snapshot.val() as RawRoomState));
  });
}

export interface OpenRoomSummary {
  roomId: string;
  hostName: string | null;
  createdAt: number;
}

/**
 * Lắng nghe danh sách các phòng đang "mở" — chỉ có người tạo (X) đã vào,
 * chưa có người thứ 2 (O) join. Dùng cho trang chủ để người chơi chọn vào
 * phòng có sẵn thay vì tạo phòng mới (tránh trường hợp 2 người cùng tạo
 * 2 phòng riêng mà không gặp được nhau).
 *
 * Lưu ý: cách này đọc toàn bộ node `rooms` mỗi lần — chỉ phù hợp ở quy mô
 * nhỏ (vài chục/trăm phòng đồng thời). Nếu lớn hơn cần đánh index riêng.
 */
export function listenToOpenRooms(
  callback: (rooms: OpenRoomSummary[]) => void,
): Unsubscribe {
  const roomsRef = ref(db, "rooms");
  return onValue(roomsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const all = snapshot.val() as Record<string, RawRoomState>;
    const open: OpenRoomSummary[] = Object.entries(all)
      .filter(([, raw]) => raw.players?.X?.joined && !raw.players?.O?.joined)
      .map(([roomId, raw]) => ({
        roomId,
        hostName: raw.players.X.name,
        createdAt: raw.createdAt,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    callback(open);
  });
}
