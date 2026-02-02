# Firebase Integration

## Environment Variables

```bash
# .env.local (Next.js)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## Firebase Config (Next.js)

```typescript
// lib/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp;
let db: Firestore;

export function initFirebase(): FirebaseApp {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) initFirebase();
  return db;
}
```

## Collections

### `compositions`

```typescript
{
  id: string;          // Auto-generated
  meta: {
    title: string;
    taal: string;
    tempo: number;
    description?: string;
    author?: string;
    tags?: string[];
  };
  rows: Array<{
    beats: Array<{
      bols: string[];
    }>;
  }>;
  createdAt: string;   // ISO timestamp
  updatedAt: string;
}
```

### `polyrhythmPresets`

```typescript
{
  id: string;
  name: string;
  bols: number;
  beats: number;
  tempo: number;
  volumes: { beat: number; bol: number; subdivision: number };
  createdAt: string;
  updatedAt: string;
}
```

## Database Functions

```typescript
// lib/firebase/db.ts
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query } from 'firebase/firestore';

const COMPOSITIONS_COLLECTION = 'compositions';

// Get all compositions
export async function getCompositions(): Promise<Composition[]> {
  const db = getDb();
  const q = query(collection(db, COMPOSITIONS_COLLECTION));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Composition[];
}

// Get single composition
export async function getComposition(id: string): Promise<Composition | null> {
  const db = getDb();
  const docRef = doc(db, COMPOSITIONS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Composition;
}

// Create composition
export async function createComposition(data: Omit<Composition, 'id'>): Promise<string> {
  const db = getDb();
  const docRef = await addDoc(collection(db, COMPOSITIONS_COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return docRef.id;
}

// Update composition
export async function updateComposition(id: string, data: Partial<Composition>): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COMPOSITIONS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

// Delete composition
export async function deleteComposition(id: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, COMPOSITIONS_COLLECTION, id));
}
```

## Deployment

### Local Development (Container)
- Use Firebase Emulator Suite for local Firestore
- Or connect to dev Firebase project

### Production (Google Cloud)
- Deploy to Firebase Hosting or Cloud Run
- Use production Firebase project
- Set environment variables in deployment platform
