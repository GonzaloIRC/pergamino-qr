# Instrucciones para usar EAS para desarrollo

EAS (Expo Application Services) te permite crear builds en servidores remotos de Expo,
evitando los problemas de compilación local. Este enfoque es más confiable cuando
hay conflictos de dependencias en tu entorno local.

## Requisitos previos

1. **Cuenta de Expo**: Necesitas una cuenta en [expo.dev](https://expo.dev/signup)
2. **EAS CLI**: Necesitas instalar la herramienta de línea de comandos de EAS

```bash
npm install -g eas-cli
```

## Configuración de EAS

1. **Inicia sesión en tu cuenta de Expo**:
```bash
eas login
```

2. **Crea un archivo `eas.json` en la raíz de tu proyecto**:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

3. **Configura tu proyecto para EAS**:
```bash
eas build:configure
```

## Crear una development build

1. **Inicia la build de desarrollo**:
```bash
eas build --profile development --platform android
```

2. **Espera a que la build termine** (puede tardar unos minutos)

3. **Descarga e instala la APK** en tu dispositivo cuando esté lista

## Desarrollar con la development build

1. **Inicia el servidor de desarrollo**:
```bash
npx expo start --dev-client
```

2. **Abre la app en tu dispositivo** y conéctala al servidor escaneando el QR
   o seleccionando tu servidor de desarrollo

## Ventajas de usar EAS

- Evitas problemas de compilación local
- No necesitas configurar el entorno Android local
- Compilaciones más confiables
- Opción para distribuir fácilmente a testers

Para más información, consulta la [documentación de EAS](https://docs.expo.dev/eas/)