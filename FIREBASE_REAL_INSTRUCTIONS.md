# INSTRUCCIONES PARA EJECUTAR PRUEBAS

Este documento proporciona instrucciones para ejecutar las pruebas tanto con Firebase real como con emuladores, y configurar correctamente la validación de DNI único. Incluye soluciones a problemas comunes encontrados durante la ejecución de pruebas.

## Requisitos previos

1. Proyecto Firebase configurado
2. Cuenta de servicio con permisos adecuados
3. Node.js y NPM instalados

## Pasos para la configuración

### 1. Configuración de Firebase

1. Descarga un archivo de cuenta de servicio desde la consola de Firebase:
   - Ve a Configuración del proyecto > Cuentas de servicio
   - Haz clic en "Generar nueva clave privada"
   - Guarda el archivo JSON en la raíz de tu proyecto como `service-account.json`

2. Asegúrate de que las reglas de Firestore permitan operaciones necesarias:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso a colección clients con DNI único
    match /clients/{userId} {
      allow create: if request.auth != null 
                    && !exists(/databases/$(database)/documents/registeredDNIs/$(request.resource.data.dni));
      allow read: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Registro de DNI
    match /registeredDNIs/{dni} {
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid
                    && !exists(/databases/$(database)/documents/registeredDNIs/$(dni));
      allow read: if request.auth != null;
      allow delete: if false;
    }
    
    // Roles de administrador
    match /roles/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;  // Solo administradores pueden modificar roles
    }
  }
}
```

### 2. Configuración del entorno

1. Verifica que el archivo `.env.local` en `apps/admin-web` esté configurado para desarrollo local:

```
NEXT_PUBLIC_USE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pergamino-dev
NEXT_PUBLIC_FIREBASE_API_KEY=dev
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=localhost
NEXT_PUBLIC_FIREBASE_APP_ID=dev
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=dev
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=127.0.0.1
NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT=8080
```

2. Para pruebas con Firebase real, el script `run-full-test.ps1` creará automáticamente un archivo `.env.e2e` temporal con la configuración adecuada, sin modificar tu `.env.local`.

3. Verifica que el archivo `.env` en la carpeta `scripts` tenga las credenciales necesarias.

### 3. Ejecución de pruebas

#### Con Firebase Real:

Para ejecutar todas las pruebas con Firebase real:

```powershell
./run-full-test.ps1
```

El script:
1. Verificará si existe el usuario admin y lo creará si es necesario
2. Configurará la validación de DNI único
3. Iniciará el servidor de prueba
4. Ejecutará todas las pruebas

#### Con Emuladores (recomendado para desarrollo):

Para ejecutar pruebas específicas con los emuladores:

```powershell
# Terminal 1: Iniciar emuladores de Firebase
firebase emulators:start

# Terminal 2: Iniciar la aplicación
cd "C:\Users\k\Documents\Pergamino-app 2\apps\admin-web"
rd /s /q .next
npm run dev -- -p 3000

# Terminal 3: Ejecutar pruebas
$env:BASE_URL="http://localhost:3000"
$env:TEST_ADMIN_EMAIL="admin@local.test"
$env:TEST_ADMIN_PASSWORD="Admin123!"
npx playwright test admin-panel.spec.ts -g "admin user can login successfully" --project=chromium --trace on
npx playwright show-report
```

## Resultados de las pruebas

Las pruebas comprueban los siguientes aspectos de la aplicación:

1. **Redirección post-login**: Verifica que los usuarios son redirigidos correctamente después del login.
2. **Estructura del sidebar**: Comprueba que la barra lateral contiene todos los elementos necesarios con los testid adecuados.
3. **Login con usuario real**: Verifica que se puede iniciar sesión con credenciales reales.
4. **Navegación**: Comprueba que se puede navegar entre las diferentes secciones de la aplicación.
5. **KPIs dinámicos**: Verifica que el dashboard muestra datos reales obtenidos de Firestore.

## Funcionalidad de DNI único

La aplicación implementa un sistema de validación de DNI único que:

1. Verifica en tiempo real si un DNI ya está registrado
2. Mantiene una colección `registeredDNIs` para búsquedas rápidas
3. Impide registros duplicados mediante reglas de seguridad
4. Valida el formato y longitud del DNI

## Cambio entre Firebase Real y Emuladores

### Para desarrollo local con emuladores:

1. Asegúrate de que tu archivo `.env.local` tenga la configuración de emuladores:

```
NEXT_PUBLIC_USE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pergamino-dev
NEXT_PUBLIC_FIREBASE_API_KEY=dev
# ... demás configuración de emuladores
```

2. Inicia los emuladores de Firebase:

```bash
firebase emulators:start
```

3. Inicia la aplicación normalmente con:

```bash
npm run dev
```

### Para pruebas E2E con Firebase real:

Ejecuta el script `run-full-test.ps1`, que creará automáticamente un archivo `.env.e2e` con la configuración para Firebase real, sin modificar tu entorno de desarrollo local.

## Solución de problemas

### Problemas comunes con Firebase Real

1. **Error de autenticación**: Verifica que `service-account.json` sea válido y se encuentre en la raíz del proyecto
2. **Error de permisos**: Asegúrate de que las reglas de Firestore estén configuradas correctamente
3. **Error de registro**: Verifica la conexión a Firebase y que el usuario admin no exista ya

### Problemas comunes con Emuladores

1. **Conexión rechazada**: Verifica que los emuladores estén en ejecución (`firebase emulators:start`)
2. **Puertos incorrectos**: Asegúrate de que los puertos configurados en `.env.local` coinciden con los que usan los emuladores
3. **Datos no persistentes**: Los emuladores no guardan datos entre ejecuciones por defecto

### Problemas generales

1. **Error de rutas**: Asegúrate de ejecutar los comandos desde el directorio correcto. Algunos comandos deben ejecutarse desde la raíz del proyecto, otros desde `apps/admin-web`
2. **Error de Next.js**: Si aparece un error sobre una ruta duplicada como `apps/admin-web/apps/admin-web`, corrige la ruta de inicio del servidor en el script
3. **Configuración de variables**: Verifica que las variables `NEXT_PUBLIC_USE_EMULATORS` y demás estén correctamente configuradas en el archivo correspondiente

### Diagnóstico de problemas de autenticación

Si las pruebas de login fallan:
- Verifica que los selectores `data-testid` estén correctamente implementados en la página de login
- Comprueba que la redirección post-login esté configurada en el Provider
- Asegúrate de que el usuario admin existe en la plataforma que estás usando (real o emulador)

Para más información, consulta la documentación de Firebase Authentication y Firestore.

## Notas adicionales

- Las pruebas de login real pueden mostrar resultados inconsistentes debido a tiempos de espera o problemas de conectividad. Si fallan, intenta ejecutarlas nuevamente.
- Algunas pruebas como la de navegación están diseñadas para proporcionar información y no necesariamente fallarán si el sidebar no se encuentra. Esto es para facilitar el desarrollo y depuración.
- Para crear un índice para la validación óptima de DNIs únicos, ve a la consola de Firebase > Firestore > Índices y crea un índice para la colección "registeredDNIs".