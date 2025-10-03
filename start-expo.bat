@echo off
echo === PERGAMINO APP MOVIL - EXPO GO ===
echo.

rem Añadir Android SDK a PATH
set PATH=%PATH%;C:\Users\k\AppData\Local\Android\Sdk\platform-tools

echo Iniciando Expo Go. Escanea el codigo QR con la app Expo Go...
cd "C:\Users\k\Documents\Pergamino-app 2"
npx expo start