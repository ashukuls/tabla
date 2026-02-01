# Architecture: Tabla Apps

## Overview

Migrate from single-file HTML apps to a Firebase-based serverless architecture supporting two applications:
1. **Tabla Player** — Convert bol notation to audio playback
2. **Polyrhythm Trainer** — Existing layakari trainer with enhanced features

## Current State

- Single `index.html` file with embedded CSS/JS
- No backend or database
- Audio synthesis via raw Web Audio API (basic oscillators)
- Static hosting on GitHub Pages
- Presets hardcoded in JavaScript

## Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Firebase Hosting                         │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │  Tabla Player   │         │ Polyrhythm      │           │
│  │  App            │         │ Trainer App     │           │
│  └────────┬────────┘         └────────┬────────┘           │
└───────────┼───────────────────────────┼─────────────────────┘
            │                           │
            ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Services                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Firestore  │  │  Storage    │  │    Auth     │         │
│  │  (kaidas,   │  │  (audio     │  │  (optional) │         │
│  │   presets)  │  │   samples)  │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | **SvelteKit** | Compiled, reactive, minimal runtime, routing built-in |
| Language | **TypeScript** | Type safety, better DX, catches errors early |
| Build | **Vite** (via SvelteKit) | Fast dev server, HMR, optimized builds |
| Styling | **Tailwind CSS** | Utility-first, works great with Svelte |
| Audio | **Tone.js** + samples | Precise scheduling, realistic tabla sounds |
| Database | Firestore | Serverless, generous free tier |
| File Storage | Firebase Storage | For audio samples |
| Hosting | Firebase Hosting | Integrated, fast CDN |
| Auth | Firebase Auth (optional) | If user accounts needed later |

## Data Models

### TypeScript Types

```typescript
// src/lib/types/index.ts

type Bol = 'dha' | 'dhin' | 'ti' | 'ta' | 'ge' | 'ghe' | 'na' | 'ke' | 'ka' | 'tun' | 'tin' | '-';

type TaalName = 'teental' | 'jhaptaal' | 'ektaal' | 'rupak' | 'dadra';

interface Kaida {
  id: string;
  name: string;
  description?: string;
  taal: TaalName;
  beats: number;
  tempo: number;
  bols: Bol[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isPublic: boolean;

  // Optional
  tags?: string[];
  source?: string;
}

interface Taal {
  id: TaalName;
  name: string;
  beats: number;
  vibhags: number[];      // beat groupings
  sam: number;            // emphasized beat
  khali: number;          // wave beat
  theka: Bol[];
}

interface Preset {
  id: string;
  name: string;
  bols: number;
  beats: number;
  tempo: number;
  bolLabels: string[];
  createdBy: string;
  isPublic: boolean;
}
```

### Firestore Collections

| Collection | Type | Description |
|------------|------|-------------|
| `kaidas` | `Kaida` | User-uploaded tabla compositions |
| `taals` | `Taal` | Reference data for taal definitions |
| `presets` | `Preset` | Polyrhythm trainer presets |

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Taals: read-only reference data
    match /taals/{taalId} {
      allow read: if true;
      allow write: if false;
    }

    // Kaidas: public read, authenticated write
    match /kaidas/{kaidaId} {
      allow read: if resource.data.isPublic == true;
      allow create: if true;  // or require auth
      allow update, delete: if false;  // or check ownership
    }

    // Presets: similar to kaidas
    match /presets/{presetId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }
  }
}
```

## Cost Estimate

### Free Tier (Spark Plan) — Sufficient for MVP

| Service | Free Allowance | Expected Usage |
|---------|----------------|----------------|
| Hosting | 10 GB storage | ~5 MB |
| Hosting | 360 MB/day bandwidth | ~10 MB/day |
| Firestore | 1 GB storage | ~1 MB |
| Firestore | 50K reads/day | ~500/day |
| Firestore | 20K writes/day | ~50/day |
| Storage | 5 GB | ~50 MB samples |

**Estimated monthly cost: $0** for low traffic

### Growth Scenario (Blaze Plan)

If traffic grows to 1000+ monthly users:
- Firestore: ~$1-5/month
- Hosting bandwidth: ~$1-2/month
- Storage: ~$0.50/month

**Estimated: $5-10/month** at moderate scale
