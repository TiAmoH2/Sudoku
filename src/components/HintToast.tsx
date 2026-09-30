import React from 'react';
import { Check, Lightbulb, X } from 'lucide-react';
import { HintDetails, SymbolSetId } from '../types/sudoku';
import { getSymbol } from '../utils/symbols';

interface HintToastProps {
  hint: HintDetails | null;
  symbolSet: SymbolSetId;
  onApplyHint: () => void;
  onDismiss: () => void;
}

export const HintToast: React.FC<HintToastProps> = ({
  hint,
  symbolSet,
  onApplyHint,
  onDismiss,
}) => {
  if (!hint) return null;

  const symbolChar = getSymbol(hint.value, symbolSet);

  return (
    <div className="w-full max-w-[620px] mx-auto p-3.5 bg-slate-900 border border-amber-500/40 rounded-xl shadow-xl shadow-amber-950/20 text-xs animate-in slide-in-from-bottom-2 duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-white flex items-center gap-2">
              <span>{hint.title}</span>
              <span className="font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded text-[11px]">
                Value: {symbolChar}
              </span>
            </div>
            <p className="text-slate-300 mt-1 leading-relaxed">
              {hint.message}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-800">
        <button
          onClick={onDismiss}
          className="px-3 py-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          I'll solve it
        </button>
        <button
          onClick={onApplyHint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-semibold rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Apply {symbolChar} to Row {hint.row + 1}, Col {hint.col + 1}</span>
        </button>
      </div>
    </div>
  );
};
