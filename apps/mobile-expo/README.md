# Pergamino App Mobile

## Configuración del Proyecto

Esta carpeta contiene la versión independiente de la app móvil de Pergamino, configurada para usar:

- Expo SDK 54
- React Native 0.81.0
- react-native-reanimated 3.6.1
- Otras dependencias compatibles específicamente seleccionadas

## Estructura del Proyecto

La aplicación está organizada de la siguiente manera:

- `App.js` - El punto de entrada principal que configura la aplicación
- `components/` - Componentes reutilizables específicos de la interfaz móvil
- `utils/` - Utilidades y helpers para la app móvil

## Cómo ejecutar la aplicación

### Opción 1: Usando Expo Go

Para desarrollar y probar rápidamente usando Expo Go:

1. Asegúrate de tener instalada la aplicación Expo Go en tu dispositivo móvil
2. Desde la raíz del proyecto, ejecuta:

```bash
./start-mobile-expo.bat
```

3. Escanea el código QR que aparece en la consola o en la página web que se abre

### Opción 2: Build local de desarrollo

Para crear un build local de desarrollo que puedes instalar directamente en tu dispositivo:

1. Desde la raíz del proyecto, ejecuta:

```bash
./create-mobile-dev-build.bat
```

2. Una vez completado el proceso, encontrarás el archivo APK que puedes instalar en tu dispositivo Android

### Opción 3: Build con EAS Development Client (recomendado)

Para crear un build nativo más estable usando EAS (Expo Application Services):

1. Desde la raíz del proyecto, ejecuta:

```bash
./build-with-eas-dev-client.bat
```

2. Sigue las instrucciones para iniciar sesión en EAS si es necesario
3. Una vez que el build esté listo, descárgalo e instálalo en tu dispositivo
4. Para conectarte a tu servidor de desarrollo, ejecuta:

```bash
./start-with-dev-client.bat
```

5. Abre la aplicación en tu dispositivo y escanea el QR code o conéctate manualmente

## Notas importantes

- Esta configuración está diseñada para trabajar independientemente del panel web de administración
- Se han configurado overrides específicos en el package.json para garantizar la compatibilidad entre dependencias
- El directorio utiliza rutas relativas para acceder a los assets y código compartido desde la raíz del proyecto