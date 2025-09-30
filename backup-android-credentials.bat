@echo off
cd %~dp0

echo ===================================================================
echo BACKUP DE CREDENCIALES DE ANDROID
echo ===================================================================

cd apps\mobile-expo

echo Descargando credenciales de Android...
call npx eas credentials -p android --json --full > android-credentials-backup.json

echo.
echo ===================================================================
echo BACKUP COMPLETADO
echo ===================================================================
echo.
echo Se ha generado el archivo apps\mobile-expo\android-credentials-backup.json
echo.
echo IMPORTANTE: Este archivo contiene información sensible.
echo             Guárdalo en un lugar seguro y NO lo subas al repositorio.
echo ===================================================================