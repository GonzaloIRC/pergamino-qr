# Pergamino App - Versión TrackingTable

## Descripción
Aplicación móvil completa para fidelización de clientes en restaurantes, con roles Cliente, Mesero y Admin. Sistema completo de puntos, campañas y gestión de mesas.

## Estado Actual del Proyecto

### Milestone 0 (Completo)
✅ Implementación de roles (Cliente, Mesero, Admin)
✅ Configuración base de Firebase
✅ Reglas de seguridad en Firestore implementadas
✅ Correcciones de imports y configuración

### Milestone 1 (En Desarrollo)
🔄 Escáner QR para clientes
🔄 Registro completo de clientes
🔄 Sistema de roles con autenticación mejorada
🔄 Panel administrador para gestión de clientes

## Estructura del Proyecto
### Cliente
- `screens/cliente/QRScanner.js`: Escaneo de códigos QR de mesas
- `screens/auth/RegisterClient.js`: Registro completo de clientes

### Mesero
- `screens/mesero/ValidarQR.js`: Verificación de clientes en mesa
- `screens/mesero/RegistrarConsumo.js`: Registro de consumos con cálculo de puntos
- `components/auth/PINAccess.js`: Acceso por PIN para meseros

### Admin
- `screens/admin/AdminDashboard.js`: Panel principal de administración
- `screens/admin/CampanasScreen.js`: CRUD completo de campañas de fidelización
- `screens/admin/GenerarQRScreen.js`: Generador de códigos QR para mesas

### Seguridad y Configuración
- `firebase/firestore.rules`: Reglas de seguridad de Firestore
- `services/firebaseClient.js`: Cliente Firebase configurado
- `services/authService.js`: Servicio de autenticación

## Firebase
Colecciones implementadas con seguridad basada en roles:
- `clientes`: { nombre, telefono, email, mesa, puntos, fechaRegistro, estado, rol }
- `campañas`: { nombre, descripcion, puntosRequeridos, premio, activa, fechas }
- `consumos`: { clienteId, mesa, productos, total, puntosGanados, fecha, mesero }
- `usuarios`: { uid, email, rol, createdAt }

## Características Implementadas
✅ Sistema de autenticación con roles
✅ Reglas de seguridad en Firestore
✅ Importaciones Firebase estandarizadas
✅ Estructura de proyecto mejorada
✅ Configuración de Babel optimizada

## Próximas Características (M1)
🔜 Escáner QR mejorado para clientes y meseros
🔜 Registro completo de clientes con validación
🔜 Sistema de puntos (1 punto por cada $1000)
🔜 Gestión de clientes en panel de administración
🔜 Sistema de autenticación mejorado

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

## Documentación
- `docs/M1_ALCANCE.md`: Descripción detallada del alcance de M1
- `docs/M1_PLAN_IMPLEMENTACION.md`: Plan de implementación para M1
- `docs/M1_GUIA_TECNICA.md`: Guía técnica para desarrolladores
- `AGENT_AUDIT.md`: Auditoría viva de seguridad y calidad del proyecto

## Seguridad
- Implementadas reglas de seguridad en Firestore basadas en roles
- PIN temporal para mesero/admin: `1234` (será reemplazado por autenticación completa)

## Notas
- Las campañas pueden personalizarse desde Firebase o más adelante mediante panel web.
- Para consultas técnicas, revisar la documentación en la carpeta `docs/`
