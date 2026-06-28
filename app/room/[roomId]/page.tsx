"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Board from "@/components/Board/index";
import Navbar from "@/components/Navbar/index";
import NameEntryModal from "@/components/NameEntryModal/index";

import {
  joinRoom,
  setPlayerName,
  makeMove,
  resetRoom,
  listenToRoom,
  type RoomState,
  type Symbol,
} from "@/lib/room";

function symbolStorageKey(roomId: string) {
  return `kien-caro:room:${roomId}:symbol`;
}

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;

  // null = đang xác định, "full" = phòng đầy/không tồn tại
  const [mySymbol, setMySymbol] = useState<Symbol | "full" | null>(() => {
    if (typeof window === "undefined" || !roomId) return null;
    const saved = sessionStorage.getItem(symbolStorageKey(roomId));
    return saved === "X" || saved === "O" ? saved : null;
  });
  const [room, setRoom] = useState<RoomState | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  // Bước 1: nếu chưa có symbol nhớ từ trước (lần đầu vào phòng), xin join.
  useEffect(() => {
    if (!roomId || mySymbol) return;

    joinRoom(roomId).then((symbol) => {
      if (symbol) {
        sessionStorage.setItem(symbolStorageKey(roomId), symbol);
        setMySymbol(symbol);
      } else {
        setMySymbol("full");
      }
    });
  }, [roomId, mySymbol]);

  // Bước 2: lắng nghe realtime state của phòng
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = listenToRoom(roomId, (state) => {
      setRoom(state);
      setLoadingRoom(false);
    });
    return unsubscribe;
  }, [roomId]);

  if (mySymbol === "full") {
    return <CenterMessage text="Phòng đã đầy hoặc không tồn tại." />;
  }

  if (!mySymbol || loadingRoom) {
    return <CenterMessage text="Đang vào phòng..." />;
  }

  if (!room) {
    return <CenterMessage text="Không tìm thấy phòng này." />;
  }

  const myName = room.players[mySymbol].name;
  const bothNamed = !!room.players.X.name && !!room.players.O.name;

  // Bước 3: chưa nhập tên -> hiện modal nhập tên trước
  if (!myName) {
    return (
      <NameEntryModal
        mySymbol={mySymbol}
        onSubmit={(name) => setPlayerName(roomId, mySymbol, name)}
      />
    );
  }

  // Đã nhập tên nhưng đối thủ chưa -> chờ
  if (!bothNamed) {
    return <CenterMessage text="Đang chờ đối thủ nhập tên..." />;
  }

  const isGameOver = room.winner !== null;
  const symbol: Symbol = mySymbol;

  function handleCellClick(row: number, col: number) {
    makeMove(roomId, row, col, symbol);
  }

  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <Navbar
        playerX={{
          symbol: "X",
          name: room.players.X.name,
          score: room.score.X,
          online: room.players.X.joined,
        }}
        playerO={{
          symbol: "O",
          name: room.players.O.name,
          score: room.score.O,
          online: room.players.O.joined,
        }}
      />

      <Board
        board={room.board}
        winningCells={room.winningCells}
        mySymbol={mySymbol}
        currentTurn={room.currentTurn}
        isGameOver={isGameOver}
        onCellClick={handleCellClick}
      />

      {isGameOver && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <p style={{ fontWeight: 600 }}>
            {room.winner === "draw" || room.winner === null
              ? "Hoà cờ!"
              : `${room.players[room.winner].name} thắng!`}
          </p>
          <button
            onClick={() => resetRoom(roomId)}
            style={{
              height: 40,
              padding: "0 20px",
              borderRadius: 8,
              border: "none",
              background: "#111",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Đánh lại
          </button>
        </div>
      )}
    </main>
  );
}

function CenterMessage({ text }: { text: string }) {
  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <p>{text}</p>
    </main>
  );
}
