// filepath: src/services/firebaseClient.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { initializeAuth, getAuth, connectAuthEmulator, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
	apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.EXPO_PUBLIC_FIREBASE_BUCKET,
	messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
	appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
let auth;
try {
	auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch (e) {
	auth = getAuth(app);
}
export { auth };

export const db = getFirestore(app);
export const useEmulators = (process.env.EXPO_PUBLIC_USE_EMULATORS ?? 'false') === 'true';

export function enableEmulatorsIfNeeded({ auth, db }) {
	if (!useEmulators) return;
	const ah = process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1';
	const ap = parseInt(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || '9100', 10);
	const fh = process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST || '127.0.0.1';
	const fp = parseInt(process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT || '8081', 10);
	try { connectAuthEmulator(auth, `http://${ah}:${ap}`, { disableWarnings: true }); } catch {}
	try { connectFirestoreEmulator(db, fh, fp); } catch {}
}

// ...existing code...
