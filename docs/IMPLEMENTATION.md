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
│   └── favicon.png
├── firebase.json                    # Firebase hosting config
├── firestore.rules                  # Security rules
├── svelte.config.js                 # SvelteKit config
├── tailwind.config.js               # Tailwind config
├── tsconfig.json                    # TypeScript config
├── package.json
├── docs/
│   ├── ARCHITECTURE.md              # System design, tech stack, data models
│   ├── IMPLEMENTATION.md            # This file - code examples
│   ├── TABLA.md                     # Tabla acoustics & synthesis theory
│   └── TASKS.md                     # Migration checklist
└── README.md
```

## Audio System

See **[TABLA.md](./TABLA.md)** for tabla acoustics, bol mappings, and Tone.js synthesis implementation.

Key files:
- `src/lib/audio/tabla.ts` — TablaPlayer class using MembraneSynth (bayan) + MetalSynth (dayan)
- `src/lib/audio/metronome.ts` — Simple metronome click

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
