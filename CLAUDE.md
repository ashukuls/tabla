# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Layakari Polyrhythm Trainer - a web-based tabla polyrhythm training application. Users define a polyrhythm as N bols (syllables) over D beats, and the app provides synchronized audio and visual feedback.

## Architecture

**Single-file application**: Everything lives in `index.html` - HTML structure, Tailwind CSS styling, and vanilla JavaScript.

### Key Systems

1. **Audio Engine** (Web Audio API)
   - `audioContext`: Single AudioContext instance, lazy-initialized
   - Three independent gain nodes (`beatGain`, `bolGain`, `subdivGain`) for volume mixing
   - Mobile audio unlock mechanism using silent buffer + `ctx.resume()` for iOS Safari compatibility
   - High-precision scheduling using `setTimeout` + `scheduleAheadTime` lookahead pattern to prevent drift

2. **Polyrhythm Calculator** (`calculatePattern()`)
   - Total blocks = N × D (simple product, not LCM)
   - `bolBlocks[]` and `beatBlocks[]` arrays store indices where events occur
   - Block numbering repeats per beat (e.g., 4 bols over 3 beats → "1 1 1 2 | 2 2 3 3 | 3 4 4 4")

3. **Visual Grid**
   - Dual rendering: desktop (single horizontal row) and mobile (one row per beat)
   - `createCell()` generates each grid cell with proper styling and dot indicators
   - Animation uses `requestAnimationFrame` synced to audio time

### Sound Generation

Three synthesized sounds using oscillators:
- **Beat**: 900→700Hz sine wave sweep (0.15s)
- **Bol**: 150→80Hz sine wave sweep (0.2s)
- **Subdivision (Laghu)**: 1800Hz short tick (0.015s)

## Development

No build process - open `index.html` directly in a browser. Uses CDN for Tailwind CSS and Google Fonts.

To test: Open in browser, adjust Bols/Beats/Tempo, click "Tap to Enable Audio", then Play.

## Deployment

Static single-file deployment to GitHub Pages (see README.md for steps).
