# M1: Componentes Core para Pergamino App

Este PR implementa los componentes básicos para la fase M1 de Pergamino App, incluyendo el sistema de autenticación mejorado, escáner de QR y transacciones atómicas.

## Componentes implementados

### 1. Sistema de autenticación robusto
- `src/context/AuthContext.js`: Contexto de autenticación con soporte para roles y persistencia
- `src/navigation/RouteGuards.js`: Componentes de protección de rutas (RequireAuth y RequireRole)
- `src/services/authUtils.js`: Utilidades para pruebas y autenticación

### 2. Escáner de QR mejorado
- `src/components/BarcodeScanner/Scanner.js`: Componente reutilizable para escaneo con control de cooldown
- `src/components/BarcodeScanner/index.js`: Punto de entrada para el componente
- `src/screens/main/ScannerScreen.js`: Pantalla que implementa el escáner

### 3. Sistema de transacciones
- `src/services/transactions.js`: Implementación de transacciones atómicas con Firestore
- `src/utils/qr.js`: Utilidades para procesamiento de códigos QR

### 4. Utilidades y herramientas
- `scripts/verify-project.js`: Script para verificar la configuración del proyecto
- `scripts/seedAdminRole.js`: Script para asignar roles administrativos

## Mejoras implementadas
- **Transacciones atómicas**: Garantizan que las operaciones de canje y acumulación sean consistentes
- **Control de cooldown**: Evita múltiples escaneos accidentales del mismo código QR
- **Validación robusta**: Verificación completa de estados y permisos
- **Emuladores**: Configuración automática para desarrollo local
- **Herramientas de desarrollo**: Scripts para verificación y configuración

## Pruebas
Se han implementado pruebas unitarias para:
- Procesamiento de códigos QR
- Transacciones atómicas

## Instrucciones de prueba
1. Instalar dependencias: `npm ci`
2. Iniciar emuladores: `npm run emulators:start`
3. Ejecutar la aplicación: `npx expo start -c`
4. Para asignar rol admin: `node scripts/seedAdminRole.js <UID>`

## Screenshots
*[Se añadirán capturas de pantalla de las principales funcionalidades]*

## Checklist
- [x] Componente de Scanner con debounce
- [x] Contexto de Auth con roles
- [x] RouteGuards para protección de rutas
- [x] Transacciones atómicas para operaciones
- [x] Scripts de utilidad para desarrollo
- [x] Pruebas unitarias básicas
