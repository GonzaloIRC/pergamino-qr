# Pergamino App - Versión TrackingTable

## Descripción
Aplicación móvil completa para fidelización de clientes en restaurantes, con roles Cliente, Mesero y Admin. Sistema completo de puntos, campañas y gestión de mesas.

## Estructura del Proyecto
### Cliente
- `cliente/QRScanner.js`: Escaneo de códigos QR de mesas
- `RegisterClient.js`: Registro completo de clientes

### Mesero
- `mesero/ValidarQR.js`: Verificación de clientes en mesa
- `mesero/RegistrarConsumo.js`: Registro de consumos con cálculo de puntos
- `components/PINAccess.js`: Acceso por PIN para meseros

### Admin
- `admin/MenuAdmin.js`: Panel principal de administración
- `admin/Campañas.js`: CRUD completo de campañas de fidelización
- `admin/GenerarQR.js`: Generador de códigos QR para mesas

### Navegación
- `navigation/AppNavigator.js`: Sistema de navegación principal

## Firebase
Colecciones implementadas:
- `clientes`: { nombre, telefono, email, mesa, puntos, fechaRegistro, estado }
- `campañas`: { nombre, descripcion, puntosRequeridos, premio, activa, fechas }
- `consumos`: { clienteId, mesa, productos, total, puntosGanados, fecha, mesero }

## Características Implementadas
✅ Escáner QR para clientes y meseros
✅ Registro completo de clientes con validación
✅ Sistema de puntos (1 punto por cada $1000)
✅ Gestión completa de campañas
✅ Registro de consumos con menú rápido
✅ Generador de QR para mesas
✅ Panel de administración
✅ Acceso por PIN para meseros
✅ Interfaz de usuario mejorada

## Cómo ejecutar
1. Instalar dependencias:
```bash
npm install
npx expo install expo-barcode-scanner react-native-qrcode-svg react-native-svg
```

2. Iniciar la app:
```bash
npx expo start
```

## PIN acceso mesero/admin
PIN temporal: `1234`

## Notas
- Para producción se recomienda reemplazar el PIN por autenticación real.
- Las campañas pueden personalizarse desde Firebase o más adelante mediante panel web.
# Pergamino App - Versión TrackingTable

## Descripción
Aplicación móvil completa para fidelización de clientes en restaurantes, con roles Cliente, Mesero y Admin. Sistema completo de puntos, campañas y gestión de mesas.

## Estructura del Proyecto
### Cliente
- `cliente/QRScanner.js`: Escaneo de códigos QR de mesas
- `RegisterClient.js`: Registro completo de clientes

### Mesero
- `mesero/ValidarQR.js`: Verificación de clientes en mesa
- `mesero/RegistrarConsumo.js`: Registro de consumos con cálculo de puntos
- `components/PINAccess.js`: Acceso por PIN para meseros

### Admin
- `admin/MenuAdmin.js`: Panel principal de administración
- `admin/Campañas.js`: CRUD completo de campañas de fidelización
- `admin/GenerarQR.js`: Generador de códigos QR para mesas

### Navegación
- `navigation/AppNavigator.js`: Sistema de navegación principal

## Firebase
Colecciones implementadas:
- `clientes`: { nombre, telefono, email, mesa, puntos, fechaRegistro, estado }
- `campañas`: { nombre, descripcion, puntosRequeridos, premio, activa, fechas }
- `consumos`: { clienteId, mesa, productos, total, puntosGanados, fecha, mesero }

## Características Implementadas
✅ Escáner QR para clientes y meseros
✅ Registro completo de clientes con validación
✅ Sistema de puntos (1 punto por cada $1000)
✅ Gestión completa de campañas
✅ Registro de consumos con menú rápido
✅ Generador de QR para mesas
✅ Panel de administración
✅ Acceso por PIN para meseros
✅ Interfaz de usuario mejorada

## Cómo ejecutar
1. Instalar dependencias:
```bash
npm install
npx expo install expo-barcode-scanner react-native-qrcode-svg react-native-svg
```

2. Iniciar la app:
```bash
npx expo start
```

## PIN acceso mesero/admin
PIN temporal: `1234`

## Notas
- Para producción se recomienda reemplazar el PIN por autenticación real.
- Las campañas pueden personalizarse desde Firebase o más adelante mediante panel web.
