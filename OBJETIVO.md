# Objetivo del Repositorio

## Propósito Principal

**Pergamino QR** es una aplicación móvil de fidelización de clientes para restaurantes y cafeterías, desarrollada con React Native y Expo. El sistema permite a los establecimientos gestionar programas de beneficios mediante códigos QR, ofreciendo una experiencia fluida tanto para el personal como para los clientes.

## Problema que Resuelve

Los restaurantes necesitan una forma simple y efectiva de:
- Fidelizar clientes mediante programas de beneficios
- Registrar y rastrear consumos y acumulación de puntos
- Gestionar beneficios canjeables (cupones, promociones, descuentos)
- Proporcionar una experiencia digital moderna sin hardware costoso

## Usuarios Objetivo

La aplicación está diseñada para tres tipos de usuarios:

1. **Clientes**: Escanean códigos QR para acumular puntos y canjear beneficios
2. **Meseros/Personal**: Validan códigos QR y registran consumos
3. **Administradores**: Gestionan clientes, campañas, beneficios y obtienen analíticas

## Funcionalidades Principales

### Core (M1 - Base)
- ✅ Autenticación multi-rol (Email/Password + Anónima)
- ✅ Escaneo de códigos QR con dos formatos:
  - `BNF:{serial}` → Canje de beneficios
  - `APP:{dni}:{nonce}` → Acumulación de puntos
- ✅ Gestión básica de clientes (alta por DNI, búsqueda en tiempo real)
- ✅ Sistema de transacciones con prevención de duplicados
- ✅ Inicialización de datos demo para desarrollo

### Avanzadas (M2 - Core)
- 🔄 Sistema de beneficios avanzado con categorización
- 🔄 Gestión de usuarios multi-rol con perfiles detallados
- 🔄 Notificaciones in-app y push básicas
- 🔄 Funcionalidad offline con sincronización
- 🔄 Temas personalizables y mejoras de UX

### Complementarias (M3 - Analytics)
- 📋 Panel de analíticas con KPIs
- 📋 Sistema de campañas y promociones
- 📋 Integración con sistemas POS externos
- 📋 Seguridad avanzada con Firebase App Check
- 📋 Optimizaciones de rendimiento

**Leyenda**: ✅ Completado | 🔄 En desarrollo | 📋 Planificado

## Stack Tecnológico

- **Framework**: Expo SDK 53.0.22
- **Base**: React Native 0.79.5
- **Backend**: Firebase (Firestore + Authentication)
- **Navegación**: React Navigation v6
- **Escaneo**: expo-camera
- **Estado**: Context API + Reducers
- **Entorno**: Node.js v20.x (LTS)

## Arquitectura

La aplicación sigue una arquitectura modular organizada por roles:

```
src/
├── components/        # Componentes reutilizables
├── context/          # Contextos React (Auth, Data, Theme)
├── navigation/       # Configuración de navegación
├── screens/          # Pantallas organizadas por rol
│   ├── cliente/     # Pantallas para clientes
│   ├── mesero/      # Pantallas para personal
│   └── admin/       # Pantallas administrativas
├── services/         # Servicios (Firebase, APIs)
└── utils/           # Funciones utilitarias
```

## Roadmap

### Milestone 0 (✅ Completado)
- Implementación de roles y seguridad
- Reglas de Firestore por rol
- Configuración base de Firebase

### Milestone 1 (🔄 En Desarrollo)
- Autenticación mejorada
- Escáner QR funcional
- Gestión básica de clientes
- Sistema de transacciones

### Milestone 2 (📋 Planificado)
- Beneficios avanzados
- Notificaciones
- Modo offline
- CI/CD básico

### Milestone 3 (📋 Planificado)
- Analíticas
- Campañas
- Integraciones externas
- Optimizaciones

## Documentación Relacionada

Para más detalles sobre cada fase del proyecto, consulta:

- **Visión general**: [README.md](README.md)
- **Decisiones técnicas**: [DECISIONES.md](DECISIONES.md)
- **Alcance M1**: [docs/M1_ALCANCE.md](docs/M1_ALCANCE.md)
- **Alcance M2**: [docs/M2_ALCANCE.md](docs/M2_ALCANCE.md)
- **Alcance M3**: [docs/M3_ALCANCE.md](docs/M3_ALCANCE.md)
- **Guía M2/M3**: [docs/m2-m3-guide.md](docs/m2-m3-guide.md)
- **Historial de cambios**: [CHANGELOG.md](CHANGELOG.md)

## Cómo Empezar

Para desarrolladores que se unen al proyecto:

1. Leer este documento (OBJETIVO.md) para entender el propósito
2. Revisar [README.md](README.md) para instrucciones de instalación
3. Estudiar [DECISIONES.md](DECISIONES.md) para entender las decisiones de arquitectura
4. Consultar el alcance del milestone actual en [docs/](docs/)

## Estado Actual

**Fase actual**: Milestone 1 (M1 - Base)

El proyecto está en desarrollo activo, con la funcionalidad básica de escaneo QR y gestión de clientes implementada. Se está trabajando en completar la autenticación mejorada y el sistema de transacciones robusto.

---

> **Nota**: Este documento sirve como punto de entrada principal para entender el propósito y alcance del proyecto. Para detalles técnicos específicos, consultar la documentación relacionada.
