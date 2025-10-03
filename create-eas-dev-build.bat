@echo off
setlocal enabledelayedexpansion
color 0B

echo =========================================================================
echo        PERGAMINO APP - DEVELOPMENT BUILD CON EAS (RECOMENDADO)
echo =========================================================================
echo.

REM Verificar si EAS CLI está instalado
echo [1/5] Verificando EAS CLI...
call npx eas --version > nul 2>&1
if %errorlevel% neq 0 (
    echo Instalando EAS CLI...
    call npm install -g eas-cli
    if %errorlevel% neq 0 (
        color 0C
        echo ERROR: No se pudo instalar EAS CLI.
        pause
        exit /b 1
    )
) else (
    echo √ EAS CLI está instalado.
)
echo.

REM Verificar si el usuario está autenticado con Expo
echo [2/5] Verificando autenticación con Expo...
call npx eas whoami > tmp_whoami.txt 2>&1
findstr /C:"Logged in as" tmp_whoami.txt > nul
if %errorlevel% neq 0 (
    echo Necesitas iniciar sesión en tu cuenta de Expo.
    echo Si no tienes una cuenta, puedes crearla en https://expo.dev/signup
    echo.
    call npx eas login
    if %errorlevel% neq 0 (
        color 0C
        echo ERROR: No se pudo iniciar sesión en Expo.
        del tmp_whoami.txt
        pause
        exit /b 1
    )
) else (
    echo √ Sesión activa en Expo.
)
del tmp_whoami.txt
echo.

REM Verificar y actualizar eas.json si es necesario
echo [3/5] Verificando configuración de EAS...
if not exist "eas.json" (
    echo Creando configuración de EAS...
    echo {> eas.json
    echo   "build": {>> eas.json
    echo     "development": {>> eas.json
    echo       "developmentClient": true,>> eas.json
    echo       "distribution": "internal",>> eas.json
    echo       "android": {>> eas.json
    echo         "buildType": "apk">> eas.json
    echo       }>> eas.json
    echo     }>> eas.json
    echo   }>> eas.json
    echo }>> eas.json
    echo √ Configuración EAS creada.
) else (
    echo √ Configuración EAS existente.
)
echo.

REM Crear development build con EAS
echo [4/5] Creando development build con EAS...
echo Este proceso puede tardar varios minutos. EAS compilará la app en servidores remotos.
echo.
call npx eas build --profile development --platform android --local

if %errorlevel% neq 0 (
    echo Intentando sin la opción --local...
    call npx eas build --profile development --platform android
    
    if %errorlevel% neq 0 (
        color 0C
        echo ERROR: No se pudo crear la build con EAS.
        echo.
        echo Intenta revisar:
        echo 1. Tu conexión a internet
        echo 2. La configuración de eas.json
        echo 3. Los logs para más detalles
        pause
        exit /b 1
    )
)
echo √ Build EAS completada.
echo.

REM Instrucciones finales
echo [5/5] Configurando inicio rápido para desarrollo...
echo @echo off > start-dev-eas.bat
echo echo Iniciando servidor de desarrollo para EAS Dev Build... >> start-dev-eas.bat
echo npx expo start --dev-client >> start-dev-eas.bat

echo.
color 0A
echo =========================================================================
echo     ¡DEVELOPMENT BUILD CON EAS CREADA CORRECTAMENTE!
echo =========================================================================
echo.
echo La aplicación ha sido descargada o está disponible para descargar.
echo.
echo Para desarrollar con esta build:
echo 1. Instala la app en tu dispositivo (si aún no lo has hecho)
echo 2. Ejecuta "start-dev-eas.bat" para iniciar el servidor de desarrollo
echo 3. Abre la app en tu dispositivo y escanea el QR o selecciona el servidor
echo.
pause