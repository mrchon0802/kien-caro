export type Symbol = "X" | "O";

export interface Player {
  name: string | null;
  symbol: Symbol;
  score: number;
  online: boolean;
}

export interface NavbarProps {
  playerX: Player;
  playerO: Player;
}

export interface PlayerInfoProps {
  player: Player;
}
