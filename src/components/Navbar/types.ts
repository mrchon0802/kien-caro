export type Symbol = "X" | "O";

export interface Player {
  symbol: Symbol;
  name: string | null;
  score: number;
  online: boolean;
}

export interface NavbarProps {
  roomId: string;
  playerX: Player;
  playerO: Player;
}

export interface PlayerInfoProps {
  player: Player;
}
