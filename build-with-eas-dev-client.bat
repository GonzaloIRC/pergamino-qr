@echo off
cd %~dp0

echo ===================================================================
echo CREANDO BUILD DE DESARROLLO CON EAS PARA LA APP MÓVIL DE PERGAMINO
echo ===================================================================

cd apps\mobile-expo

echo 1. Instalando dependencias...
call npm install --legacy-peer-deps

echo 2. Iniciando sesión en EAS (si es necesario)...
call npx eas whoami
if %ERRORLEVEL% NEQ 0 (
    echo Por favor, inicia sesión en tu cuenta de Expo:
    call npx eas login
)

echo 3. Creando build de desarrollo con EAS...
call npx eas build -p android --profile development --non-interactive

echo ===================================================================
echo PROCESO COMPLETADO. Una vez que el build termine, podrás instalarlo
echo en tu dispositivo y ejecutar:
echo.
echo   npx expo start --dev-client
echo.
echo para conectarte a la aplicación.
echo ===================================================================