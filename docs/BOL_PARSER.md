# Bol Parser

Parses text input into structured composition data.

## Input Format

- Bols separated by spaces
- `|` for visual grouping (ignored in parsing)
- New line for new row
- `-`, `x`, `.` for rests

Example:
```
Dha Dhin Dhin Dha | Dha Dhin Dhin Dha
Dha Tin Tin Ta | Ta Dhin Dhin Dha
```

## Parser Implementation

```typescript
// Valid bols (case-insensitive)
const VALID_BOLS = new Set([
  'dha', 'dhin', 'ta', 'tin', 'na', 'tun', 'ge', 'ke', 'ti', 'te',
  'ra', 'ka', 'tete', 'gadi', 'trkt', '-'
]);

// Normalize bol to standard format (capitalize first letter)
function normalizeBol(bol: string): Bol | null {
  const lower = bol.toLowerCase().trim();
  if (!lower || lower === 'x' || lower === '.') return '-';
  if (!VALID_BOLS.has(lower)) return null;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

// Parse single beat (may contain subdivisions like "DhaTin")
function parseBeat(beatStr: string): Beat {
  const parts = beatStr
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // Split camelCase
    .split(/[\s,]+/)
    .filter(Boolean);

  const bols: Bol[] = [];
  for (const part of parts) {
    const bol = normalizeBol(part);
    if (bol) bols.push(bol);
  }

  return { bols: bols.length > 0 ? bols : ['-'] };
}

// Parse row (space or pipe separated)
function parseRow(rowStr: string): Row {
  const cleaned = rowStr.replace(/\|/g, ' ');
  const beatStrs = cleaned.split(/\s+/).filter(Boolean);
  return { beats: beatStrs.map(parseBeat) };
}

// Parse full composition (newline separated rows)
function parseComposition(text: string): Row[] {
  const lines = text.split('\n').filter(line => line.trim());
  return lines.map(parseRow);
}

// Convert rows back to text
function rowsToText(rows: Row[]): string {
  return rows
    .map(row =>
      row.beats
        .map(beat => beat.bols.join(''))
        .join(' ')
    )
    .join('\n');
}
```

## Subdivision Support

Multiple bols in one beat (subdivisions):
- `DhaTin` → parses as `['Dha', 'Tin']` in one beat
- Played evenly distributed across beat duration
- Example: at 60 BPM, beat = 1 second, each bol = 0.5 seconds
