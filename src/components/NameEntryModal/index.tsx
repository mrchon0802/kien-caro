"use client";

import { useState } from "react";
import styles from "./NameEntryModal.module.css";

interface NameEntryModalProps {
  /** "X" hoặc "O" — để hiển thị bạn được gán quân nào */
  mySymbol: "X" | "O";
  onSubmit: (name: string) => void;
}

export default function NameEntryModal({
  mySymbol,
  onSubmit,
}: NameEntryModalProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    onSubmit(trimmed);
  }

  return (
    <div className={styles.overlay}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Nhập tên của bạn</h2>
        <p className={styles.subtitle}>
          Bạn được gán quân{" "}
          <span className={mySymbol === "X" ? styles.symbolX : styles.symbolO}>
            {mySymbol}
          </span>
        </p>

        <input
          autoFocus
          className={styles.input}
          maxLength={20}
          placeholder="Enter your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          type="submit"
          className={styles.button}
          disabled={!name.trim() || submitting}
        >
          Vào trận
        </button>
      </form>
    </div>
  );
}
