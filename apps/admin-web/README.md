# Pergamino Admin Panel

Panel de administración web para Pergamino App, desarrollado con Next.js y Firebase.

## Características

- Autenticación con Firebase (Email/Password)
- Protección de rutas por rol admin
- Gestión de clientes, beneficios, seriales y ajustes
- Historial con filtros avanzados
- Exportación e importación de datos en CSV

## Requisitos previos

- Node.js 18.x o superior
- Firebase project configurado
- Cuenta con rol admin en Firebase

## Configuración

1. Clona el repositorio
2. Copia el archivo `.env.local.example` a `.env.local` y completa las variables de entorno:

```bash
cp .env.local.example .env.local
```

3. Edita el archivo `.env.local` con tus credenciales de Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEFG
```

4. Para desarrollo con emuladores, configura:

```
NEXT_PUBLIC_USE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost
NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT=8080
```

## Instalación

```bash
npm install
```

## Ejecución

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

## Índices de Firestore

El proyecto requiere los siguientes índices en Firestore:

1. **Historial** (compuesto):
   - tipo (ascendente)
   - dni (ascendente)
   - ts (descendente)

2. **BeneficioSeriales** (compuesto):
   - beneficioId (ascendente)
   - estado (ascendente)

3. **Historial** (simple):
   - ts (descendente)

Puedes crear estos índices manualmente en la consola de Firebase o usar el archivo `firestore.indexes.json` incluido en el proyecto.

## Pruebas de funcionalidad

### Autenticación

1. Accede a `http://localhost:3000`
2. Ingresa con un usuario que tenga el rol 'admin' asignado en la colección `roles/{uid}`

### Módulo de Serials

1. Navega a "Serials"
2. Utiliza el formulario para emitir 10 seriales
3. Verifica que aparecen en Firestore
4. Exporta los seriales a CSV y verifica que el archivo sea correcto
5. (Opcional) Prueba la importación de seriales desde CSV

### Módulo de History

1. Canjea un serial desde la app móvil
2. Navega al módulo "History" en el panel web
3. Verifica que el canje aparece en el historial
4. Prueba los filtros por tipo, fecha, DNI y serial

### Módulo de Settings

1. Navega a "Settings"
2. Cambia el valor de QR_TTL_SECONDS (por ejemplo, de 30 a 10)
3. Verifica en la app móvil que el QR se renueva más rápido

### Módulos de Clients y Benefits

1. Crea un nuevo cliente y un nuevo beneficio
2. Verifica que aparecen correctamente en los listados
3. Prueba editar y eliminar registros

## Estructura del proyecto

```
apps/admin-web/
  ├── app/
  │   ├── (auth)/
  │   │   └── login/
  │   ├── (protected)/
  │   │   ├── layout.tsx
  │   │   ├── dashboard/
  │   │   ├── clients/
  │   │   ├── benefits/
  │   │   ├── serials/
  │   │   ├── history/
  │   │   └── settings/
  │   ├── lib/
  │   │   ├── firebase.ts
  │   │   ├── auth.tsx
  │   │   ├── roleGuard.ts
  │   │   ├── firestore.ts
  │   │   ├── csv.ts
  │   │   └── settings.ts
  │   ├── components/
  │   ├── globals.css
  │   ├── layout.tsx
  │   └── page.tsx
  ├── public/
  ├── .env.local.example
  ├── firestore.indexes.json
  ├── package.json
  └── tsconfig.json
```

## Notas de seguridad

- Este panel está diseñado para ser accedido ÚNICAMENTE por usuarios con rol 'admin'
- La aplicación verifica el rol del usuario en la colección `roles/{uid}`
- No contiene secretos en el código, todos se manejan mediante variables de entorno
- Implementa protección en las rutas para evitar accesos no autorizados