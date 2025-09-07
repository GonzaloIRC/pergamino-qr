# Configuración de Firebase

## Estructura de Archivos

- `src/services/firebaseClient.js`: Punto único de inicialización de Firebase
- `firebase.json`: Configuración de emuladores
- `.env.local`: Variables de entorno para Firebase

## Variables de Entorno

Todas las credenciales de Firebase se obtienen de variables de entorno con el formato `EXPO_PUBLIC_*`:

```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_BUCKET
EXPO_PUBLIC_FIREBASE_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
```

## Emuladores

Se utilizan emuladores para desarrollo local, activados mediante:

```
EXPO_PUBLIC_USE_EMULATORS=true
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099
EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost
EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT=8080
```

La función `enableEmulatorsIfNeeded()` en firebaseClient.js se encarga de conectar a los emuladores cuando está habilitada la opción.

## Inicialización

```javascript
// Inicialización de app
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth con persistencia en AsyncStorage
let auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch (e) {
  auth = getAuth(app);
}

export const db = getFirestore(app);
```

## Reglas de Firestore

Las reglas de seguridad en `firestore.rules` exigen autenticación para todas las operaciones y roles específicos para ciertas colecciones.
