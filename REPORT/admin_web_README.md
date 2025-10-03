# Pergamino Admin Panel

Panel de administraciÃ³n web para Pergamino App, desarrollado con Next.js y Firebase.

## CaracterÃ­sticas

- AutenticaciÃ³n con Firebase (Email/Password)
- ProtecciÃ³n de rutas por rol admin
- GestiÃ³n de clientes, beneficios, seriales y ajustes
- Historial con filtros avanzados
- ExportaciÃ³n e importaciÃ³n de datos en CSV

## Requisitos previos

- Node.js 18.x o superior
- Firebase project configurado
- Cuenta con rol admin en Firebase

## ConfiguraciÃ³n

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

## InstalaciÃ³n

```bash
npm install
```

## EjecuciÃ³n

### Desarrollo

```bash
npm run dev
```

### ProducciÃ³n

```bash
npm run build
npm start
```

## Ãndices de Firestore

El proyecto requiere los siguientes Ã­ndices en Firestore:

1. **Historial** (compuesto):
   - tipo (ascendente)
   - dni (ascendente)
   - ts (descendente)

2. **BeneficioSeriales** (compuesto):
   - beneficioId (ascendente)
   - estado (ascendente)

3. **Historial** (simple):
   - ts (descendente)

Puedes crear estos Ã­ndices manualmente en la consola de Firebase o usar el archivo `firestore.indexes.json` incluido en el proyecto.

## Pruebas de funcionalidad

### AutenticaciÃ³n

1. Accede a `http://localhost:3000`
2. Ingresa con un usuario que tenga el rol 'admin' asignado en la colecciÃ³n `roles/{uid}`

### MÃ³dulo de Serials

1. Navega a "Serials"
2. Utiliza el formulario para emitir 10 seriales
3. Verifica que aparecen en Firestore
4. Exporta los seriales a CSV y verifica que el archivo sea correcto
5. (Opcional) Prueba la importaciÃ³n de seriales desde CSV

### MÃ³dulo de History

1. Canjea un serial desde la app mÃ³vil
2. Navega al mÃ³dulo "History" en el panel web
3. Verifica que el canje aparece en el historial
4. Prueba los filtros por tipo, fecha, DNI y serial

### MÃ³dulo de Settings

1. Navega a "Settings"
2. Cambia el valor de QR_TTL_SECONDS (por ejemplo, de 30 a 10)
3. Verifica en la app mÃ³vil que el QR se renueva mÃ¡s rÃ¡pido

### MÃ³dulos de Clients y Benefits

1. Crea un nuevo cliente y un nuevo beneficio
2. Verifica que aparecen correctamente en los listados
3. Prueba editar y eliminar registros

## Estructura del proyecto

```
apps/admin-web/
  â”œâ”€â”€ app/
  â”‚   â”œâ”€â”€ (auth)/
  â”‚   â”‚   â””â”€â”€ login/
  â”‚   â”œâ”€â”€ (protected)/
  â”‚   â”‚   â”œâ”€â”€ layout.tsx
  â”‚   â”‚   â”œâ”€â”€ dashboard/
  â”‚   â”‚   â”œâ”€â”€ clients/
  â”‚   â”‚   â”œâ”€â”€ benefits/
  â”‚   â”‚   â”œâ”€â”€ serials/
  â”‚   â”‚   â”œâ”€â”€ history/
  â”‚   â”‚   â””â”€â”€ settings/
  â”‚   â”œâ”€â”€ lib/
  â”‚   â”‚   â”œâ”€â”€ firebase.ts
  â”‚   â”‚   â”œâ”€â”€ auth.tsx
  â”‚   â”‚   â”œâ”€â”€ roleGuard.ts
  â”‚   â”‚   â”œâ”€â”€ firestore.ts
  â”‚   â”‚   â”œâ”€â”€ csv.ts
  â”‚   â”‚   â””â”€â”€ settings.ts
  â”‚   â”œâ”€â”€ components/
  â”‚   â”œâ”€â”€ globals.css
  â”‚   â”œâ”€â”€ layout.tsx
  â”‚   â””â”€â”€ page.tsx
  â”œâ”€â”€ public/
  â”œâ”€â”€ .env.local.example
  â”œâ”€â”€ firestore.indexes.json
  â”œâ”€â”€ package.json
  â””â”€â”€ tsconfig.json
```

## Notas de seguridad

- Este panel estÃ¡ diseÃ±ado para ser accedido ÃšNICAMENTE por usuarios con rol 'admin'
- La aplicaciÃ³n verifica el rol del usuario en la colecciÃ³n `roles/{uid}`
- No contiene secretos en el cÃ³digo, todos se manejan mediante variables de entorno
- Implementa protecciÃ³n en las rutas para evitar accesos no autorizados
