/**
 * Delete all compositions and reseed from data/compositions.json
 *
 * Usage: npx tsx scripts/reseed.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, addDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function reseed() {
  console.log('Initializing Firebase...');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const compositionsRef = collection(db, 'compositions');

  // Delete all existing
  console.log('Deleting existing compositions...');
  const snapshot = await getDocs(compositionsRef);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, 'compositions', docSnap.id));
  }
  console.log(`Deleted ${snapshot.size} documents`);

  // Load and add new
  const compositionsPath = resolve(__dirname, '../data/compositions.json');
  const compositionsData = JSON.parse(readFileSync(compositionsPath, 'utf-8'));

  console.log(`Adding ${compositionsData.length} compositions...`);
  for (const comp of compositionsData) {
    await addDoc(compositionsRef, {
      ...comp,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log(`  Added "${comp.title}"`);
  }

  console.log('\nDone!');
  process.exit(0);
}

reseed().catch((err) => {
  console.error('Reseed failed:', err);
  process.exit(1);
});
