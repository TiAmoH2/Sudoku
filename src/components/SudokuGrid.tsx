import React from 'react';
import { CellData, Grid, SymbolSetId } from '../types/sudoku';
import { getSymbol } from '../utils/symbols';
import { BOX_SIZE, getBoxIndex, GRID_SIZE } from '../utils/sudokuEngine';

interface SudokuGridProps {
  grid: Grid;
  selectedCell: { row: number; col: number } | null;
  onSelectCell: (row: number, col: number) => void;
  symbolSet: SymbolSetId;
  highlightMatchingNumbers: boolean;
  highlightPeers: boolean;
  highlightErrors: boolean;
  blockShading: boolean;
  conflictingCells: Set<string>;
  hintCell: { row: number; col: number } | null;
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({
  grid,
  selectedCell,
  onSelectCell,
  symbolSet,
  highlightMatchingNumbers,
  highlightPeers,
  highlightErrors,
  blockShading,
  conflictingCells,
  hintCell,
}) => {
  const selectedValue =
    selectedCell && grid[selectedCell.row]?.[selectedCell.col]?.value
      ? grid[selectedCell.row][selectedCell.col].value
      : null;

  const selectedBox = selectedCell ? getBoxIndex(selectedCell.row, selectedCell.col) : null;

  return (
    <div className="relative select-none w-full max-w-[620px] aspect-square mx-auto p-1 sm:p-2 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl shadow-indigo-950/40">
      <div className="w-full h-full grid grid-cols-16 grid-rows-16 bg-slate-950 rounded-xl overflow-hidden border border-slate-700">
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = selectedCell?.row === r && selectedCell?.col === c;
            const isPeer =
              highlightPeers &&
              selectedCell &&
              (selectedCell.row === r ||
                selectedCell.col === c ||
                (selectedBox !== null && getBoxIndex(r, c) === selectedBox)) &&
              !isSelected;

            const isMatchingValue =
              highlightMatchingNumbers &&
              selectedValue &&
              cell.value === selectedValue &&
              cell.value > 0 &&
              !isSelected;

            const isConflict =
              highlightErrors && conflictingCells.has(`${r},${c}`);

            const isHint = hintCell?.row === r && hintCell?.col === c;

            // 4x4 block shading check
            const blockRow = Math.floor(r / BOX_SIZE);
            const blockCol = Math.floor(c / BOX_SIZE);
            const isAlternateBlock = blockShading && (blockRow + blockCol) % 2 === 1;

            // Thick block divider boundaries
            const isBlockBottom = (r + 1) % BOX_SIZE === 0 && r !== GRID_SIZE - 1;
            const isBlockRight = (c + 1) % BOX_SIZE === 0 && c !== GRID_SIZE - 1;

            // Background color computation
            let bgClass = isAlternateBlock ? 'bg-slate-900/50' : 'bg-slate-950';

            if (isPeer) {
              bgClass = 'bg-slate-800/40';
            }
            if (isMatchingValue) {
              bgClass = 'bg-indigo-500/25';
            }
            if (isSelected) {
              bgClass = 'bg-indigo-600/35 ring-2 ring-indigo-400 ring-inset z-20';
            }
            if (isConflict) {
              bgClass = 'bg-rose-950/80 ring-1 ring-rose-500 ring-inset text-rose-200';
            }
            if (isHint) {
              bgClass = 'bg-amber-500/30 ring-2 ring-amber-400 ring-inset animate-pulse z-20';
            }

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => onSelectCell(r, c)}
                className={`relative flex items-center justify-center border-slate-800/80 transition-colors duration-100 cursor-pointer focus:outline-none ${bgClass} ${
                  isBlockBottom
                    ? 'border-b-2 sm:border-b-[3px] border-b-indigo-400/50'
                    : 'border-b border-b-slate-800/60'
                } ${
                  isBlockRight
                    ? 'border-r-2 sm:border-r-[3px] border-r-indigo-400/50'
                    : 'border-r border-r-slate-800/60'
                }`}
                aria-label={`Row ${r + 1}, Column ${c + 1}, Value ${
                  cell.value > 0 ? getSymbol(cell.value, symbolSet) : 'Empty'
                }`}
              >
                {cell.value > 0 ? (
                  <span
                    className={`font-mono tabular-nums leading-none select-none ${
                      cell.isGiven
                        ? 'font-bold text-slate-100'
                        : isConflict
                        ? 'font-bold text-rose-300'
                        : 'font-semibold text-indigo-300'
                    } text-xs sm:text-sm md:text-base`}
                  >
                    {getSymbol(cell.value, symbolSet)}
                  </span>
                ) : cell.notes && cell.notes.length > 0 ? (
                  /* 4x4 Mini Note Grid */
                  <div className="w-full h-full p-0.5 grid grid-cols-4 grid-rows-4 items-center justify-items-center select-none pointer-events-none">
                    {Array.from({ length: 16 }, (_, idx) => {
                      const noteNum = idx + 1;
                      const hasNote = cell.notes.includes(noteNum);
                      return (
                        <span
                          key={noteNum}
                          className={`font-mono text-[7px] sm:text-[8px] md:text-[9px] leading-none ${
                            hasNote
                              ? isMatchingValue
                                ? 'text-indigo-200 font-bold'
                                : 'text-slate-400'
                              : 'invisible'
                          }`}
                        >
                          {getSymbol(noteNum, symbolSet)}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
