"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createRoom,
  listenToOpenRooms,
  type OpenRoomSummary,
} from "@/lib/room";

export default function HomePage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [openRooms, setOpenRooms] = useState<OpenRoomSummary[]>([]);

  useEffect(() => {
    const unsubscribe = listenToOpenRooms(setOpenRooms);
    return unsubscribe;
  }, []);

  async function handleCreateRoom() {
    if (creating) return;
    setCreating(true);
    const roomId = await createRoom();
    // Người tạo luôn là quân X — lưu trước để vào /room/[id] không bị join lại
    sessionStorage.setItem(`kien-caro:room:${roomId}:symbol`, "X");
    router.push(`/room/${roomId}`);
  }

  function handleJoinRoom(roomId: string) {
    // Không set sẵn symbol — vào /room/[id] sẽ tự gọi joinRoom() và nhận quân O
    router.push(`/room/${roomId}`);
  }

  return (
    <main
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 24,
        padding: "40px 16px",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>Kiến Caro</h1>

      <button
        onClick={handleCreateRoom}
        disabled={creating}
        style={{
          height: 48,
          padding: "0 28px",
          borderRadius: 10,
          border: "none",
          background: "#111",
          color: "white",
          fontWeight: 600,
          fontSize: 16,
          cursor: creating ? "not-allowed" : "pointer",
        }}
      >
        {creating ? "Đang tạo..." : "Tạo phòng mới"}
      </button>

      <div
        style={{
          width: "min(420px, 90vw)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, color: "#555", margin: 0 }}>
          Phòng đang chờ người chơi ({openRooms.length})
        </p>

        {openRooms.length === 0 && (
          <p style={{ fontSize: 14, color: "#999", margin: 0 }}>
            Chưa có phòng nào đang mở.
          </p>
        )}

        {openRooms.map((room) => (
          <button
            key={room.roomId}
            onClick={() => handleJoinRoom(room.roomId)}
            style={{
              height: 52,
              padding: "0 16px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              background: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            <span>
              Phòng <strong>#{room.roomId}</strong>
              {room.hostName ? ` — ${room.hostName}` : ""}
            </span>
            <span style={{ color: "#2563eb", fontWeight: 600 }}>Vào phòng</span>
          </button>
        ))}
      </div>
    </main>
  );
}
