/**
 * Seed Firestore with compositions from data/compositions.json
 *
 * Usage: npm run seed
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface CompositionData {
  title: string;
  taal: string;
  tempo: number;
  bols: string;
  description?: string;
  author?: string;
  tags?: string[];
}

async function seed() {
  console.log('Initializing Firebase...');

  if (!firebaseConfig.projectId) {
    console.error(
      'Error: Firebase config not found. Make sure .env file exists with NEXT_PUBLIC_FIREBASE_* variables.'
    );
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Load compositions from JSON
  const compositionsPath = resolve(__dirname, '../data/compositions.json');
  const compositionsData: CompositionData[] = JSON.parse(
    readFileSync(compositionsPath, 'utf-8')
  );

  console.log(`Loaded ${compositionsData.length} compositions from JSON`);

  // Get existing compositions
  const compositionsRef = collection(db, 'compositions');
  const existingSnapshot = await getDocs(compositionsRef);
  const existingTitles = new Set(
    existingSnapshot.docs.map((doc) => doc.data().title)
  );

  console.log(`Found ${existingTitles.size} existing compositions in Firestore`);

  // Seed new compositions
  let added = 0;
  let skipped = 0;

  for (const comp of compositionsData) {
    if (existingTitles.has(comp.title)) {
      console.log(`  Skipping "${comp.title}" (already exists)`);
      skipped++;
      continue;
    }

    await addDoc(compositionsRef, {
      ...comp,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`  Added "${comp.title}"`);
    added++;
  }

  console.log(`\nDone! Added ${added} compositions, skipped ${skipped}.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
