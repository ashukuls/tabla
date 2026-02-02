# Tabla App Architecture

## Overview

Indian Classical Rhythm Trainer - a web-based tabla practice application with:
- Composition browser with playback
- Tabla player for creating/playing compositions
- Polyrhythm trainer (N bols over D beats)
- Taal-aware metronome
- Sound lab for synthesis experimentation

## Pages/Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page with links to all features |
| `/browse` | Browse compositions with search, filter, playback |
| `/player` | Create and play compositions |
| `/upload` | Upload/edit compositions (use `?edit={id}` for editing) |
| `/trainer` | Polyrhythm trainer |
| `/metronome` | Taal metronome |
| `/lab` | Sound synthesis experimentation |

## Key Features

### Composition Browser (`/browse`)
- Fetch compositions from Firebase
- Search by title, author, description, tags
- Filter by taal
- Sort by newest/oldest/title
- Inline playback with BolGrid visualization
- Edit button links to `/upload?edit={id}`

### Composition Upload/Edit (`/upload`)
- Form: title, taal, tempo, bols, author, description, tags
- Real-time bol parsing and preview
- Edit mode: load existing composition via `?edit={id}` query param
- Validates bols, tempo range (20-300 BPM)

### Tabla Player (`/player`)
- Load compositions or enter bols manually
- Visual grid showing current position
- Playback controls (play/pause/stop, tempo)
- Load from URL: `?load={compositionId}`

### Polyrhythm Trainer (`/trainer`)
- Configure N bols over D beats
- Visual grid showing polyrhythm pattern
- Three audio layers: beat, bol, subdivision
- Volume controls for each layer

### Metronome (`/metronome`)
- Taal selection (Teentaal, Jhaptaal, etc.)
- Visual beat indicators
- Subdivision clicks (laghu)
- Shows sam/taali/khaali positions

## Tech Stack (for Next.js rebuild)

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS 4
- **Audio**: Tone.js
- **Database**: Firebase Firestore
- **Fonts**: Google Fonts (Noto Sans)

## Design System

- Primary colors: Amber (50-900)
- Background: Gradient from amber-50 to orange-100
- Cards: White with rounded-2xl, shadow-lg, border-2 border-amber-200
- Buttons: bg-amber-500 hover:bg-amber-600
- Font: Noto Sans (400, 600, 700 weights)

## Audio Scheduling Pattern

Uses "look-ahead" scheduling for precise timing:

```javascript
const scheduleAheadTime = 0.1; // seconds
const lookahead = 25; // ms interval

function scheduler() {
  while (nextNoteTime < Tone.now() + scheduleAheadTime) {
    // Schedule note at nextNoteTime
    playSound(nextNoteTime);
    // Advance to next beat
    nextNoteTime += beatDuration;
  }
}

// Start scheduler
schedulerInterval = setInterval(scheduler, lookahead);
```

## Mobile Audio Unlock (iOS Safari)

iOS requires user gesture to start audio:

```javascript
async function unlockAudio() {
  await Tone.start();
  const ctx = Tone.getContext().rawContext;
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  // Play silent buffer
  const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
}
```

Show "Tap to Enable Audio" button and call `unlockAudio()` on click.
