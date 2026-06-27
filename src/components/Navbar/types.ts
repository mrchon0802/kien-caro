export type Symbol = "X" | "O";

export interface Player {
  id: string;
  name: string;
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
