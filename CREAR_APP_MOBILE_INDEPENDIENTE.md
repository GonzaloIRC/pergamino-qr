# Instrucciones para crear un proyecto móvil independiente

Para solucionar permanentemente los problemas de compilación y mantener la app móvil separada
de la admin web, sigue estos pasos para crear un proyecto móvil independiente:

## 1. Crear un nuevo proyecto Expo

```bash
# Crear un nuevo proyecto Expo en una carpeta separada
npx create-expo-app pergamino-mobile-app
cd pergamino-mobile-app

# Instalar dependencias necesarias
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-safe-area-context react-native-screens
npm install firebase react-native-svg react-native-qrcode-svg
npm install react-native-gesture-handler

# Opcional: instalar las versiones compatibles de bibliotecas problemáticas
npm install react-native-reanimated@3.6.1
```

## 2. Copiar archivos de la aplicación móvil existente

Copia estos archivos/directorios de tu proyecto actual a la nueva app:
- `apps/mobile-expo/components/` → `pergamino-mobile-app/components/`
- `apps/mobile-expo/utils/` → `pergamino-mobile-app/utils/`
- Cualquier otro código específico de la app móvil

## 3. Configurar Firebase

Copia la configuración de Firebase al nuevo proyecto:
1. Crea un archivo `firebase/firebaseConfig.js` en el nuevo proyecto
2. Copia la configuración actual en este archivo

## 4. Desarrollar en el proyecto independiente

Este enfoque te permitirá:
- Usar versiones de bibliotecas compatibles con la app móvil
- Evitar conflictos con la app web
- Compilar e instalar en tu dispositivo sin problemas

## 5. Mantener la estructura monorepo para código compartido

Puedes seguir compartiendo código común entre proyectos:
1. Crea un paquete npm para el código compartido
2. Instálalo en ambos proyectos