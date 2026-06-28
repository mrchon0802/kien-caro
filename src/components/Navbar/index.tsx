"use client";

import styles from "./Navbar.module.css";
import PlayerInfo from "./PlayerInfo";
import type { NavbarProps } from "./types";

export default function Navbar({ roomId, playerX, playerO }: NavbarProps) {
  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>
        <span className={styles.roomId}>ID: #{roomId}</span>
      </div>

      <div className={styles.players}>
        <PlayerInfo player={playerX} />

        <PlayerInfo player={playerO} />
      </div>
    </header>
  );
}
