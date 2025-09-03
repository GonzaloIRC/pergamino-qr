# Matriz de Compatibilidad de Versiones

Este documento mantiene un registro de las versiones compatibles de las principales dependencias del proyecto.

## Versiones Actuales

| Componente          | Versión       | Notas de Compatibilidad                                    |
|---------------------|---------------|-----------------------------------------------------------|
| Expo SDK            | 53.0.22       | Compatible con React Native 0.79.x                        |
| React Native        | 0.79.5        | Base actual del proyecto                                  |
| Node.js             | 20.x (LTS)    | Recomendado para desarrollo y CI                          |
| Firebase JS SDK     | 10.x          | Compatible con la configuración actual                     |

## Dependencias Críticas

| Dependencia                  | Versión Compatible | Restricciones                                         |
|------------------------------|-------------------|----------------------------------------------------|
| react-native-reanimated      | 3.6.x            | Requiere configuración específica en babel.config.js |
| expo-barcode-scanner         | 12.7.x           | Compatible con Expo SDK 53                          |
| @react-navigation/native     | 6.x              | Utilizada para la navegación principal              |
| expo-dev-client             | 3.3.x            | Para desarrollo con cliente personalizado           |

## Actualizaciones Planificadas

| Componente          | Versión Actual | Versión Objetivo | Notas                                    |
|---------------------|---------------|-----------------|------------------------------------------|
| Expo SDK            | 53.0.22       | 54.x           | Requiere actualización de RN a 0.80.x     |
| React Native        | 0.79.5        | 0.80.x         | Nueva arquitectura (Fabric)               |

## Problemas Conocidos de Compatibilidad

1. **React Native Reanimated** - Debe ser el último plugin en el array de plugins en babel.config.js
2. **Firebase Emuladores** - Requieren configuración especial para trabajar con Expo
3. **Expo EAS** - La configuración local debe sincronizarse con la configuración de EAS para builds consistentes
