@echo off
cd %~dp0

echo ===================================================================
echo CREANDO BUILD SEPARADO CON EAS - ENFOQUE DIRECTO
echo ===================================================================

echo 1. Creando directorio temporal para el build...
if not exist "eas-temp" mkdir "eas-temp"
cd eas-temp

echo 2. Copiando archivos necesarios desde mobile-expo...
if not exist "assets" mkdir "assets"
xcopy "..\assets\icon.png" "assets\" /Y
xcopy "..\assets\splash.png" "assets\" /Y
xcopy "..\assets\adaptive-icon.png" "assets\" /Y
xcopy "..\assets\favicon.png" "assets\" /Y

echo 3. Creando archivos de configuración...

echo {^
  "expo": {^
    "name": "PergaminoApp",^
    "slug": "pergamino-app-mobile",^
    "version": "1.0.0",^
    "orientation": "portrait",^
    "icon": "./assets/icon.png",^
    "userInterfaceStyle": "light",^
    "splash": {^
      "image": "./assets/splash.png",^
      "resizeMode": "contain",^
      "backgroundColor": "#ffffff"^
    },^
    "assetBundlePatterns": ["**/*"],^
    "ios": {^
      "supportsTablet": true,^
      "bundleIdentifier": "com.pergamino.appmobile"^
    },^
    "android": {^
      "adaptiveIcon": {^
        "foregroundImage": "./assets/adaptive-icon.png",^
        "backgroundColor": "#ffffff"^
      },^
      "package": "com.pergamino.appmobile",^
      "permissions": [^
        "android.permission.CAMERA",^
        "android.permission.RECORD_AUDIO"^
      ]^
    },^
    "web": {^
      "favicon": "./assets/favicon.png"^
    },^
    "plugins": [^
      ["expo-camera", {^
        "cameraPermission": "Permite a PergaminoApp acceder a tu cámara para escanear códigos QR."^
      }]^
    ],^
    "extra": {^
      "eas": {^
        "projectId": "be1c9412-6aba-4a2d-b9d9-76c94c5302ad"^
      }^
    },^
    "owner": "gonzaloirc"^
  }^
} > app.json

echo {^
  "cli": {^
    "version": "^>= 3.21.0",^
    "appVersionSource": "remote"^
  },^
  "build": {^
    "development": {^
      "developmentClient": true,^
      "distribution": "internal",^
      "android": {^
        "buildType": "apk"^
      },^
      "env": {^
        "EXPO_PUBLIC_APP_ENV": "development"^
      }^
    }^
  }^
} > eas.json

echo {^
  "name": "pergamino-app-mobile",^
  "version": "1.0.0",^
  "main": "index.js",^
  "dependencies": {^
    "expo": "~54.0.0",^
    "expo-dev-client": "~6.0.0",^
    "expo-camera": "~17.0.0",^
    "react": "19.0.0",^
    "react-native": "0.79.0",^
    "react-native-reanimated": "~3.17.0"^
  }^
} > package.json

echo import { registerRootComponent } from 'expo';^

const App = () => {^
  return null;^
};^

registerRootComponent(App); > index.js

echo module.exports = function(api) {^
  api.cache(true);^
  return {^
    presets: ['babel-preset-expo'],^
    plugins: ['react-native-reanimated/plugin']^
  };^
}; > babel.config.js

echo 4. Instalando dependencias mínimas...
call npm install --legacy-peer-deps expo expo-dev-client expo-camera

echo 5. Verificando sesión en EAS...
call npx eas whoami
if %ERRORLEVEL% NEQ 0 (
    echo Por favor, inicia sesión en tu cuenta de Expo:
    call npx eas login
)

echo 6. Creando build de desarrollo con EAS...
echo.
echo NOTA: Este proceso enviará el proyecto a los servidores de EAS para su construcción.
echo       Una vez completado, podrás descargar el APK desde el enlace proporcionado.
echo.

call npx eas build --platform android --profile development --non-interactive

echo.
echo ===================================================================
echo PROCESO INICIADO. Una vez que el build termine en los servidores de EAS,
echo podrás descargarlo desde el enlace que se te proporcionará. Después de instalarlo, ejecuta:
echo.
echo   cd apps\mobile-expo
echo   npx expo start --dev-client
echo.
echo para conectarte a la aplicación usando la configuración completa.
echo ===================================================================

echo 7. Limpiando archivos temporales...
cd ..
REM No eliminamos la carpeta temp para mantener un registro del build