import React from 'react';
import { Award, Clock, Play, RotateCcw, Trophy } from 'lucide-react';
import { Difficulty } from '../types/sudoku';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: (difficulty: Difficulty) => void;
  difficulty: Difficulty;
  timeSeconds: number;
  hintsUsed: number;
  mistakes: number;
  isBestTime: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  onPlayAgain,
  difficulty,
  timeSeconds,
  hintsUsed,
  mistakes,
  isBestTime,
}) => {
  if (!isOpen) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours}h ${(mins % 60).toString().padStart(2, '0')}m ${secs
        .toString()
        .padStart(2, '0')}s`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-center">
        {/* Victory Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
          <Trophy className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-1 font-sans">
          Puzzle Solved!
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Congratulations on mastering this 16×16 Super Sudoku grid!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Time
            </span>
            <span className="text-lg font-bold font-mono text-white tabular-nums">
              {formatTime(timeSeconds)}
            </span>
            {isBestTime && (
              <span className="text-[10px] text-amber-400 font-semibold mt-0.5">
                New Record!
              </span>
            )}
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-indigo-400" /> Difficulty
            </span>
            <span className="text-lg font-bold capitalize text-white">
              {difficulty}
            </span>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">Mistakes</span>
            <span className="text-lg font-bold font-mono text-white">
              {mistakes}
            </span>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">Hints Used</span>
            <span className="text-lg font-bold font-mono text-white">
              {hintsUsed}
            </span>
          </div>
        </div>

        {/* Play Again Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => onPlayAgain(difficulty)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-600/30"
          >
            <Play className="w-4 h-4" />
            <span>Play Next Puzzle ({difficulty})</span>
          </button>

          <div className="flex gap-2 pt-2">
            {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => onPlayAgain(d)}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                  d === difficulty
                    ? 'bg-slate-800 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
