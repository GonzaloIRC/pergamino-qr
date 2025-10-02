@echo off
cd %~dp0

echo ===================================================================
echo ACTUALIZANDO SOLO LA APP MÓVIL EN GITHUB
echo ===================================================================

echo 1. Ejecutando limpieza de archivos sensibles...
call clean-before-commit.bat

echo.
echo 2. Verificando cambios específicamente en la app móvil...
git status -- apps/mobile-expo build-with-eas*.bat backup-android-credentials.bat build-preview-apk.bat build-standalone-eas.bat setup-eas-config.bat start-with-dev-client.bat start-mobile-expo.bat

echo.
echo 3. ¿Deseas continuar con el push de estos cambios a GitHub? (S/N)
set /p continuar=
if /i "%continuar%" neq "S" (
    echo Proceso cancelado por el usuario.
    exit /b
)

echo.
echo 4. Ingresa un mensaje para el commit:
set /p mensaje=

echo.
echo 5. Agregando solo los archivos de la app móvil y scripts relacionados...
git add apps/mobile-expo
git add build-with-eas*.bat
git add backup-android-credentials.bat
git add build-preview-apk.bat
git add build-standalone-eas.bat
git add setup-eas-config.bat
git add start-with-dev-client.bat
git add start-mobile-expo.bat
git add .gitignore

REM Eliminar explícitamente archivos sensibles del staging
echo 6. Eliminando explícitamente archivos sensibles del staging...
git reset -- **/android-credentials*.json
git reset -- **/service-account*.json
git reset -- **/google-services*.json
git reset -- **/*.keystore
git reset -- **/*.jks
git reset -- dev_data/
git reset -- **/node_modules/

echo.
echo 7. Estado actual de los archivos a commitear:
git status

echo.
echo 8. ¿Confirmas que deseas hacer commit y push de estos cambios? (S/N)
set /p confirmar=
if /i "%confirmar%" neq "S" (
    echo Proceso cancelado por el usuario.
    exit /b
)

echo.
echo 9. Realizando commit...
git commit -m "%mensaje%"

echo.
echo 10. Realizando push a la rama actual...
for /f "tokens=*" %%a in ('git branch --show-current') do set rama=%%a
git push origin %rama%

echo.
echo ===================================================================
echo PROCESO COMPLETADO
echo ===================================================================