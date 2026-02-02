import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID
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
	if (!db) {
		initFirebase();
	}
	return db;
}

export { app, db };
