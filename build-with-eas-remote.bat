@echo off
cd %~dp0

echo ===================================================================
echo PREPARANDO Y CREANDO BUILD DE DESARROLLO CON EAS
echo ===================================================================

cd apps\mobile-expo

echo 1. Instalando dependencias...
call npm install --legacy-peer-deps

echo 2. Verificando sesión en EAS...
call npx eas whoami
if %ERRORLEVEL% NEQ 0 (
    echo Por favor, inicia sesión en tu cuenta de Expo:
    call npx eas login
)

echo 3. Creando archivo de configuración temporal para excluir carpetas problemáticas...
echo {^
  "cli": {^
    "version": "^>= 3.21.0",^
    "appVersionSource": "local",^
    "requireCommit": false^
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
  },^
  "submit": {^
    "production": {^
      "android": {^
        "track": "production",^
        "releaseStatus": "completed"^
      }^
    }^
  },^
  "extends": "eas.json"^
} > eas-temp.json

echo 4. Creando build de desarrollo con EAS usando configuración temporal...
echo.
echo NOTA: Este proceso enviará el proyecto a los servidores de EAS para su construcción.
echo       Una vez completado, podrás descargar el APK desde el enlace proporcionado.
echo.

call npx eas build -p android --profile development --config eas-temp.json

echo.
echo ===================================================================
echo PROCESO INICIADO. Una vez que el build termine en los servidores de EAS,
echo podrás descargarlo desde el enlace que se te proporcionará. Después de instalarlo, ejecuta:
echo.
echo   npx expo start --dev-client
echo.
echo para conectarte a la aplicación.
echo ===================================================================

echo 5. Eliminando archivo de configuración temporal...
del eas-temp.json