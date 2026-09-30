import { Difficulty, GameSettings, GameStats, Grid } from '../types/sudoku';

const STATS_KEY = 'hexagrid_stats_v1';
const SETTINGS_KEY = 'hexagrid_settings_v1';
const GAME_STATE_KEY = 'hexagrid_current_game_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  language: 'zh',
  symbolSet: 'alpha',
  soundEnabled: true,
  musicEnabled: false,
  musicVolume: 0.4,
  highlightMatchingNumbers: true,
  highlightPeers: true,
  highlightErrors: true,
  autoRemoveNotes: true,
  blockShading: true,
  timerVisible: true,
};

export const DEFAULT_STATS: GameStats = {
  played: { easy: 0, medium: 0, hard: 0, expert: 0 },
  won: { easy: 0, medium: 0, hard: 0, expert: 0 },
  bestTime: { easy: null, medium: null, hard: null, expert: null },
  totalTime: 0,
  streak: 0,
  bestStreak: 0,
};

export interface SavedGameState {
  grid: Grid;
  solution: number[][];
  difficulty: Difficulty;
  timeSeconds: number;
  hintsUsed: number;
  mistakes: number;
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return { ...DEFAULT_STATS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_STATS;
}

export function recordGameWin(difficulty: Difficulty, timeSeconds: number): GameStats {
  const stats = loadStats();
  stats.played[difficulty] = (stats.played[difficulty] || 0) + 1;
  stats.won[difficulty] = (stats.won[difficulty] || 0) + 1;
  stats.totalTime += timeSeconds;
  stats.streak += 1;
  if (stats.streak > stats.bestStreak) {
    stats.bestStreak = stats.streak;
  }

  const currentBest = stats.bestTime[difficulty];
  if (currentBest === null || timeSeconds < currentBest) {
    stats.bestTime[difficulty] = timeSeconds;
  }

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}

  return stats;
}

export function recordGameStart(difficulty: Difficulty): void {
  const stats = loadStats();
  stats.played[difficulty] = (stats.played[difficulty] || 0) + 1;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function saveCurrentGame(state: SavedGameState | null): void {
  try {
    if (state === null) {
      localStorage.removeItem(GAME_STATE_KEY);
    } else {
      localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
    }
  } catch {}
}

export function loadSavedGame(): SavedGameState | null {
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.grid && parsed.solution && parsed.difficulty) {
        return parsed;
      }
    }
  } catch {}
  return null;
}
