# Configuración de Firebase: Solución de Problemas

## Error: auth/admin-restricted-operation

Si encuentras este error, significa que el método de autenticación anónima está deshabilitado en tu proyecto Firebase. Para habilitarlo:

1. Ve a la [consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `codigos-pergamino`
3. En el menú lateral, ve a "Authentication" (Autenticación)
4. Haz clic en la pestaña "Sign-in method" (Método de acceso)
5. Encuentra "Anonymous" (Anónimo) en la lista y habilítalo
6. Guarda los cambios

## Alternativa: Usar Email/Password (sin registro previo)

Para usar autenticación con email/password sin tener que registrarse primero:

1. Crea un usuario de prueba en la consola de Firebase:
   - Ve a "Authentication" > "Users" (Usuarios)
   - Haz clic en "Add User" (Añadir usuario)
   - Crea un usuario con credenciales de prueba (ej: `test@example.com` / `password123`)

2. Usa estas credenciales para iniciar sesión en la aplicación

## Verificación de Emuladores

Si estás usando emuladores:

1. Asegúrate de que estén correctamente iniciados:
   ```bash
   firebase emulators:start
   ```

2. Verifica que tu archivo `.env.local` contenga:
   ```
   EXPO_PUBLIC_USE_EMULATORS=true
   EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost
   EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099
   EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost
   EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT=8080
   ```

## Credenciales de Firebase

Si las credenciales no son correctas:

1. Verifica que el projectId, apiKey y authDomain coincidan con tu proyecto
2. Asegúrate de que el proyecto esté activo en la consola de Firebase
3. Verifica que las APIs necesarias estén habilitadas en Google Cloud Console
