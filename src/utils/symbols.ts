import { SymbolConfig, SymbolSetId } from '../types/sudoku';

export const SYMBOL_CONFIGS: Record<SymbolSetId, SymbolConfig> = {
  alpha: {
    id: 'alpha',
    name: '1-9 & A-G',
    description: 'Classic 16x16 Sudoku notation with digits 1-9 and letters A-G',
    symbols: ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
  },
  hex: {
    id: 'hex',
    name: 'Hex (0-F)',
    description: 'Hexadecimal numbers 0 through F',
    symbols: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'],
  },
  numbers: {
    id: 'numbers',
    name: '1 to 16',
    description: 'Standard numerals from 1 through 16',
    symbols: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'],
  },
  letters: {
    id: 'letters',
    name: 'A to P',
    description: 'Sequential Latin letters from A through P',
    symbols: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'],
  },
};

/**
 * Returns symbol representation for value (1-16).
 * Value 0 returns empty string.
 */
export function getSymbol(value: number, symbolSet: SymbolSetId): string {
  if (value < 1 || value > 16) return '';
  const config = SYMBOL_CONFIGS[symbolSet] || SYMBOL_CONFIGS.alpha;
  return config.symbols[value - 1] ?? '';
}

/**
 * Parses user typed key into numeric value 1-16 based on active symbol set.
 */
export function parseKeyToValue(key: string, symbolSet: SymbolSetId): number | null {
  const clean = key.toUpperCase();
  const config = SYMBOL_CONFIGS[symbolSet] || SYMBOL_CONFIGS.alpha;

  // Direct symbol index check
  const idx = config.symbols.findIndex((s) => s.toUpperCase() === clean);
  if (idx !== -1) {
    return idx + 1;
  }

  // Universal fallbacks for standard typing:
  // If alpha mode: 1-9, A-G
  if (symbolSet === 'alpha') {
    if (/^[1-9]$/.test(clean)) return parseInt(clean, 10);
    const code = clean.charCodeAt(0);
    if (code >= 65 && code <= 71) { // A-G
      return code - 65 + 10;
    }
  }

  // If hex mode: 0-9, A-F
  if (symbolSet === 'hex') {
    if (/^[0-9]$/.test(clean)) return parseInt(clean, 10) + 1; // '0' is 1, '1' is 2, etc.
    const code = clean.charCodeAt(0);
    if (code >= 65 && code <= 70) { // A-F
      return code - 65 + 11;
    }
  }

  // If letters mode: A-P
  if (symbolSet === 'letters') {
    const code = clean.charCodeAt(0);
    if (code >= 65 && code <= 80) { // A-P
      return code - 65 + 1;
    }
  }

  return null;
}
