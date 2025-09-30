@echo off
cd %~dp0
echo Iniciando la aplicación móvil de Pergamino con Expo Go...

cd apps\mobile-expo
echo Instalando dependencias...
call npm install --legacy-peer-deps

echo Iniciando Expo...
call npx expo start