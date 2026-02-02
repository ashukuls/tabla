import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { getDb } from './config';
import type { Composition } from '../types';

const COMPOSITIONS_COLLECTION = 'compositions';

// Get all compositions
export async function getCompositions(): Promise<Composition[]> {
  const db = getDb();
  const q = query(
    collection(db, COMPOSITIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
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
export async function createComposition(
  data: Omit<Composition, 'id'>
): Promise<string> {
  const db = getDb();
  const docRef = await addDoc(collection(db, COMPOSITIONS_COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
}

// Update composition
export async function updateComposition(
  id: string,
  data: Partial<Composition>
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, COMPOSITIONS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// Delete composition
export async function deleteComposition(id: string): Promise<void> {
  const db = getDb();
  await deleteDoc(doc(db, COMPOSITIONS_COLLECTION, id));
}
