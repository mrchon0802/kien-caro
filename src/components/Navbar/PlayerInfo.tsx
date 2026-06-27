"use client";

import styles from "./Navbar.module.css";
import type { PlayerInfoProps } from "./types";

export default function PlayerInfo({ player }: PlayerInfoProps) {
  return (
    <div className={styles.player}>
      <span className={player.symbol === "X" ? styles.symbolX : styles.symbolO}>
        {player.symbol}
      </span>

      <span className={styles.playerName}>{player.name}</span>

      <span className={styles.score}>{player.score}</span>
    </div>
  );
}
