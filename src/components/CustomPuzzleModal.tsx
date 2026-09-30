import React, { useState } from 'react';
import { Check, Copy, Download, Upload, X } from 'lucide-react';
import { Grid, SymbolSetId } from '../types/sudoku';
import { getSymbol, parseKeyToValue } from '../utils/symbols';
import { GRID_SIZE, TOTAL_CELLS } from '../utils/sudokuEngine';

interface CustomPuzzleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGrid: Grid;
  symbolSet: SymbolSetId;
  onLoadCustomPuzzle: (gridValues: number[][]) => void;
}

export const CustomPuzzleModal: React.FC<CustomPuzzleModalProps> = ({
  isOpen,
  onClose,
  currentGrid,
  symbolSet,
  onLoadCustomPuzzle,
}) => {
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate string representation of current puzzle
  const exportPuzzleString = (): string => {
    let result = '';
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const val = currentGrid[r][c].value;
        if (val === 0) {
          result += '.';
        } else {
          result += getSymbol(val, symbolSet);
        }
      }
      result += '\n';
    }
    return result.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportPuzzleString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    setErrorMessage(null);
    const cleaned = inputText.replace(/[\r\n\s]/g, '');

    if (cleaned.length !== TOTAL_CELLS) {
      setErrorMessage(
        `Invalid puzzle length: found ${cleaned.length} characters, but exactly 256 are required for 16×16.`
      );
      return;
    }

    const gridValues: number[][] = Array.from({ length: GRID_SIZE }, () =>
      new Array(GRID_SIZE).fill(0)
    );

    for (let i = 0; i < TOTAL_CELLS; i++) {
      const char = cleaned[i];
      const r = Math.floor(i / GRID_SIZE);
      const c = i % GRID_SIZE;

      if (char === '.' || char === '0' || char === '-') {
        gridValues[r][c] = 0;
      } else {
        const val = parseKeyToValue(char, symbolSet);
        if (val === null) {
          setErrorMessage(
            `Unrecognized character '${char}' at index ${i + 1}. Please use valid symbols for the current notation.`
          );
          return;
        }
        gridValues[r][c] = val;
      }
    }

    onLoadCustomPuzzle(gridValues);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Upload className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Import & Export Puzzle</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs text-slate-300">
          {/* Export Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200 uppercase tracking-wider">
                Export Current Board
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={exportPuzzleString()}
              className="w-full p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-400 resize-none focus:outline-none select-all"
            />
          </div>

          {/* Import Section */}
          <div>
            <label className="block font-semibold text-slate-200 uppercase tracking-wider mb-2">
              Import 16×16 Puzzle String
            </label>
            <p className="text-slate-400 mb-2">
              Paste 256 characters (use dots <code className="font-mono text-indigo-300">.</code> or zeros <code className="font-mono text-indigo-300">0</code> for empty cells, separated by newlines or continuous):
            </p>
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste 256 characters (16 rows of 16 characters)..."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl font-mono text-[11px] text-white resize-none focus:outline-none"
            />
            {errorMessage && (
              <p className="text-rose-400 mt-2 font-medium">{errorMessage}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!inputText.trim()}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors cursor-pointer"
          >
            Load & Play
          </button>
        </div>
      </div>
    </div>
  );
};
