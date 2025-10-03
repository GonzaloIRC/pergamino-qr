# Pergamino QR

## Ejecutar la aplicación móvil con Expo Go

Este proyecto incluye la aplicación móvil de Pergamino. Para probarla con Expo Go sin necesidad de compilar código nativo, sigue estos pasos:

1. **Clona el repositorio** y navega hasta la raíz del proyecto.
2. **Instala las dependencias**:
   ```bash
   npm install
   ```
3. **Limpia los cachés** para evitar conflictos con dependencias anteriores:
   ```bash
   npx expo start -c
   ```
4. **Inicia el servidor de desarrollo**:
   ```bash
   npx expo start
   ```
   Se abrirá el panel de Expo. Escanea el código QR con la app **Expo Go** en un dispositivo físico para cargar la app.

## Resolución de problemas comunes

- Si aparecen errores de versiones incompatibles de React Native o React, verifica que las versiones estén fijadas en la sección `overrides` de `package.json`. Ejecuta `npm install` nuevamente para asegurarte de que se respeten las versiones bloqueadas.
- Si la app no se inicia o ves un error de bundler, ejecuta `expo doctor` para diagnosticar el entorno y sigue las recomendaciones. También puedes borrar la caché de Metro ejecutando `npx expo start -c` y, en último caso, eliminar la carpeta `node_modules` y reinstalar las dependencias.

## Scripts útiles

- `npm run android` – arranca la app en un emulador de Android (requiere Android Studio configurado).
- `npm run ios` – arranca la app en un simulador de iOS (solo disponible en macOS).
- `npm run start` – alias de `expo start` para arrancar el servidor de desarrollo.

Para más información sobre la estructura del proyecto y las reglas de seguridad de Firestore, consulta los archivos de la carpeta `firebase` y el documento `SECURITY.md`.