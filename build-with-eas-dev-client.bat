@echo off
cd %~dp0

echo ===================================================================
echo CREANDO BUILD DE DESARROLLO CON EAS PARA LA APP MÓVIL DE PERGAMINO
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

echo 3. Creando build de desarrollo con EAS...
echo.
echo NOTA: Si esta es la primera vez que construyes este proyecto con EAS,
echo       es posible que se te solicite crear credenciales para Android
echo       o configurar opciones adicionales.
echo.

call npx eas build -p android --profile development --local

echo.
echo ===================================================================
echo PROCESO COMPLETADO. El APK generado se encuentra en la carpeta build/
echo Para ejecutarlo, instálalo en tu dispositivo y luego ejecuta:
echo.
echo   npx expo start --dev-client
echo.
echo para conectarte a la aplicación.
echo ===================================================================