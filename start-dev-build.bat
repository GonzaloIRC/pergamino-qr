@echo off
color 0B
echo =====================================================
echo     PERGAMINO APP - INICIAR DEVELOPMENT BUILD
echo =====================================================
echo.

REM Añadir Android SDK a PATH
set PATH=%PATH%;C:\Users\k\AppData\Local\Android\Sdk\platform-tools

REM Verificar si hay dispositivos conectados
echo Verificando dispositivos conectados...
adb devices
echo.

echo Iniciando servidor de desarrollo para Development Build...
echo.
echo IMPORTANTE: Asegúrate de abrir la app "Pergamino App (Dev)" 
echo en tu dispositivo después de que el servidor inicie.
echo.
echo Presiona Ctrl+C para detener el servidor cuando termines.
echo.
pause
echo.

REM Iniciar el servidor de desarrollo
npx expo start --dev-client