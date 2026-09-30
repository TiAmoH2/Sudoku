import React from 'react';
import { Award, Flame, Timer, Trophy, X } from 'lucide-react';
import { Difficulty, GameStats } from '../types/sudoku';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  const formatSeconds = (sec: number | null): string => {
    if (sec === null) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const totalPlayed = Object.values(stats.played).reduce((a, b) => a + b, 0);
  const totalWon = Object.values(stats.won).reduce((a, b) => a + b, 0);
  const winRate = totalPlayed > 0 ? Math.round((totalWon / totalPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Game Statistics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Summary */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400 block mb-1">Puzzles Solved</span>
              <span className="text-xl font-bold font-mono text-white tabular-nums">
                {totalWon} / {totalPlayed}
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400 block mb-1">Win Rate</span>
              <span className="text-xl font-bold font-mono text-indigo-400 tabular-nums">
                {winRate}%
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
              <span className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Current Streak
              </span>
              <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                {stats.streak} <span className="text-xs font-normal text-slate-500">(Best: {stats.bestStreak})</span>
              </span>
            </div>
          </div>

          {/* Breakdown by Difficulty */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Performance by Difficulty
            </h3>
            <div className="space-y-2">
              {difficulties.map((d) => {
                const played = stats.played[d] || 0;
                const won = stats.won[d] || 0;
                const rate = played > 0 ? Math.round((won / played) * 100) : 0;
                const best = stats.bestTime[d];

                return (
                  <div
                    key={d}
                    className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" />
                      <span className="capitalize font-semibold text-white text-sm">
                        {d}
                      </span>
                    </div>

                    <div className="flex items-center gap-5 font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500 font-sans mr-1">Won:</span>
                        <span>{won}/{played} ({rate}%)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-500 font-sans mr-0.5">Best:</span>
                        <span className={best !== null ? 'text-emerald-400' : 'text-slate-500'}>
                          {formatSeconds(best)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
