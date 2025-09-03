# Auditoría del Agente

## expo-doctor

```
PS C:\Users\k\Documents\Pergamino-app 2> npx expo-doctor
env: load .env.local
env: export EXPO_PUBLIC_USE_EMULATORS EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT EXPO_PUBLIC_FIRESTORE_EMULATOR_HOST EXPO_PUBLIC_FIRESTORE_EMULATOR_PORT EXPO_PUBLIC_FIREBASE_PROJECT_ID EXPO_PUBLIC_FIREBASE_API_KEY EXPO_PUBLIC_FIREBASE_APP_ID EXPO_PUBLIC_FIREBASE_SENDER_ID EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN EXPO_PUBLIC_FIREBASE_BUCKET                                                                                         
16/17 checks passed. 1 checks failed. Possible issues detected:
Use the --verbose flag to see more details about passed checks.

✖ Check for app config fields that may not be synced in a non-CNG project
This project contains native project folders but also has native configuration properties in app.config.ts, indicating it is configured to use Prebuild. When the android/ios folders are present, if you don't run prebuild in your build pipeline, the following properties will not be synced: orientation, userInterfaceStyle, backgroundColor, splash, ios, android, plugins.                          

1 check failed, indicating possible issues with the project.
```

## Riesgos Identificados y Mitigaciones

### 1. Matriz de Versiones Incompatibles

**Riesgo**: Incompatibilidad entre versiones de Expo SDK, React Native y dependencias de terceros.

**Mitigaciones**:
1. Mantener un documento de matriz de compatibilidad (ver `agent-context/DOCS/version-matrix.md`) actualizado con cada actualización de dependencias.
2. Implementar verificaciones automáticas de compatibilidad en el flujo CI/CD que alerten sobre posibles conflictos entre versiones.

### 2. Problemas con React Native Reanimated

**Riesgo**: Comportamientos inesperados en animaciones, especialmente después de actualizaciones.

**Mitigaciones**:
1. Asegurar que el plugin de Reanimated esté correctamente configurado en babel.config.js y sea el último plugin en el array.
2. Mantener tests visuales específicos para componentes que utilizan animaciones complejas.

### 3. Prebuilds Inconsistentes

**Riesgo**: Comportamiento diferente entre desarrollo local y builds de producción debido a configuraciones nativas.

**Mitigaciones**:
1. Implementar una rutina de validación de prebuild que verifique la consistencia de los archivos generados.
2. Mantener una suite de smoke tests que se ejecuten tanto en desarrollo como en builds de producción para detectar inconsistencias.

### 4. Configuración Duplicada

**Riesgo**: Inconsistencias entre configuraciones duplicadas en app.config.ts y app.json.

**Mitigaciones**:
1. Centralizar toda la configuración en app.config.ts y eliminar o vaciar app.json.
2. Implementar una verificación en el proceso de build que alerte sobre posibles duplicaciones de configuración.
