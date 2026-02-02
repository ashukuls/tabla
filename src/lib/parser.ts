import type { Beat, Row } from './types';

// Valid bols (case-insensitive)
const VALID_BOLS = new Set([
  'dha', 'dhin', 'ta', 'tin', 'na', 'tun', 'ge', 'ke', 'ti', 'te',
  'ra', 'ka', 'tete', 'gadi', 'trkt', '-'
]);

// Normalize bol to standard format (capitalize first letter)
export function normalizeBol(bol: string): string | null {
  const lower = bol.toLowerCase().trim();
  if (!lower || lower === 'x' || lower === '.') return '-';
  if (!VALID_BOLS.has(lower)) return null;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Parse single beat (may contain subdivisions like "DhaTin")
export function parseBeat(beatStr: string): Beat {
  const parts = beatStr
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // Split camelCase
    .split(/[\s,]+/)
    .filter(Boolean);

  const bols: string[] = [];
  for (const part of parts) {
    const bol = normalizeBol(part);
    if (bol) bols.push(bol);
  }

  return { bols: bols.length > 0 ? bols : ['-'] };
}

// Parse row (space or pipe separated)
export function parseRow(rowStr: string): Row {
  const cleaned = rowStr.replace(/\|/g, ' ');
  const beatStrs = cleaned.split(/\s+/).filter(Boolean);
  return { beats: beatStrs.map(parseBeat) };
}

// Parse full composition (newline separated rows)
export function parseComposition(text: string): Row[] {
  const lines = text.split('\n').filter(line => line.trim());
  return lines.map(parseRow);
}

// Convert rows back to text
export function rowsToText(rows: Row[]): string {
  return rows
    .map(row =>
      row.beats
        .map(beat => beat.bols.join(''))
        .join(' ')
    )
    .join('\n');
}

// Validate bol string
export function isValidBol(bol: string): boolean {
  return normalizeBol(bol) !== null;
}

// Get all bols from rows as flat array
export function getAllBols(rows: Row[]): string[] {
  const bols: string[] = [];
  for (const row of rows) {
    for (const beat of row.beats) {
      bols.push(...beat.bols);
    }
  }
  return bols;
}
