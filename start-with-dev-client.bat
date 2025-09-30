@echo off
cd %~dp0

echo ===================================================================
echo INICIANDO APP MÓVIL CON DEVELOPMENT CLIENT
echo ===================================================================
echo Asegúrate de tener la app de development client instalada en tu
echo dispositivo y de haber ejecutado build-with-eas-dev-client.bat antes.
echo ===================================================================

cd apps\mobile-expo

echo Iniciando servidor de desarrollo...
call npx expo start --dev-client