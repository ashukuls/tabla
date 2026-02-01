# Implementation Details: Tabla Apps

## Project Structure

```
tabla/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── BolGrid.svelte       # Visual bol display
│   │   │   ├── PlaybackControls.svelte
│   │   │   ├── TempoSlider.svelte
│   │   │   └── KaidaCard.svelte
│   │   ├── audio/
│   │   │   ├── tabla.ts             # Tone.js tabla player
│   │   │   └── metronome.ts         # Metronome sounds
│   │   ├── stores/
│   │   │   ├── playback.ts          # Playback state (Svelte stores)
│   │   │   └── kaidas.ts            # Kaida data store
│   │   ├── firebase/
│   │   │   ├── config.ts            # Firebase initialization
│   │   │   └── db.ts                # Firestore helpers
│   │   └── types/
│   │       └── index.ts             # TypeScript types
│   ├── routes/
│   │   ├── +page.svelte             # Landing page
│   │   ├── +layout.svelte           # Shared layout
│   │   ├── player/
│   │   │   └── +page.svelte         # Tabla player app
│   │   └── trainer/
│   │       └── +page.svelte         # Polyrhythm trainer app
│   └── app.html                     # HTML template
├── static/
│   ├── samples/
│   │   └── tabla/                   # Audio samples (.mp3)
│   └── favicon.png
├── firebase.json                    # Firebase hosting config
├── firestore.rules                  # Security rules
├── svelte.config.js                 # SvelteKit config
├── tailwind.config.js               # Tailwind config
├── tsconfig.json                    # TypeScript config
├── package.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── IMPLEMENTATION.md            # This file
│   └── TASKS.md
└── README.md
```

## Audio System

### Tone.js Tabla Player

```typescript
// src/lib/audio/tabla.ts
import * as Tone from 'tone';
import type { Bol } from '$lib/types';

const BOL_SAMPLES: Record<Bol, string> = {
  dha: 'dha.mp3',
  dhin: 'dhin.mp3',
  ti: 'ti.mp3',
  ge: 'ge.mp3',
  na: 'na.mp3',
  ke: 'ke.mp3',
  ta: 'ta.mp3',
  tun: 'tun.mp3',
  '-': '', // silence
};

class TablaPlayer {
  private sampler: Tone.Sampler;
  private metronome: Tone.MembraneSynth;

  constructor() {
    this.sampler = new Tone.Sampler({
      urls: BOL_SAMPLES,
      baseUrl: '/samples/tabla/',
    }).toDestination();

    this.metronome = new Tone.MembraneSynth().toDestination();
  }

  playBol(bol: Bol, time?: number): void {
    if (bol !== '-') {
      this.sampler.triggerAttack(bol, time);
    }
  }

  setBpm(bpm: number): void {
    Tone.Transport.bpm.value = bpm;
  }

  start(): void {
    Tone.Transport.start();
  }

  stop(): void {
    Tone.Transport.stop();
  }
}

export const tablaPlayer = new TablaPlayer();
```

### Svelte Store for Playback State

```typescript
// src/lib/stores/playback.ts
import { writable, derived } from 'svelte/store';

interface PlaybackState {
  isPlaying: boolean;
  bpm: number;
  currentBeat: number;
  currentBol: number;
}

export const playback = writable<PlaybackState>({
  isPlaying: false,
  bpm: 60,
  currentBeat: 0,
  currentBol: 0,
});

// Derived store for display
export const currentPosition = derived(playback, ($p) => ({
  beat: $p.currentBeat + 1,
  bol: $p.currentBol + 1,
}));
```

### Firebase Configuration

```typescript
// src/lib/firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
```

### Firestore Helpers

```typescript
// src/lib/firebase/db.ts
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';
import type { Kaida, Preset } from '$lib/types';

// Kaidas
export async function getPublicKaidas(): Promise<Kaida[]> {
  const q = query(collection(db, 'kaidas'), where('isPublic', '==', true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Kaida));
}

export async function createKaida(kaida: Omit<Kaida, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'kaidas'), {
    ...kaida,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
}

// Presets
export async function getPresets(): Promise<Preset[]> {
  const snapshot = await getDocs(collection(db, 'presets'));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Preset));
}
```

## Sample Files Required

| Bol | Description | Priority |
|-----|-------------|----------|
| dha | Bass + treble together | High |
| dhin | Resonant bass | High |
| ti/ta | Sharp treble | High |
| ge/ghe | Muted bass | High |
| na | Open treble | High |
| ke/ka | Soft treble | Medium |
| tun | Resonant open bass | Medium |
| tin | Light treble | Low |

**Source options:**
- Record custom samples
- Use royalty-free tabla sample packs
- Generate with physical modeling (complex)

## Quick Start Commands

```bash
# Create SvelteKit project
npm create svelte@latest tabla-app
cd tabla-app

# Add dependencies
npm install -D tailwindcss postcss autoprefixer
npm install tone firebase

# Initialize Tailwind
npx tailwindcss init -p

# Run dev server
npm run dev
```

## Environment Variables

Create `.env` file (not committed to git):

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## SvelteKit + Firebase Hosting

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html', // SPA mode
    }),
  },
};
```

```json
// firebase.json
{
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```
