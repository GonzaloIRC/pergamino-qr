# Configuración de Firebase para Pergamino App

## Visión General

Pergamino App utiliza Firebase como backend principal, aprovechando varios servicios clave:

- **Authentication**: Para gestionar usuarios y roles
- **Firestore**: Como base de datos para almacenar información de clientes, códigos y transacciones
- **Analytics**: Para recopilar datos de uso y comportamiento (opcional)
- **Cloud Functions**: Para procesamiento en segundo plano (implementación futura)

Este documento detalla la configuración necesaria para un entorno de desarrollo funcional.

## Configuración para Desarrollo Local

### 1. Preparación del Archivo de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Firebase Client SDK (variables públicas)
EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=tu-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=tu-measurement-id

# Emuladores (para desarrollo local)
EXPO_PUBLIC_USE_EMULATORS=true
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost
EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099
EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost
EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT=8080
```

### 2. Configuración de Emuladores

Para desarrollo local, se recomienda usar los emuladores de Firebase:

1. Instala Firebase CLI si aún no lo has hecho:
```bash
npm install -g firebase-tools
```

2. Inicia sesión en Firebase:
```bash
firebase login
```

3. Inicia los emuladores:
```bash
npm run emulators
```

Este comando utilizará la configuración en `firebase.local.json` y iniciará los emuladores de Auth y Firestore.

### 3. Inicialización de Firebase en la App

La inicialización de Firebase está centralizada en `src/services/firebaseClient.js`:

```javascript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { initializeAuth, connectAuthEmulator, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  // ... resto de configuración
};

// Inicialización singleton
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth con persistencia para React Native
let auth;
try {
  auth = initializeAuth(app, { 
    persistence: getReactNativePersistence(AsyncStorage) 
  });
} catch (e) {
  auth = getAuth(app);
}
export { auth };

export const db = getFirestore(app);

// Configuración de emuladores si es necesario
export const useEmulators = (process.env.EXPO_PUBLIC_USE_EMULATORS === 'true');

if (useEmulators) {
  const ah = process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST || 'localhost';
  const ap = parseInt(process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || '9099');
  const fh = process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST || 'localhost';
  const fp = parseInt(process.env.EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT || '8080');
  
  try { connectAuthEmulator(auth, `http://${ah}:${ap}`); } catch (e) { /* manejar error */ }
  try { connectFirestoreEmulator(db, fh, fp); } catch (e) { /* manejar error */ }
}
```

## Estructura de Datos en Firestore

Pergamino App utiliza las siguientes colecciones principales:

### Usuarios y Autenticación

- **usuarios**: Información extendida de usuarios
- **roles**: Roles y permisos asignados a usuarios
- **clientes**: Información específica de clientes

### Gestión de Códigos QR

- **seriales**: Códigos QR serializados para beneficios
- **beneficios**: Definiciones de beneficios disponibles
- **promociones**: Promociones activas

### Tracking y Registros

- **registros**: Registro de actividades del usuario
- **tracking**: Seguimiento detallado de escaneos QR
- **historial**: Historial de transacciones y eventos

## Reglas de Seguridad

Las reglas de seguridad para Firestore están definidas en `firestore.rules`. Las reglas básicas son:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Función para verificar si el usuario está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Función para verificar roles de administrador
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/roles/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Función para verificar roles de mesero
    function isWaiter() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/roles/$(request.auth.uid)).data.role == 'mesero';
    }
    
    // Función para verificar si el usuario es el propietario del documento
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Reglas para colección de usuarios
    match /usuarios/{userId} {
      allow read: if isAuthenticated() && (isAdmin() || isOwner(userId));
      allow write: if isAdmin() || isOwner(userId);
    }
    
    // Reglas para colección de roles
    match /roles/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Reglas para colección de clientes
    match /clientes/{clienteId} {
      allow read: if isAuthenticated() && (isAdmin() || isWaiter() || isOwner(clienteId));
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (isAdmin() || isWaiter() || isOwner(clienteId));
      allow delete: if isAdmin();
    }
    
    // Reglas para seriales (códigos QR)
    match /seriales/{serialId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // Reglas para tracking
    match /tracking/{trackingId} {
      allow create: if isAuthenticated();
      allow read: if isAuthenticated() && (isAdmin() || resource.data.userId == request.auth.uid);
      allow update, delete: if isAdmin();
    }
  }
}
```

## Pruebas y Validación

Para verificar que Firebase está correctamente configurado:

1. Ejecuta la app con `npm start`
2. Navega a la pantalla de login e intenta iniciar sesión
3. Verifica en la consola que los emuladores están siendo utilizados
4. Comprueba que puedes crear y leer documentos en Firestore

Si encuentras errores, verifica:
- Las variables de entorno están correctamente configuradas
- Los emuladores están en ejecución
- Las reglas de seguridad permiten las operaciones intentadas

## Solución de Problemas Comunes

### Error: "Firebase App named '[DEFAULT]' already exists"

**Solución**: Este error ocurre cuando intentamos inicializar Firebase múltiples veces. Asegúrate de que solo se llama a `initializeApp` una vez en toda la aplicación, utilizando la técnica singleton mostrada en `firebaseClient.js`.

### Error: "Missing or insufficient permissions"

**Solución**: Las reglas de seguridad de Firestore están bloqueando la operación. Verifica las reglas en `firestore.rules` y asegúrate de que el usuario tiene los permisos necesarios.

### Error: "NetworkError when attempting to fetch resource"

**Solución**: Verifica que los emuladores están en ejecución y que las variables de entorno para los emuladores son correctas.

## Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Firebase con Expo](https://docs.expo.dev/guides/using-firebase/)
- [Reglas de Seguridad de Firestore](https://firebase.google.com/docs/firestore/security/get-started)
- [Emuladores de Firebase](https://firebase.google.com/docs/emulator-suite)
