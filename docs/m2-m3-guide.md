# Guía de M2/M3 para Pergamino App

## Objetivos

Este documento define los objetivos, estructura y mejores prácticas para los entregables M2 y M3 del proyecto Pergamino App.

## Estructura del Proyecto

La aplicación sigue una estructura modular:

```
pergamino-app/
├── assets/                 # Recursos estáticos (imágenes, fuentes)
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── context/            # Contextos de React (Auth, Theme)
│   ├── hooks/              # Custom hooks
│   ├── navigation/         # Configuración de React Navigation
│   ├── screens/            # Pantallas de la aplicación
│   ├── services/           # Servicios (Firebase, APIs)
│   ├── utils/              # Funciones utilitarias
├── docs/                   # Documentación
├── REPORT/                 # Informes técnicos
├── App.js                  # Punto de entrada
```

## Calidad del Código

### Linting y Formateo

Utilizamos ESLint y Prettier para mantener consistencia en el código:

- **ESLint**: Configurado en `.eslintrc.js`
- **Prettier**: Configurado en `.prettierrc`

Para ejecutar el linting:

```bash
npm run lint
# o para arreglar automáticamente problemas:
npm run lint:fix
```

### Testing

Utilizamos Jest y React Native Testing Library para pruebas:

- **Pruebas unitarias**: Para componentes y funciones
- **Pruebas de integración**: Para flujos completos

Para ejecutar las pruebas:

```bash
npm test
```

Para generar un reporte de cobertura:

```bash
npm run test:coverage
```

## Convenciones de Código

### Commits

Seguimos la convención de Commits Convencionales:

- `feat:` Nueva característica
- `fix:` Corrección de errores
- `docs:` Solo cambios en documentación
- `style:` Cambios que no afectan el significado del código
- `refactor:` Cambio de código que no corrige un error ni añade una característica
- `perf:` Cambio que mejora el rendimiento
- `test:` Añadir pruebas o corregir existentes
- `build:` Cambios en el sistema de construcción
- `ci:` Cambios en la configuración de CI
- `chore:` Otros cambios que no modifican src o test

### Ramas

Convención para ramas:

- `feature/<nombre>`: Nuevas características
- `fix/<nombre>`: Correcciones de errores
- `docs/<nombre>`: Documentación
- `refactor/<nombre>`: Refactorizaciones

## Entregable M2: Infraestructura

El entregable M2 se enfoca en:

1. **Setup de Firebase**:
   - Configuración de emuladores
   - Autenticación
   - Firestore

2. **Navegación**:
   - Estructura de navegación con React Navigation v6
   - Flujos autenticados/no autenticados

3. **Escaneo de códigos QR**:
   - Componente unificado con expo-camera
   - Manejo de permisos

## Entregable M3: Funcionalidades Principales

El entregable M3 se enfoca en:

1. **Tracking de lotes de café**:
   - Escaneo de códigos QR
   - Registro de datos de trazabilidad
   - Visualización de historial

2. **Gestión de usuario**:
   - Registro y autenticación
   - Perfil de usuario
   - Preferencias

3. **Sincronización offline**:
   - Almacenamiento local
   - Sincronización con Firebase

## Recursos

- [React Navigation](https://reactnavigation.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)
- [ESLint](https://eslint.org/docs/user-guide/getting-started)

## Próximos Pasos

1. Completar implementación de autenticación
2. Implementar escaneo de códigos QR y procesamiento
3. Configurar reglas de Firestore
4. Implementar pantallas principales
5. Añadir pruebas para componentes críticos
