"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom } from "@/lib/room";

export default function HomePage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function handleCreateRoom() {
    if (creating) return;
    setCreating(true);
    const roomId = await createRoom();
    // Người tạo luôn là quân X — lưu trước để vào /room/[id] không bị join lại
    sessionStorage.setItem(`kien-caro:room:${roomId}:symbol`, "X");
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
        gap: 16,
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
    </main>
  );
}
