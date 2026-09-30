export type SymbolSetId = 'alpha' | 'hex' | 'numbers' | 'letters';

export interface SymbolConfig {
  id: SymbolSetId;
  name: string;
  description: string;
  symbols: string[]; // 16 items
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface CellData {
  row: number;
  col: number;
  value: number; // 0 for empty, 1-16
  solution: number; // 1-16
  isGiven: boolean;
  notes: number[]; // Array of 1-16 candidate numbers
  isError?: boolean;
  isHinted?: boolean;
}

export type Grid = CellData[][];

export interface HistoryItem {
  cells: {
    row: number;
    col: number;
    prevValue: number;
    newValue: number;
    prevNotes: number[];
    newNotes: number[];
  }[];
  description?: string;
}

export interface HintDetails {
  type: 'naked_single' | 'hidden_single' | 'error_check' | 'direct_reveal';
  title: string;
  message: string;
  row: number;
  col: number;
  value: number;
  affectedUnit?: 'cell' | 'row' | 'column' | 'box';
}

export interface GameStats {
  played: Record<Difficulty, number>;
  won: Record<Difficulty, number>;
  bestTime: Record<Difficulty, number | null>; // in seconds
  totalTime: number;
  streak: number;
  bestStreak: number;
}

export interface GameSettings {
  language: 'zh' | 'en';
  symbolSet: SymbolSetId;
  soundEnabled: boolean;
  musicEnabled: boolean;
  musicVolume: number; // 0 to 1
  highlightMatchingNumbers: boolean;
  highlightPeers: boolean;
  highlightErrors: boolean;
  autoRemoveNotes: boolean;
  blockShading: boolean;
  timerVisible: boolean;
}
