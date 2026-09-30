import React from 'react';
import {
  Check,
  Eraser,
  Lightbulb,
  Pencil,
  Redo2,
  Sparkles,
  Undo2,
} from 'lucide-react';
import { SymbolSetId } from '../types/sudoku';
import { Language, TRANSLATIONS } from '../utils/i18n';
import { getSymbol } from '../utils/symbols';

interface KeypadProps {
  symbolSet: SymbolSetId;
  notesMode: boolean;
  onToggleNotesMode: () => void;
  selectedNumber: number | null;
  onSelectNumber: (num: number) => void;
  placedCounts: Record<number, number>;
  onErase: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onHint: () => void;
  onAutoNotes: () => void;
  onClearAllNotes: () => void;
  numberFirstMode: boolean;
  onToggleNumberFirstMode: () => void;
  language: Language;
}

export const Keypad: React.FC<KeypadProps> = ({
  symbolSet,
  notesMode,
  onToggleNotesMode,
  selectedNumber,
  onSelectNumber,
  placedCounts,
  onErase,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onHint,
  onAutoNotes,
  onClearAllNotes,
  numberFirstMode,
  onToggleNumberFirstMode,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Primary Tool Bar */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
            canUndo
              ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer active:scale-95'
              : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
          }`}
          title={`${t.undo} (Ctrl+Z)`}
        >
          <Undo2 className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] font-medium">{t.undo}</span>
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
            canRedo
              ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer active:scale-95'
              : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
          }`}
          title={`${t.redo} (Ctrl+Y)`}
        >
          <Redo2 className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] font-medium">{t.redo}</span>
        </button>

        {/* Erase */}
        <button
          onClick={onErase}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white transition-all cursor-pointer active:scale-95"
          title={`${t.erase} (Backspace / Del)`}
        >
          <Eraser className="w-4 h-4 mb-0.5 text-rose-400" />
          <span className="text-[11px] font-medium">{t.erase}</span>
        </button>

        {/* Notes Mode Toggle */}
        <button
          onClick={onToggleNotesMode}
          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer active:scale-95 ${
            notesMode
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white'
          }`}
          title={`${t.notes} (N)`}
        >
          <Pencil className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] font-medium">
            {notesMode ? t.notesOn : t.notes}
          </span>
        </button>

        {/* Smart Hint */}
        <button
          onClick={onHint}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer active:scale-95"
          title={t.hint}
        >
          <Lightbulb className="w-4 h-4 mb-0.5 text-amber-400" />
          <span className="text-[11px] font-medium">{t.hint}</span>
        </button>

        {/* Auto Notes */}
        <button
          onClick={onAutoNotes}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer active:scale-95"
          title={t.autoNotes}
        >
          <Sparkles className="w-4 h-4 mb-0.5 text-cyan-400" />
          <span className="text-[11px] font-medium">{t.autoNotes}</span>
        </button>
      </div>

      {/* Input Strategy Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{t.entryMode}:</span>
          <button
            onClick={onToggleNumberFirstMode}
            className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
              numberFirstMode
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}
          >
            {numberFirstMode ? t.numberFirst : t.cellFirst}
          </button>
        </div>

        <button
          onClick={onClearAllNotes}
          className="text-slate-400 hover:text-slate-200 transition-colors text-[11px] underline underline-offset-2 cursor-pointer"
        >
          {t.clearAllNotes}
        </button>
      </div>

      {/* 16 Symbol Keypad Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-4 gap-1.5 sm:gap-2 p-3 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl">
        {Array.from({ length: 16 }, (_, idx) => {
          const num = idx + 1;
          const count = placedCounts[num] || 0;
          const isCompleted = count >= 16;
          const isSelected = selectedNumber === num;

          return (
            <button
              key={num}
              type="button"
              onClick={() => onSelectNumber(num)}
              className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl font-mono transition-all duration-150 cursor-pointer select-none border ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/40 scale-102 ring-2 ring-indigo-400/50'
                  : isCompleted
                  ? 'bg-slate-950/80 border-slate-800/60 text-slate-500 hover:border-slate-700 opacity-60'
                  : 'bg-slate-800/90 border-slate-700/80 text-slate-100 hover:bg-slate-700 hover:border-slate-600 active:scale-95'
              }`}
            >
              <span className="text-base sm:text-lg font-bold leading-tight">
                {getSymbol(num, symbolSet)}
              </span>
              <div className="flex items-center gap-0.5 mt-0.5">
                {isCompleted ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-sans tabular-nums">
                    {16 - count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
