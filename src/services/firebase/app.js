import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { app, auth, db, useEmulators } from '../../services/firebaseClient';

// SDKs - reutilizando app, auth y db del cliente centralizado
const functions = getFunctions(app);
const storage = getStorage(app);

// Bloque opcional de emuladores (solo para desarrollo local)
// La configuración de auth y db ya se maneja en firebaseClient.js
if (useEmulators) {
  const host = process.env.EXPO_PUBLIC_EMULATOR_HOST || 'localhost';
  connectFirestoreEmulator(db, host, 8080);
  connectFunctionsEmulator(functions, host, 5001);
  connectStorageEmulator(storage, host, 9199);
}

export { app, auth, db, functions, storage };
