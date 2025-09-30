@echo off
cd %~dp0

echo ===================================================================
echo PREPARANDO Y CREANDO BUILD DE DESARROLLO CON EAS - ENFOQUE SIMPLIFICADO
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

echo 3. Creando build de desarrollo con EAS usando configuración mínima...
echo.
echo NOTA: Este proceso enviará el proyecto a los servidores de EAS para su construcción.
echo       Una vez completado, podrás descargar el APK desde el enlace proporcionado.
echo.

call npx eas build --platform android --profile development --config=eas-minimal.json --non-interactive

echo.
echo ===================================================================
echo PROCESO INICIADO. Una vez que el build termine en los servidores de EAS,
echo podrás descargarlo desde el enlace que se te proporcionará. Después de instalarlo, ejecuta:
echo.
echo   cd apps\mobile-expo
echo   npx expo start --dev-client
echo.
echo para conectarte a la aplicación.
echo ===================================================================