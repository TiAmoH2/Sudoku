import React from 'react';
import { BookOpen, Check, Keyboard, Sparkles, X } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">How to Play 16×16 Super Sudoku</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Section 1: The Core Objective */}
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              The Core Objective
            </h3>
            <p className="text-slate-300 mb-3">
              16×16 Super Sudoku (often called <em>Hexadoku</em> or <em>Monster Sudoku</em>) is an expanded variation of traditional 9×9 Sudoku with <strong>256 cells</strong>.
            </p>
            <ul className="space-y-2 pl-2">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Each of the <strong>16 rows</strong> must contain all 16 symbols without repetition.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Each of the <strong>16 columns</strong> must contain all 16 symbols without repetition.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Each of the sixteen <strong>4×4 blocks</strong> (subgrids delimited by bold lines) must contain all 16 symbols.</span>
              </li>
            </ul>
          </div>

          {/* Section 2: Symbol Sets */}
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              Standard Symbol Sets
            </h3>
            <p className="text-slate-300 mb-2">
              You can switch symbol sets at any time in <strong>Settings</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="font-semibold text-white mb-1">1-9 & A-G (Default)</div>
                <div className="font-mono text-indigo-300">1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, F, G</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="font-semibold text-white mb-1">Hexadecimal (0-F)</div>
                <div className="font-mono text-indigo-300">0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, F</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="font-semibold text-white mb-1">1 to 16 Numbers</div>
                <div className="font-mono text-indigo-300">1, 2, 3, ..., 14, 15, 16</div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="font-semibold text-white mb-1">Letters (A to P)</div>
                <div className="font-mono text-indigo-300">A, B, C, D, ..., M, N, O, P</div>
              </div>
            </div>
          </div>

          {/* Section 3: Keyboard Shortcuts */}
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-indigo-400" />
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">Insert Symbol</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">1-9, A-G</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">Navigate Cells</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Arrows</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">Toggle Notes</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">N</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">Erase Cell</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Backspace / Del</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">Undo</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Ctrl + Z</kbd>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                <span className="text-slate-400">Redo</span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Ctrl + Y</kbd>
              </div>
            </div>
          </div>

          {/* Section 4: Solving Tips */}
          <div>
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Pro Tips for 16×16 Puzzles
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li>
                <strong>Leverage Candidate Notes:</strong> Because each block has 16 cells, keeping track of candidates mentally is tough. Use the <em>Auto Notes</em> button or pencil marks to reveal candidate subsets.
              </li>
              <li>
                <strong>Look for Nearly Full 4×4 Blocks:</strong> Blocks with 12+ filled cells have very few missing items. Check which symbols are absent and cross-reference with intercepting rows and columns.
              </li>
              <li>
                <strong>Smart Hints:</strong> If you get stuck, click the <em>Hint</em> button. It analyzes the board for Naked Singles (cells with only one legal placement) and Hidden Singles.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors cursor-pointer text-xs"
          >
            Got it, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
