/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CustomPuzzleModal } from './components/CustomPuzzleModal';
import { GameHUD } from './components/GameHUD';
import { Header } from './components/Header';
import { HintToast } from './components/HintToast';
import { Keypad } from './components/Keypad';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { SudokuGrid } from './components/SudokuGrid';
import { VictoryModal } from './components/VictoryModal';
import {
  Difficulty,
  GameSettings,
  GameStats,
  Grid,
  HintDetails,
  HistoryItem,
} from './types/sudoku';
import { sound } from './utils/audio';
import { backgroundMusic } from './utils/backgroundMusic';
import {
  loadSavedGame,
  loadSettings,
  loadStats,
  recordGameStart,
  recordGameWin,
  saveCurrentGame,
  saveSettings,
} from './utils/storage';
import {
  computeAllCandidateNotes,
  findSmartHint,
  generatePuzzle,
  getBoxIndex,
  getPlacedCounts,
  GRID_SIZE,
  isGridSolved,
  TOTAL_CELLS,
  validateBoardConflicts,
} from './utils/sudokuEngine';
import { parseKeyToValue } from './utils/symbols';

export default function App() {
  // Persistence state
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [stats, setStats] = useState<GameStats>(loadStats);

  // Sound sync
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Core Game State
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [grid, setGrid] = useState<Grid>(() => {
    const saved = loadSavedGame();
    if (saved) return saved.grid;
    return generatePuzzle('medium').grid;
  });
  const [solution, setSolution] = useState<number[][]>(() => {
    const saved = loadSavedGame();
    if (saved) return saved.solution;
    return generateBasePuzzleForInit();
  });

  const [timeSeconds, setTimeSeconds] = useState<number>(() => {
    const saved = loadSavedGame();
    return saved ? saved.timeSeconds : 0;
  });
  const [mistakes, setMistakes] = useState<number>(() => {
    const saved = loadSavedGame();
    return saved ? saved.mistakes : 0;
  });
  const [hintsUsed, setHintsUsed] = useState<number>(() => {
    const saved = loadSavedGame();
    return saved ? saved.hintsUsed : 0;
  });

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Background Music sync
  useEffect(() => {
    if (settings.musicEnabled) {
      if (isPaused) {
        backgroundMusic.pause();
      } else {
        backgroundMusic.start(settings.musicVolume);
        backgroundMusic.setVolume(settings.musicVolume);
      }
    } else {
      backgroundMusic.stop();
    }
  }, [settings.musicEnabled, settings.musicVolume, isPaused]);

  useEffect(() => {
    return () => {
      backgroundMusic.stop();
    };
  }, []);

  // Interaction State
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [notesMode, setNotesMode] = useState<boolean>(false);
  const [numberFirstMode, setNumberFirstMode] = useState<boolean>(false);
  const [activeHint, setActiveHint] = useState<HintDetails | null>(null);

  // History for Undo/Redo
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Modals
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  function generateBasePuzzleForInit(): number[][] {
    const p = generatePuzzle('medium');
    return p.solution;
  }

  // Timer loop
  useEffect(() => {
    if (isPaused || isVictory) return;

    const timer = setInterval(() => {
      setTimeSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isVictory]);

  // Auto-save game state
  useEffect(() => {
    if (isVictory) {
      saveCurrentGame(null);
    } else {
      saveCurrentGame({
        grid,
        solution,
        difficulty,
        timeSeconds,
        hintsUsed,
        mistakes,
      });
    }
  }, [grid, solution, difficulty, timeSeconds, hintsUsed, mistakes, isVictory]);

  // Derived counts
  const placedCounts = useMemo(() => getPlacedCounts(grid), [grid]);

  const filledCount = useMemo(() => {
    let count = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].value > 0) count++;
      }
    }
    return count;
  }, [grid]);

  const conflictingCells = useMemo(() => {
    if (!settings.highlightErrors) return new Set<string>();
    const list = validateBoardConflicts(grid);
    return new Set(list.map((c) => `${c.row},${c.col}`));
  }, [grid, settings.highlightErrors]);

  // Start new game
  const startNewGame = useCallback(
    (diff: Difficulty = difficulty) => {
      const generated = generatePuzzle(diff);
      setGrid(generated.grid);
      setSolution(generated.solution);
      setDifficulty(diff);
      setTimeSeconds(0);
      setMistakes(0);
      setHintsUsed(0);
      setIsPaused(false);
      setIsVictory(false);
      setIsNewRecord(false);
      setSelectedCell(null);
      setSelectedNumber(null);
      setActiveHint(null);
      setHistory([]);
      setHistoryIndex(-1);
      setIsVictoryModalOpen(false);

      recordGameStart(diff);
      setStats(loadStats());
    },
    [difficulty]
  );

  // Restart current puzzle
  const handleRestart = useCallback(() => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => ({
          ...cell,
          value: cell.isGiven ? cell.value : 0,
          notes: [],
        }))
      )
    );
    setTimeSeconds(0);
    setMistakes(0);
    setHintsUsed(0);
    setSelectedCell(null);
    setActiveHint(null);
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveSettings(updated);
  };

  // Toggle Background Music
  const handleToggleMusic = useCallback(() => {
    setSettings((prev) => {
      const nextMusicState = !prev.musicEnabled;
      const updated = { ...prev, musicEnabled: nextMusicState };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Perform a cell modification (Value placement or Note toggle)
  const applyCellChange = useCallback(
    (row: number, col: number, num: number, asNote: boolean) => {
      const currentCell = grid[row][col];
      if (currentCell.isGiven) return;

      const prevValue = currentCell.value;
      const prevNotes = [...currentCell.notes];

      if (asNote) {
        if (currentCell.value > 0) return; // Cannot add notes to filled cell

        const newNotes = prevNotes.includes(num)
          ? prevNotes.filter((n) => n !== num)
          : [...prevNotes, num].sort((a, b) => a - b);

        sound.playToggleNote();

        const newGrid = grid.map((r, ri) =>
          r.map((c, ci) => (ri === row && ci === col ? { ...c, notes: newNotes } : c))
        );

        const historyItem: HistoryItem = {
          cells: [{ row, col, prevValue, newValue: 0, prevNotes, newNotes }],
          description: `Toggle note ${num}`,
        };

        const nextHistory = history.slice(0, historyIndex + 1);
        nextHistory.push(historyItem);
        setHistory(nextHistory);
        setHistoryIndex(nextHistory.length - 1);
        setGrid(newGrid);
        return;
      }

      // Value insertion
      const isClearing = currentCell.value === num;
      const newValue = isClearing ? 0 : num;

      if (newValue === 0) {
        sound.playErase();
      } else {
        // Check if value is erroneous compared to solution
        if (newValue !== currentCell.solution) {
          sound.playError();
          setMistakes((prev) => prev + 1);
        } else {
          sound.playPlaceNumber();
        }
      }

      // History tracking
      const historyCells: HistoryItem['cells'] = [
        {
          row,
          col,
          prevValue,
          newValue,
          prevNotes,
          newNotes: [],
        },
      ];

      let newGrid = grid.map((r, ri) =>
        r.map((c, ci) =>
          ri === row && ci === col
            ? { ...c, value: newValue, notes: [] }
            : c
        )
      );

      // Auto-remove candidate notes from peers if enabled and setting a valid value
      if (newValue > 0 && settings.autoRemoveNotes) {
        const box = getBoxIndex(row, col);
        newGrid = newGrid.map((r, ri) =>
          r.map((c, ci) => {
            if (
              (ri === row || ci === col || getBoxIndex(ri, ci) === box) &&
              !(ri === row && ci === col) &&
              c.notes.includes(newValue)
            ) {
              const updatedNotes = c.notes.filter((n) => n !== newValue);
              historyCells.push({
                row: ri,
                col: ci,
                prevValue: c.value,
                newValue: c.value,
                prevNotes: c.notes,
                newNotes: updatedNotes,
              });
              return { ...c, notes: updatedNotes };
            }
            return c;
          })
        );
      }

      const historyItem: HistoryItem = {
        cells: historyCells,
        description: newValue > 0 ? `Set (${row + 1},${col + 1}) to ${num}` : `Cleared (${row + 1},${col + 1})`,
      };

      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(historyItem);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
      setGrid(newGrid);

      // Check if solved
      if (newValue > 0 && isGridSolved(newGrid)) {
        sound.playVictory();
        setIsVictory(true);
        const updatedStats = recordGameWin(difficulty, timeSeconds);
        setStats(updatedStats);
        setIsNewRecord(
          updatedStats.bestTime[difficulty] === timeSeconds
        );
        setIsVictoryModalOpen(true);
      }
    },
    [grid, history, historyIndex, settings.autoRemoveNotes, difficulty, timeSeconds]
  );

  // Erase current cell
  const handleErase = useCallback(() => {
    if (!selectedCell) return;
    const cell = grid[selectedCell.row][selectedCell.col];
    if (cell.isGiven) return;

    if (cell.value === 0 && cell.notes.length === 0) return;

    sound.playErase();

    const historyItem: HistoryItem = {
      cells: [
        {
          row: selectedCell.row,
          col: selectedCell.col,
          prevValue: cell.value,
          newValue: 0,
          prevNotes: [...cell.notes],
          newNotes: [],
        },
      ],
      description: 'Erase',
    };

    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(historyItem);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);

    setGrid((prev) =>
      prev.map((r, ri) =>
        r.map((c, ci) =>
          ri === selectedCell.row && ci === selectedCell.col
            ? { ...c, value: 0, notes: [] }
            : c
        )
      )
    );
  }, [selectedCell, grid, history, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex < 0) return;

    const step = history[historyIndex];
    setGrid((prev) => {
      const nextGrid = prev.map((row) => row.map((cell) => ({ ...cell })));
      for (const item of step.cells) {
        nextGrid[item.row][item.col].value = item.prevValue;
        nextGrid[item.row][item.col].notes = [...item.prevNotes];
      }
      return nextGrid;
    });

    setHistoryIndex((prev) => prev - 1);
    sound.playErase();
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;

    const nextIndex = historyIndex + 1;
    const step = history[nextIndex];
    setGrid((prev) => {
      const nextGrid = prev.map((row) => row.map((cell) => ({ ...cell })));
      for (const item of step.cells) {
        nextGrid[item.row][item.col].value = item.newValue;
        nextGrid[item.row][item.col].notes = [...item.newNotes];
      }
      return nextGrid;
    });

    setHistoryIndex(nextIndex);
    sound.playPlaceNumber();
  }, [history, historyIndex]);

  // Select a cell on grid
  const handleSelectCell = (row: number, col: number) => {
    setSelectedCell({ row, col });

    // If Number First mode is active and a number is currently selected, apply it immediately!
    if (numberFirstMode && selectedNumber !== null) {
      applyCellChange(row, col, selectedNumber, notesMode);
    }
  };

  // Select number from Keypad
  const handleSelectNumber = (num: number) => {
    setSelectedNumber(num);

    // If Cell First mode and a cell is selected, immediately apply number!
    if (!numberFirstMode && selectedCell) {
      applyCellChange(selectedCell.row, selectedCell.col, num, notesMode);
    }
  };

  // Smart Hint Request
  const handleHintRequest = () => {
    const hint = findSmartHint(grid);
    if (!hint) return;

    sound.playHint();
    setHintsUsed((prev) => prev + 1);
    setActiveHint(hint);
    setSelectedCell({ row: hint.row, col: hint.col });
  };

  // Apply Smart Hint
  const handleApplyHint = () => {
    if (!activeHint) return;
    applyCellChange(activeHint.row, activeHint.col, activeHint.value, false);
    setActiveHint(null);
  };

  // Auto-fill all candidate notes
  const handleAutoNotes = () => {
    const notedGrid = computeAllCandidateNotes(grid);
    setGrid(notedGrid);
    sound.playHint();
  };

  // Clear all notes
  const handleClearAllNotes = () => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => ({
          ...cell,
          notes: [],
        }))
      )
    );
    sound.playErase();
  };

  // Custom puzzle loaded
  const handleLoadCustomPuzzle = (gridValues: number[][]) => {
    const customGrid: Grid = Array.from({ length: GRID_SIZE }, (_, r) =>
      Array.from({ length: GRID_SIZE }, (_, c) => {
        const val = gridValues[r][c];
        return {
          row: r,
          col: c,
          value: val,
          solution: val, // We will also accept it as valid template
          isGiven: val > 0,
          notes: [],
        };
      })
    );

    setGrid(customGrid);
    setSolution(gridValues);
    setTimeSeconds(0);
    setMistakes(0);
    setHintsUsed(0);
    setSelectedCell(null);
    setHistory([]);
    setHistoryIndex(-1);
  };

  // Global Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside textarea/input or if modal is open
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isVictoryModalOpen ||
        isRulesModalOpen ||
        isStatsModalOpen ||
        isSettingsModalOpen ||
        isCustomModalOpen
      ) {
        return;
      }

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Navigation with Arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setSelectedCell((prev) => {
          if (!prev) return { row: 0, col: 0 };
          let { row, col } = prev;
          if (e.key === 'ArrowUp') row = (row - 1 + GRID_SIZE) % GRID_SIZE;
          if (e.key === 'ArrowDown') row = (row + 1) % GRID_SIZE;
          if (e.key === 'ArrowLeft') col = (col - 1 + GRID_SIZE) % GRID_SIZE;
          if (e.key === 'ArrowRight') col = (col + 1) % GRID_SIZE;
          return { row, col };
        });
        return;
      }

      // Notes toggle (N key)
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setNotesMode((prev) => !prev);
        return;
      }

      // Erase (Backspace or Delete)
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleErase();
        return;
      }

      // Parse alphanumeric key
      const val = parseKeyToValue(e.key, settings.symbolSet);
      if (val !== null) {
        e.preventDefault();
        setSelectedNumber(val);
        if (selectedCell) {
          applyCellChange(selectedCell.row, selectedCell.col, val, notesMode);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedCell,
    notesMode,
    settings.symbolSet,
    applyCellChange,
    handleErase,
    handleUndo,
    handleRedo,
    isVictoryModalOpen,
    isRulesModalOpen,
    isStatsModalOpen,
    isSettingsModalOpen,
    isCustomModalOpen,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract (3 zones) */}
      <Header
        difficulty={difficulty}
        onSelectDifficulty={(d) => startNewGame(d)}
        onNewGame={() => startNewGame(difficulty)}
        onOpenRules={() => setIsRulesModalOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenCustom={() => setIsCustomModalOpen(true)}
        musicEnabled={settings.musicEnabled}
        onToggleMusic={handleToggleMusic}
      />

      {/* Main Arena Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
        {/* HUD Bar */}
        <GameHUD
          difficulty={difficulty}
          mistakes={mistakes}
          timeSeconds={timeSeconds}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused((prev) => !prev)}
          onRestart={handleRestart}
          filledCount={filledCount}
          totalCells={TOTAL_CELLS}
          musicEnabled={settings.musicEnabled}
          onToggleMusic={handleToggleMusic}
        />

        {/* Playfield Area: Grid + Keypad Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sudoku Grid Area */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
            <div className="relative w-full">
              {/* Pause Overlay */}
              {isPaused && (
                <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 border border-slate-800 text-center animate-in fade-in duration-150">
                  <h3 className="text-xl font-bold text-white mb-2">Game Paused</h3>
                  <p className="text-sm text-slate-400 mb-4 max-w-xs">
                    The timer is stopped and puzzle numbers are hidden.
                  </p>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors cursor-pointer shadow-lg shadow-indigo-600/30 text-xs"
                  >
                    Resume Game
                  </button>
                </div>
              )}

              <SudokuGrid
                grid={grid}
                selectedCell={selectedCell}
                onSelectCell={handleSelectCell}
                symbolSet={settings.symbolSet}
                highlightMatchingNumbers={settings.highlightMatchingNumbers}
                highlightPeers={settings.highlightPeers}
                highlightErrors={settings.highlightErrors}
                blockShading={settings.blockShading}
                conflictingCells={conflictingCells}
                hintCell={activeHint ? { row: activeHint.row, col: activeHint.col } : null}
              />
            </div>

            {/* Hint Notification Bar */}
            {activeHint && (
              <div className="w-full mt-3">
                <HintToast
                  hint={activeHint}
                  symbolSet={settings.symbolSet}
                  onApplyHint={handleApplyHint}
                  onDismiss={() => setActiveHint(null)}
                />
              </div>
            )}
          </div>

          {/* Keypad & Controls Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
            <Keypad
              symbolSet={settings.symbolSet}
              notesMode={notesMode}
              onToggleNotesMode={() => setNotesMode((prev) => !prev)}
              selectedNumber={selectedNumber}
              onSelectNumber={handleSelectNumber}
              placedCounts={placedCounts}
              onErase={handleErase}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex >= 0}
              canRedo={historyIndex < history.length - 1}
              onHint={handleHintRequest}
              onAutoNotes={handleAutoNotes}
              onClearAllNotes={handleClearAllNotes}
              numberFirstMode={numberFirstMode}
              onToggleNumberFirstMode={() => setNumberFirstMode((prev) => !prev)}
            />

            {/* Quick Keyboard Reference Callout */}
            <div className="hidden sm:block p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs text-slate-400">
              <div className="font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Keyboard Controls</span>
                <span className="text-[10px] text-indigo-400 font-mono">16x16 Enabled</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Use <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-200">1-9</kbd> and{' '}
                <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-200">A-G</kbd> to enter
                symbols, <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Arrows</kbd> to move,{' '}
                <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-200">N</kbd> for notes, and{' '}
                <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-200">Backspace</kbd> to erase.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <VictoryModal
        isOpen={isVictoryModalOpen}
        onClose={() => setIsVictoryModalOpen(false)}
        onPlayAgain={(d) => startNewGame(d)}
        difficulty={difficulty}
        timeSeconds={timeSeconds}
        hintsUsed={hintsUsed}
        mistakes={mistakes}
        isBestTime={isNewRecord}
      />

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        stats={stats}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <CustomPuzzleModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        currentGrid={grid}
        symbolSet={settings.symbolSet}
        onLoadCustomPuzzle={handleLoadCustomPuzzle}
      />
    </div>
  );
}
