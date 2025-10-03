@echo off
echo =======================================
echo    PERGAMINO APP - DESARROLLO EXPO GO
echo =======================================
echo.
echo Este script inicia la aplicación en modo Expo Go,
echo que evita los problemas de compilación nativa.
echo.
echo Asegúrate de tener instalada la app "Expo Go" 
echo en tu dispositivo Android y estar en la misma red WiFi.
echo.
echo Presiona cualquier tecla para continuar...
pause > nul

REM Añadir Android SDK a PATH
set PATH=%PATH%;C:\Users\k\AppData\Local\Android\Sdk\platform-tools

REM Mostrar dispositivos conectados
echo.
echo Dispositivos conectados:
adb devices
echo.
echo Iniciando Expo Go...
echo.

cd "C:\Users\k\Documents\Pergamino-app 2"
npx expo start