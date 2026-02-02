/**
 * Parse bol text into structured composition data
 */
import type { Bol, Beat, Row } from '$lib/types';

// Valid bols (case-insensitive)
const VALID_BOLS = new Set([
	'dha', 'dhin', 'ta', 'tin', 'na', 'tun', 'ge', 'ke', 'ti', 'te',
	'ra', 'ka', 'tete', 'gadi', 'trkt', '-'
]);

/**
 * Normalize a bol string to standard format
 */
function normalizeBol(bol: string): Bol | null {
	const lower = bol.toLowerCase().trim();
	if (!lower || lower === 'x' || lower === '.') return '-' as Bol;
	if (!VALID_BOLS.has(lower)) return null;
	// Capitalize first letter
	return (lower.charAt(0).toUpperCase() + lower.slice(1)) as Bol;
}

/**
 * Parse a single beat string (may contain multiple bols for subdivisions)
 * e.g., "DhaTin" or "Dha Tin" or "Dha,Tin"
 */
export function parseBeat(beatStr: string): Beat {
	// Split by spaces, commas, or camelCase
	const parts = beatStr
		.replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase
		.split(/[\s,]+/)
		.filter(Boolean);

	const bols: Bol[] = [];
	for (const part of parts) {
		const bol = normalizeBol(part);
		if (bol) bols.push(bol);
	}

	return { bols: bols.length > 0 ? bols : ['-' as Bol] };
}

/**
 * Parse a row of bols (space or pipe separated)
 * e.g., "Dha Dhin Dhin Dha | Dha Dhin Dhin Dha"
 */
export function parseRow(rowStr: string): Row {
	// Remove pipe separators (visual only)
	const cleaned = rowStr.replace(/\|/g, ' ');
	const beatStrs = cleaned.split(/\s+/).filter(Boolean);
	return { beats: beatStrs.map(parseBeat) };
}

/**
 * Parse multiple rows (newline separated)
 */
export function parseComposition(text: string): Row[] {
	const lines = text.split('\n').filter((line) => line.trim());
	return lines.map(parseRow);
}

/**
 * Convert rows back to text
 */
export function rowsToText(rows: Row[]): string {
	return rows
		.map((row) =>
			row.beats
				.map((beat) => beat.bols.join(''))
				.join(' ')
		)
		.join('\n');
}

/**
 * Flatten rows into a single array of bols for playback
 */
export function flattenBols(rows: Row[]): { bol: Bol; row: number; beat: number }[] {
	const result: { bol: Bol; row: number; beat: number }[] = [];
	rows.forEach((row, rowIdx) => {
		row.beats.forEach((beat, beatIdx) => {
			beat.bols.forEach((bol) => {
				result.push({ bol, row: rowIdx, beat: beatIdx });
			});
		});
	});
	return result;
}
