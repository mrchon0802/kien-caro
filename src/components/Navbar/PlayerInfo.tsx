"use client";

import styles from "./Navbar.module.css";
import type { PlayerInfoProps } from "./types";

export default function PlayerInfo({ player }: PlayerInfoProps) {
  return (
    <div className={styles.player}>
      <span className={player.symbol === "X" ? styles.symbolX : styles.symbolO}>
        {player.symbol}
      </span>

      <span className={styles.playerName}>{player.name ?? "Đang chờ..."}</span>

      <span className={styles.score}>{player.score}</span>

      <span
        className={styles.onlineDot}
        style={{ background: player.online ? "#22c55e" : "#d1d5db" }}
        title={player.online ? "Online" : "Offline"}
      />
    </div>
  );
}
