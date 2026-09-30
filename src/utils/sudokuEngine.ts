import { CellData, Difficulty, Grid, HintDetails } from '../types/sudoku';

export const GRID_SIZE = 16;
export const BOX_SIZE = 4;
export const TOTAL_CELLS = 256;

/**
 * Returns box index (0-15) from row and col.
 */
export function getBoxIndex(r: number, c: number): number {
  return Math.floor(r / BOX_SIZE) * BOX_SIZE + Math.floor(c / BOX_SIZE);
}

/**
 * Generates a valid base canonical 16x16 Sudoku solution.
 */
export function generateBaseSolution(): number[][] {
  const grid: number[][] = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(0));
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = (((r * BOX_SIZE) + Math.floor(r / BOX_SIZE) + c) % GRID_SIZE) + 1;
    }
  }
  return grid;
}

/**
 * Fisher-Yates array shuffle in place.
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Applies valid isomorphic symmetry transformations to generate an entirely new valid 16x16 board.
 */
export function transformSolution(base: number[][]): number[][] {
  let grid = base.map((row) => [...row]);

  // 1. Symbol Permutation: map each value 1..16 to a shuffled value
  const symbolMap = shuffle(Array.from({ length: GRID_SIZE }, (_, i) => i + 1));
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      grid[r][c] = symbolMap[grid[r][c] - 1];
    }
  }

  // 2. Permute row bands (4 bands of 4 rows each)
  const bandOrder = shuffle([0, 1, 2, 3]);
  const newRowGrid: number[][] = [];
  for (const band of bandOrder) {
    for (let i = 0; i < BOX_SIZE; i++) {
      newRowGrid.push(grid[band * BOX_SIZE + i]);
    }
  }
  grid = newRowGrid;

  // 3. Permute stack bands (4 stacks of 4 columns each)
  const stackOrder = shuffle([0, 1, 2, 3]);
  const newColGrid: number[][] = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(0));
  for (let r = 0; r < GRID_SIZE; r++) {
    let targetC = 0;
    for (const stack of stackOrder) {
      for (let j = 0; j < BOX_SIZE; j++) {
        newColGrid[r][targetC] = grid[r][stack * BOX_SIZE + j];
        targetC++;
      }
    }
  }
  grid = newColGrid;

  // 4. Permute individual rows within each 4-row band
  for (let band = 0; band < BOX_SIZE; band++) {
    const rowIndices = shuffle([0, 1, 2, 3]);
    const bandRows = rowIndices.map((idx) => grid[band * BOX_SIZE + idx]);
    for (let i = 0; i < BOX_SIZE; i++) {
      grid[band * BOX_SIZE + i] = bandRows[i];
    }
  }

  // 5. Permute individual columns within each 4-column stack
  for (let stack = 0; stack < BOX_SIZE; stack++) {
    const colIndices = shuffle([0, 1, 2, 3]);
    const stackCols: number[][] = [];
    for (let i = 0; i < BOX_SIZE; i++) {
      const srcCol = stack * BOX_SIZE + colIndices[i];
      stackCols.push(grid.map((row) => row[srcCol]));
    }
    for (let i = 0; i < BOX_SIZE; i++) {
      const targetCol = stack * BOX_SIZE + i;
      for (let r = 0; r < GRID_SIZE; r++) {
        grid[r][targetCol] = stackCols[i][r];
      }
    }
  }

  // 6. Optional transpose (swap rows & cols)
  if (Math.random() > 0.5) {
    const transposed: number[][] = Array.from({ length: GRID_SIZE }, () => new Array(GRID_SIZE).fill(0));
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        transposed[c][r] = grid[r][c];
      }
    }
    grid = transposed;
  }

  return grid;
}

/**
 * Creates a playable puzzle grid by removing cells according to difficulty,
 * with rotational symmetry and guaranteed clue distributions.
 */
export function generatePuzzle(difficulty: Difficulty): { grid: Grid; solution: number[][] } {
  const base = generateBaseSolution();
  const solution = transformSolution(base);

  // Clue target based on difficulty:
  // Total cells = 256.
  // Easy: ~156 clues (~60%)
  // Medium: ~132 clues (~51%)
  // Hard: ~110 clues (~43%)
  // Expert: ~90 clues (~35%)
  const clueTarget = {
    easy: 156,
    medium: 132,
    hard: 110,
    expert: 90,
  }[difficulty];

  const cellsToRemove = TOTAL_CELLS - clueTarget;

  // Symmetrical cell pairs list for rotational symmetry (180 deg)
  const cellPairs: [number, number, number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const oppR = GRID_SIZE - 1 - r;
      const oppC = GRID_SIZE - 1 - c;
      if (r < oppR || (r === oppR && c <= oppC)) {
        cellPairs.push([r, c, oppR, oppC]);
      }
    }
  }

  shuffle(cellPairs);

  const initialGrid: Grid = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => ({
      row: r,
      col: c,
      value: solution[r][c],
      solution: solution[r][c],
      isGiven: true,
      notes: [],
    }))
  );

  let removed = 0;
  for (const [r1, c1, r2, c2] of cellPairs) {
    if (removed >= cellsToRemove) break;

    const count = r1 === r2 && c1 === c2 ? 1 : 2;
    if (removed + count <= cellsToRemove) {
      initialGrid[r1][c1].value = 0;
      initialGrid[r1][c1].isGiven = false;
      initialGrid[r2][c2].value = 0;
      initialGrid[r2][c2].isGiven = false;
      removed += count;
    }
  }

  return { grid: initialGrid, solution };
}

/**
 * Bitmask-based fast candidate calculation.
 * Bit i (1..16) set means value i is available.
 */
export function getAvailableCandidates(grid: Grid, row: number, col: number): number[] {
  if (grid[row][col].value !== 0) return [];

  let usedMask = 0;

  // Row and Column
  for (let i = 0; i < GRID_SIZE; i++) {
    const rowVal = grid[row][i].value;
    if (rowVal > 0) usedMask |= 1 << rowVal;

    const colVal = grid[i][col].value;
    if (colVal > 0) usedMask |= 1 << colVal;
  }

  // Box
  const startR = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startC = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = 0; r < BOX_SIZE; r++) {
    for (let c = 0; c < BOX_SIZE; c++) {
      const val = grid[startR + r][startC + c].value;
      if (val > 0) usedMask |= 1 << val;
    }
  }

  const candidates: number[] = [];
  for (let v = 1; v <= GRID_SIZE; v++) {
    if ((usedMask & (1 << v)) === 0) {
      candidates.push(v);
    }
  }

  return candidates;
}

/**
 * Automatically computes candidate notes for all empty cells on the board.
 */
export function computeAllCandidateNotes(grid: Grid): Grid {
  return grid.map((row) =>
    row.map((cell) => {
      if (cell.value !== 0) {
        return { ...cell, notes: [] };
      }
      return {
        ...cell,
        notes: getAvailableCandidates(grid, cell.row, cell.col),
      };
    })
  );
}

/**
 * Checks for conflicts on the board (duplicate in row, column, or box).
 * Returns array of conflicting cell coordinates.
 */
export function validateBoardConflicts(grid: Grid): { row: number; col: number }[] {
  const conflicts: Set<string> = new Set();

  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c].value;
      if (val > 0) {
        const list = seen.get(val) || [];
        list.push(c);
        seen.set(val, list);
      }
    }
    for (const cols of seen.values()) {
      if (cols.length > 1) {
        for (const c of cols) conflicts.add(`${r},${c}`);
      }
    }
  }

  // Check columns
  for (let c = 0; c < GRID_SIZE; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < GRID_SIZE; r++) {
      const val = grid[r][c].value;
      if (val > 0) {
        const list = seen.get(val) || [];
        list.push(r);
        seen.set(val, list);
      }
    }
    for (const rows of seen.values()) {
      if (rows.length > 1) {
        for (const r of rows) conflicts.add(`${r},${c}`);
      }
    }
  }

  // Check 4x4 boxes
  for (let br = 0; br < BOX_SIZE; br++) {
    for (let bc = 0; bc < BOX_SIZE; bc++) {
      const seen = new Map<number, [number, number][]>();
      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          const row = br * BOX_SIZE + r;
          const col = bc * BOX_SIZE + c;
          const val = grid[row][col].value;
          if (val > 0) {
            const list = seen.get(val) || [];
            list.push([row, col]);
            seen.set(val, list);
          }
        }
      }
      for (const coords of seen.values()) {
        if (coords.length > 1) {
          for (const [r, c] of coords) conflicts.add(`${r},${c}`);
        }
      }
    }
  }

  return Array.from(conflicts).map((key) => {
    const [r, c] = key.split(',').map(Number);
    return { row: r, col: c };
  });
}

/**
 * Finds intelligent hints:
 * 1. Naked single (only one candidate valid for cell)
 * 2. Hidden single in a row, col, or box
 * 3. Discrepancy / conflict with solution
 */
export function findSmartHint(grid: Grid): HintDetails | null {
  // 1. First check if user has made an error against solution
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = grid[r][c];
      if (cell.value > 0 && cell.value !== cell.solution) {
        return {
          type: 'error_check',
          title: 'Incorrect Cell Found',
          message: `The cell at Row ${r + 1}, Column ${c + 1} contains a value that does not match the puzzle solution.`,
          row: r,
          col: c,
          value: cell.solution,
        };
      }
    }
  }

  // 2. Check for Naked Single
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].value === 0) {
        const candidates = getAvailableCandidates(grid, r, c);
        if (candidates.length === 1) {
          return {
            type: 'naked_single',
            title: 'Naked Single Found',
            message: `Cell at Row ${r + 1}, Column ${c + 1} has only one legally valid candidate remaining.`,
            row: r,
            col: c,
            value: candidates[0],
            affectedUnit: 'cell',
          };
        }
      }
    }
  }

  // 3. Check for Hidden Single in 4x4 Boxes
  for (let br = 0; br < BOX_SIZE; br++) {
    for (let bc = 0; bc < BOX_SIZE; bc++) {
      const candidatePositions = new Map<number, { r: number; c: number }[]>();
      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          const row = br * BOX_SIZE + r;
          const col = bc * BOX_SIZE + c;
          if (grid[row][col].value === 0) {
            const cands = getAvailableCandidates(grid, row, col);
            for (const val of cands) {
              const list = candidatePositions.get(val) || [];
              list.push({ r: row, c: col });
              candidatePositions.set(val, list);
            }
          }
        }
      }
      for (const [val, positions] of candidatePositions.entries()) {
        if (positions.length === 1) {
          const pos = positions[0];
          return {
            type: 'hidden_single',
            title: 'Hidden Single in Block',
            message: `In Block (${br + 1}, ${bc + 1}), this symbol can only fit into Row ${pos.r + 1}, Col ${pos.c + 1}.`,
            row: pos.r,
            col: pos.c,
            value: val,
            affectedUnit: 'box',
          };
        }
      }
    }
  }

  // 4. Check for Hidden Single in Rows
  for (let r = 0; r < GRID_SIZE; r++) {
    const candidateCols = new Map<number, number[]>();
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].value === 0) {
        const cands = getAvailableCandidates(grid, r, c);
        for (const val of cands) {
          const list = candidateCols.get(val) || [];
          list.push(c);
          candidateCols.set(val, list);
        }
      }
    }
    for (const [val, cols] of candidateCols.entries()) {
      if (cols.length === 1) {
        return {
          type: 'hidden_single',
          title: 'Hidden Single in Row',
          message: `In Row ${r + 1}, this symbol only has one available slot at Column ${cols[0] + 1}.`,
          row: r,
          col: cols[0],
          value: val,
          affectedUnit: 'row',
        };
      }
    }
  }

  // 5. Fallback: Direct Reveal of any unfilled cell
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].value === 0) {
        return {
          type: 'direct_reveal',
          title: 'Direct Hint',
          message: `Revealing the correct value for Row ${r + 1}, Column ${c + 1}.`,
          row: r,
          col: c,
          value: grid[r][c].solution,
        };
      }
    }
  }

  return null;
}

/**
 * Counts placed instances of each value (1-16) on the grid.
 */
export function getPlacedCounts(grid: Grid): Record<number, number> {
  const counts: Record<number, number> = {};
  for (let v = 1; v <= GRID_SIZE; v++) counts[v] = 0;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const v = grid[r][c].value;
      if (v >= 1 && v <= GRID_SIZE) {
        counts[v] = (counts[v] || 0) + 1;
      }
    }
  }

  return counts;
}

/**
 * Checks if the entire 16x16 grid is solved correctly.
 */
export function isGridSolved(grid: Grid): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].value !== grid[r][c].solution) {
        return false;
      }
    }
  }
  return true;
}
