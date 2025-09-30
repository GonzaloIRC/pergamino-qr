@echo off
cd %~dp0

echo ===================================================================
echo CREANDO BUILD DE PREVIEW CON EAS
echo ===================================================================

cd apps\mobile-expo

echo 1. Verificando sesión en EAS...
call npx eas whoami
if %ERRORLEVEL% NEQ 0 (
    echo Por favor, inicia sesión en tu cuenta de Expo:
    call npx eas login
)

echo 2. Creando build de preview con EAS...
echo.
echo NOTA: Este proceso enviará el proyecto a los servidores de EAS para su construcción.
echo       Una vez completado, podrás descargar el APK desde el enlace proporcionado.
echo.

call npx eas build -p android --profile preview

echo.
echo ===================================================================
echo BUILD INICIADO
echo ===================================================================
echo.
echo Una vez que el build termine, podrás descargar el APK desde el enlace
echo proporcionado por EAS. Instala el APK en tu dispositivo directamente
echo o utilizando adb:
echo.
echo   adb install ruta/al/archivo.apk
echo.
echo ===================================================================