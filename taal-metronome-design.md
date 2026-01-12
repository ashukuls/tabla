# Taal Metronome - Technical Design Document

## Overview

A configurable tabla taal metronome web application. Users define taal structures using **bol notation** - the actual tabla syllables determine the rhythmic structure. Each beat can have different subdivisions based on the bol complexity.

## Core Concepts

### Taal Structure
- **Matra**: Individual beat in the cycle
- **Vibhag**: Group of consecutive matras (section), one per line in input
- **Sam**: First beat of cycle (always matra 1), marked as "X"
- **Tali**: Clap position - first beat of a vibhag with clap, marked with vibhag number (2, 3, 4...)
- **Khali**: Wave position - first beat of a vibhag without clap, marked as "0"
- **Subdivision**: Variable per beat, determined by bol notation

### Bol Notation Rules
- **New lines** separate vibhags
- **Spaces** separate beats (matras) within a vibhag
- **Capital letters** mark subdivision boundaries within a beat
- **Dash (-)** represents a silent subdivision

### Parsing Examples
| Input | Beats | Subdivisions per beat |
|-------|-------|----------------------|
| `Dha` | 1 | [1] |
| `TiRKiT` | 1 | [4] (Ti-R-Ki-T) |
| `TaKTa-` | 1 | [4] (Ta-K-Ta-silent) |
| `Dha TiRKiT` | 2 | [1, 4] |
| `Dha Dhin Dhin Dha` | 4 | [1, 1, 1, 1] |

### Example: Teentaal in Bol Notation
```
Dha Dhin Dhin Dha
Dha Dhin Dhin Dha
Dha Tin Tin Na
Ta Dhin Dhin Dha
```
- 4 vibhags (4 lines)
- 4 beats per vibhag
- Each beat has 1 subdivision (simple theka)
- Tali/Khali: User toggles each vibhag

### Example: Complex Pattern
```
Dha TiRKiT TaKa TiRKiT
Dha TiRKiT TaKa-
```
- 2 vibhags
- Vibhag 1: 4 beats with subdivisions [1, 4, 2, 4]
- Vibhag 2: 3 beats with subdivisions [1, 4, 3]

## Data Structures

### State
```javascript
const state = {
  // Configuration (from user input)
  bolText: `Dha Dhin Dhin Dha
Dha Dhin Dhin Dha
Dha Tin Tin Na
Ta Dhin Dhin Dha`,                 // Textarea content
  vibhagTypes: ['tali', 'tali', 'khali', 'tali'],  // 'tali' or 'khali' per vibhag
  tempo: 60,                       // BPM

  // Derived (computed by parser)
  vibhags: [                       // Parsed structure
    {
      beats: [
        { bol: 'Dha', subdivisions: 1, silentMask: [false] },
        { bol: 'Dhin', subdivisions: 1, silentMask: [false] },
        // ...
      ],
      type: 'tali'
    },
    // ...
  ],
  totalBeats: 16,
  totalSubdivisions: 16,           // Sum of all subdivisions across all beats

  // Playback
  isPlaying: false,
  currentSubdivIndex: 0,           // Global subdivision index
};
```

### Bol Parser
```javascript
function parseBol(word) {
  // Count capitals and dashes
  const subdivisions = [];
  const silentMask = [];

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    if (char === '-') {
      subdivisions.push('-');
      silentMask.push(true);
    } else if (char === char.toUpperCase() && char.match(/[A-Z]/)) {
      // Start of new subdivision
      subdivisions.push(char);
      silentMask.push(false);
    }
  }

  return {
    bol: word,
    subdivisions: subdivisions.length || 1,
    silentMask: silentMask.length ? silentMask : [false]
  };
}

function parseVibhag(line) {
  const words = line.trim().split(/\s+/);
  return words.map(parseBol);
}

function parseTaal(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  return lines.map(parseVibhag);
}
```

### Marker Logic
```javascript
function getMarker(beatIndex, vibhagIndex, vibhagType, taliCount) {
  if (beatIndex === 0) return 'X';            // Sam is always X
  if (!isFirstBeatOfVibhag) return null;      // Only first beat of vibhag gets marker
  if (vibhagType === 'khali') return '0';     // Khali vibhag
  return String(taliCount);                   // Tali vibhag: 2, 3, 4...
}
```

## UI Components

### 1. Bol Pattern Editor

**Textarea Input:**
```
┌─────────────────────────────────────────────────────┐
│ Bol Pattern (one vibhag per line):                  │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Dha Dhin Dhin Dha                               │ │
│ │ Dha Dhin Dhin Dha                               │ │
│ │ Dha Tin Tin Na                                  │ │
│ │ Ta Dhin Dhin Dha                                │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```
- Each line = one vibhag
- Spaces separate beats
- Capitals mark subdivisions, "-" for silence
- Real-time parsing updates visual preview

**Vibhag Type Toggles:**
```
┌─────────────────────────────────────────────────────┐
│ Vibhag 1: [Tali ▼]  Vibhag 2: [Tali ▼]             │
│ Vibhag 3: [Khali ▼] Vibhag 4: [Tali ▼]             │
└─────────────────────────────────────────────────────┘
```
- One toggle per vibhag (parsed from lines)
- Default: first vibhag = tali (Sam), others = tali
- User toggles khali as needed

### 2. Controls
```
┌─────────────────────────────────────────┐
│ Subdivisions: [4 ▼]   Tempo: [60] BPM   │
│                                          │
│ Volume Mix:                              │
│ Sam:    ━━━━━━━━○━━━━━  50%              │
│ Tali:   ━━━━━━━━━━━○━━  70%              │
│ Khali:  ━━━━━○━━━━━━━━  30%              │
│ Subdiv: ━━○━━━━━━━━━━━  20%              │
└─────────────────────────────────────────┘
```

### 3. Playback Visualizer
```
┌─────────────────────────────────────────────────────────────────┐
│ Vibhag 1 (X)                    │ Vibhag 2 (2)                  │
│ ┌─────────┬─────────┬─────────┬─────────┐ ┌─────────┬─────────  │
│ │   Dha   │  Dhin   │  Dhin   │   Dha   │ │   Dha   │  ...     │
│ │   [●]   │    ○    │    ○    │    ○    │ │         │          │
│ │    1    │    2    │    3    │    4    │ │    5    │          │
│ └─────────┴─────────┴─────────┴─────────┘ └─────────┴─────────  │
└─────────────────────────────────────────────────────────────────┘

For beats with multiple subdivisions (e.g., TiRKiT):
┌─────────────────────┐
│       TiRKiT        │  <- Bol text
│   ● ○ ○ ○           │  <- 4 subdivision dots
│        5            │  <- Beat number
└─────────────────────┘
```
- Vibhag header shows marker (X, 2, 0, 3...)
- Each beat cell shows: bol text, subdivision dots, beat number
- Yellow highlight on current beat
- Current subdivision dot highlighted within beat
- Blue border separates vibhags

## Audio System

### Gain Node Structure
```
                    ┌─► samGain ─────┐
                    │                │
audioContext ──────┼─► taliGain ────┼──► destination
                    │                │
                    ├─► khaliGain ───┤
                    │                │
                    └─► subdivGain ──┘
```

### Sound Specifications

| Sound | Frequency | Envelope | Duration | Character |
|-------|-----------|----------|----------|-----------|
| Sam | 80Hz → 60Hz sweep | Attack: 0, Decay: 0.3s | 0.3s | Deep, resonant thump |
| Tali | 400Hz | Attack: 0, Decay: 0.1s | 0.1s | Sharp mid click |
| Khali | 600Hz | Attack: 0, Decay: 0.08s | 0.08s | Soft high click |
| Subdiv | 1200Hz | Attack: 0, Decay: 0.02s | 0.02s | Tiny tick |

### Scheduler Algorithm

Since each beat can have different subdivisions, we need a flattened timeline:

```javascript
// Pre-computed timeline of all events
const timeline = [
  { beatIndex: 0, subdivIndex: 0, isBeatStart: true, isSilent: false, marker: 'X' },
  { beatIndex: 1, subdivIndex: 0, isBeatStart: true, isSilent: false, marker: null },
  { beatIndex: 2, subdivIndex: 0, isBeatStart: true, isSilent: false, marker: null },
  // ... for beats with 1 subdiv
  { beatIndex: 4, subdivIndex: 0, isBeatStart: true, isSilent: false, marker: '2' },
  { beatIndex: 4, subdivIndex: 1, isBeatStart: false, isSilent: false, marker: null },
  { beatIndex: 4, subdivIndex: 2, isBeatStart: false, isSilent: false, marker: null },
  { beatIndex: 4, subdivIndex: 3, isBeatStart: false, isSilent: false, marker: null },
  // ... for TiRKiT with 4 subdivs
];

const scheduleAheadTime = 0.1;
const lookahead = 25;

function scheduler() {
  while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
    scheduleEvent(timeline[currentEventIndex], nextNoteTime);
    advanceNote();
  }
  timerID = setTimeout(scheduler, lookahead);
}

function scheduleEvent(event, time) {
  // Skip silent subdivisions
  if (event.isSilent) return;

  // Always play subdivision tick (unless silent)
  playSubdiv(time);

  // On beat start, play appropriate beat sound
  if (event.isBeatStart) {
    if (event.marker === 'X') playSam(time);
    else if (event.marker === '0') playKhali(time);
    else if (event.marker) playTali(time);  // Numbered tali
  }
}

function advanceNote() {
  const bpm = tempo;
  const secondsPerBeat = 60.0 / bpm;
  const currentEvent = timeline[currentEventIndex];
  const currentBeat = beats[currentEvent.beatIndex];

  // Subdivision duration = beat duration / number of subdivisions in this beat
  const subdivDuration = secondsPerBeat / currentBeat.subdivisions;

  nextNoteTime += subdivDuration;
  currentEventIndex = (currentEventIndex + 1) % timeline.length;
}
```

**Key insight**: All beats have equal duration (60/BPM seconds). Subdivisions within each beat divide that duration equally. So a beat with 4 subdivisions plays faster than a beat with 1 subdivision.

## Event Flow

### Configuration Change
```
User edits vibhag text
    │
    ▼
parseVibhagStructure("4 4 4 4")
    │
    ▼
Update state.vibhagLengths, recalculate totalMatras
    │
    ▼
generateMatraInfo() → populates state.matraInfo[]
    │
    ▼
renderVibhagEditor() → updates visual builder
    │
    ▼
renderVisualizer() → updates playback grid
```

### Tali/Khali Toggle
```
User clicks vibhag dropdown
    │
    ▼
Toggle state.vibhagTypes[vibhagIndex]
    │
    ▼
regenerateMarkers() → updates markers in matraInfo
    │
    ▼
renderVibhagEditor() + renderVisualizer()
```

### Playback
```
User clicks Play
    │
    ▼
unlockAudio() → iOS workaround
    │
    ▼
Initialize: currentSubdiv=0, nextNoteTime=now
    │
    ▼
Start scheduler() loop
    │
    ▼
Start animate() loop (requestAnimationFrame)
    │
    ├─► scheduler: schedules audio events
    │
    └─► animate: updates visual highlight position
```

## Mobile Considerations

1. **Audio Unlock**: Same pattern as Layakari - silent buffer + ctx.resume() on first user interaction
2. **Layout**: Vibhag editor stacks vertically, visualizer wraps or scrolls
3. **Touch Targets**: Minimum 44px for tap targets (dropdowns, play button)
4. **Silent Mode Warning**: Include iPhone silent mode reminder

## File Structure

Single file: `taal-metronome.html`

```
taal-metronome.html
├── <head>
│   ├── Tailwind CSS CDN
│   └── Google Fonts (Inter)
├── <body>
│   ├── Header
│   ├── Audio Enable Button
│   ├── Vibhag Editor Section
│   │   ├── Text input
│   │   └── Visual builder grid
│   ├── Controls Section
│   │   ├── Subdivisions, Tempo inputs
│   │   └── Volume sliders
│   ├── Visualizer Section
│   │   ├── Desktop grid
│   │   └── Mobile grid
│   └── iPhone Warning
└── <script>
    ├── State management
    ├── Vibhag parsing & calculation
    ├── Audio system (context, gains, sounds)
    ├── Scheduler & animation
    ├── UI rendering functions
    └── Event handlers
```
