# Plan de Implementación de M1

Este documento detalla el plan paso a paso para implementar el alcance de M1 (Phase1-Base) en el proyecto Pergamino.

## 1. Configuración de Firebase Modular (src/firebase/)

### 1.1 Estructura de directorios
```
src/
└── firebase/
    ├── index.js        # Exportación principal
    ├── config.js       # Configuración de Firebase
    ├── auth.js         # Servicios de autenticación
    ├── firestore.js    # Servicios de Firestore
    ├── storage.js      # Servicios de Storage (opcional)
    └── functions.js    # Funciones específicas (opcional)
```

### 1.2 Tareas
- [ ] Crear estructura de directorios
- [ ] Configurar Firebase con variables de entorno
- [ ] Implementar inicialización modular
- [ ] Verificar compatibilidad con emuladores
- [ ] Probar conexión

## 2. Autenticación

### 2.1 Configuración en Firebase Console
- [ ] Habilitar proveedor Email/Password
- [ ] Habilitar autenticación anónima
- [ ] Configurar reglas de autorización

### 2.2 Implementación en la aplicación
- [ ] Crear componentes de login/registro
- [ ] Implementar manejo de sesión
- [ ] Configurar redirección según rol
- [ ] Probar flujo de autenticación

## 3. Escáner QR con expo-camera

### 3.1 Configuración
- [ ] Instalar dependencias:
  ```bash
  npm install expo-camera
  ```
- [ ] Solicitar permisos de cámara
- [ ] Crear componente base del escáner

### 3.2 Implementación
- [ ] Desarrollar función de escaneo con debounce
- [ ] Implementar controles (torch, foco)
- [ ] Crear entrada manual de seriales
- [ ] Implementar procesamiento de formatos BNF y APP
- [ ] Configurar transacciones Firestore para actualización de estado
- [ ] Implementar validaciones y bloqueos de re-escaneo

## 4. Gestión de Clientes

### 4.1 Modelo de datos
- [ ] Definir esquema de cliente en Firestore
- [ ] Implementar validaciones de DNI único

### 4.2 Interfaz de usuario
- [ ] Crear formulario de alta de clientes
- [ ] Implementar búsqueda en tiempo real
- [ ] Desarrollar vista de lista con onSnapshot
- [ ] Crear vista detallada de cliente
- [ ] Mostrar historial de transacciones

## 5. Inicialización de Datos

- [ ] Verificar funcionamiento de SCRIPTS/seedBeneficioDemo.js
- [ ] Ejecutar script de inicialización
- [ ] Verificar datos creados en Firestore

## 6. Interfaz de Usuario

### 6.1 Tema Pergamino
- [ ] Definir paleta de colores y estilos
- [ ] Implementar tema en React Native Paper
- [ ] Crear pantalla de bienvenida

### 6.2 Navegación
- [ ] Verificar flujos de navegación
- [ ] Implementar guardias de rutas según rol

## 7. Documentación

- [ ] Actualizar README.md
- [ ] Crear CHANGELOG.md
- [ ] Documentar configuración requerida
- [ ] Crear guía de uso básico

## 8. Pruebas

- [ ] Realizar pruebas end-to-end
- [ ] Verificar manejo de errores
- [ ] Probar en dispositivo físico
- [ ] Validar flujo completo

## Cronograma Sugerido

| Tarea | Tiempo Estimado |
|-------|-----------------|
| Configuración Firebase | 1 día |
| Autenticación | 1 día |
| Escáner QR | 2 días |
| Gestión de Clientes | 2 días |
| Inicialización de Datos | 0.5 día |
| UI/UX | 1 día |
| Documentación | 0.5 día |
| Pruebas | 1 día |

**Tiempo total estimado:** 9 días laborales
