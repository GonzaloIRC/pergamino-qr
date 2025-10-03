# Guía para ejecutar pruebas con Firebase real

## Requisitos previos

1. **Cuenta de Firebase**: Debes tener acceso a un proyecto de Firebase real con Authentication y Firestore habilitados.

2. **Credenciales de Firebase**: Asegúrate de tener las credenciales correctas en tu archivo `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key-real
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu-measurement-id
   
   # Importante: debe estar configurado como false para usar Firebase real
   NEXT_PUBLIC_USE_EMULATORS=false
   ```

3. **Usuario administrador**: Debes tener un usuario con rol de administrador en tu proyecto de Firebase.
   - Email: `admin@local.test` (o configura `TEST_ADMIN_EMAIL` con tu email)
   - Contraseña: `Admin123!` (o configura `TEST_ADMIN_PASSWORD` con tu contraseña)

## Verificar o crear usuario administrador

Para verificar si el usuario administrador existe en tu proyecto de Firebase y crearlo si es necesario:

1. Descarga el archivo de credenciales de servicio (`serviceAccountKey.json`) desde la consola de Firebase:
   - Ve a [Console de Firebase](https://console.firebase.google.com/)
   - Selecciona tu proyecto
   - Ve a "Configuración del proyecto" > "Cuentas de servicio"
   - Genera una nueva clave privada
   - Guarda el archivo como `serviceAccountKey.json` en la raíz del proyecto

2. Ejecuta el script de verificación:
   ```powershell
   node verify-admin-user.js
   ```

3. Sigue las instrucciones en pantalla para crear o actualizar el usuario administrador si es necesario.

## Ejecutar las pruebas con Firebase real

Para ejecutar todas las pruebas con Firebase real:

```powershell
# Desde la raíz del proyecto
.\run-tests-with-real-firebase.ps1
```

Este script:
1. Configura el entorno para usar Firebase real
2. Inicia un servidor de desarrollo de Next.js en el puerto 3000
3. Ejecuta las pruebas de Playwright en este servidor
4. Muestra un informe de las pruebas al finalizar

## Solución de problemas

Si las pruebas fallan con errores de autenticación:

1. Verifica que `NEXT_PUBLIC_USE_EMULATORS=false` en `.env.local`
2. Asegúrate de que las credenciales de Firebase son correctas
3. Verifica que el usuario administrador existe en tu proyecto de Firebase
4. Comprueba que el usuario tiene un documento en la colección `roles` con `role: "admin"`

Para depuración adicional, puedes ejecutar las pruebas con el modo de depuración de Playwright:

```powershell
cd .\apps\admin-web
$env:PLAYWRIGHT_TEST_BASE_URL="http://localhost:3000"
npx playwright test tests/e2e/admin-panel.spec.ts --project=chromium --debug
```