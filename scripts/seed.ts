/**
 * Seed Firestore with compositions from data/compositions.json
 *
 * Usage: npx tsx scripts/seed.ts
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
  const compositionsData = JSON.parse(readFileSync(compositionsPath, 'utf-8'));

  console.log(`Loaded ${compositionsData.length} compositions from JSON`);

  // Get existing compositions
  const compositionsRef = collection(db, 'compositions');
  const existingSnapshot = await getDocs(compositionsRef);
  const existingTitles = new Set(
    existingSnapshot.docs.map((doc) => doc.data().meta?.title)
  );

  console.log(`Found ${existingTitles.size} existing compositions in Firestore`);

  // Seed new compositions
  let added = 0;
  let skipped = 0;

  for (const comp of compositionsData) {
    if (existingTitles.has(comp.meta.title)) {
      console.log(`  Skipping "${comp.meta.title}" (already exists)`);
      skipped++;
      continue;
    }

    await addDoc(compositionsRef, {
      ...comp,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`  Added "${comp.meta.title}"`);
    added++;
  }

  console.log(`\nDone! Added ${added} compositions, skipped ${skipped}.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
