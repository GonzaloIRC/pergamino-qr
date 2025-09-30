@echo off
cd %~dp0
echo Creando build de desarrollo para la app móvil independiente...

cd apps\mobile-expo
echo Instalando dependencias...
call npm install --legacy-peer-deps

echo Creando build de desarrollo con EAS...
call npx eas build --platform android --profile development --local

echo El proceso ha finalizado.