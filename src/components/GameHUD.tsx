import React from 'react';
import { AlertCircle, Music, Pause, Play, RotateCcw } from 'lucide-react';
import { Difficulty } from '../types/sudoku';

interface GameHUDProps {
  difficulty: Difficulty;
  mistakes: number;
  timeSeconds: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  filledCount: number;
  totalCells: number;
  musicEnabled: boolean;
  onToggleMusic: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  difficulty,
  mistakes,
  timeSeconds,
  isPaused,
  onTogglePause,
  onRestart,
  filledCount,
  totalCells,
  musicEnabled,
  onToggleMusic,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours}:${(mins % 60).toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round((filledCount / totalCells) * 100);

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl">
      {/* Left zone: Difficulty and Progress */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Difficulty:</span>
          <span className="capitalize font-semibold text-indigo-400">
            {difficulty}
          </span>
        </div>

        <span className="text-slate-600 hidden sm:inline">·</span>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Progress:</span>
          <span className="font-mono tabular-nums text-slate-200">
            {filledCount}/{totalCells} ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Right zone: Mistakes, Music & Timer */}
      <div className="flex items-center gap-4 text-xs">
        {/* Mistakes */}
        <div className="flex items-center gap-1 text-slate-300">
          <AlertCircle className={`w-3.5 h-3.5 ${mistakes > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          <span className="text-slate-400">Mistakes:</span>
          <span className={`font-mono font-semibold ${mistakes > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
            {mistakes}
          </span>
        </div>

        <span className="text-slate-600">·</span>

        {/* Background Music Quick Button */}
        <button
          onClick={onToggleMusic}
          className={`p-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
            musicEnabled
              ? 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
          title={musicEnabled ? 'Turn Background Music OFF' : 'Turn Background Music ON'}
        >
          <Music className={`w-3.5 h-3.5 ${musicEnabled ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] hidden md:inline">
            {musicEnabled ? 'Music' : 'Music Off'}
          </span>
        </button>

        <span className="text-slate-600">·</span>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold tracking-wider text-slate-100 tabular-nums">
            {formatTime(timeSeconds)}
          </span>
          <button
            onClick={onTogglePause}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isPaused ? 'Resume game' : 'Pause game'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onRestart}
            className="p-1 rounded-md text-slate-400 hover:text-rose-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Restart current puzzle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

