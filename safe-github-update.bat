@echo off
cd %~dp0

echo ===================================================================
echo ACTUALIZANDO REPOSITORIO DE FORMA SEGURA
echo ===================================================================

echo 1. Ejecutando limpieza de archivos sensibles...
call clean-before-commit.bat

echo.
echo 2. ¿Deseas continuar con el push a GitHub? (S/N)
set /p continuar=
if /i "%continuar%" neq "S" (
    echo Proceso cancelado por el usuario.
    exit /b
)

echo.
echo 3. Ingresa un mensaje para el commit:
set /p mensaje=

echo.
echo 4. Agregando archivos modificados (excluyendo sensibles)...
git add .

REM Eliminar explícitamente archivos sensibles del staging
echo 5. Eliminando explícitamente archivos sensibles del staging...
git reset -- **/*credential*.json
git reset -- **/*secret*.json
git reset -- **/*key*.json
git reset -- **/*token*.json
git reset -- **/service-account*.json
git reset -- **/google-services*.json
git reset -- **/*.keystore
git reset -- **/*.jks
git reset -- dev_data/
git reset -- .env.*

echo.
echo 6. Estado actual del repositorio:
git status

echo.
echo 7. ¿Confirmas que deseas hacer commit y push de estos cambios? (S/N)
set /p confirmar=
if /i "%confirmar%" neq "S" (
    echo Proceso cancelado por el usuario.
    exit /b
)

echo.
echo 8. Realizando commit...
git commit -m "%mensaje%"

echo.
echo 9. Realizando push a la rama actual...
for /f "tokens=*" %%a in ('git branch --show-current') do set rama=%%a
git push origin %rama%

echo.
echo ===================================================================
echo PROCESO COMPLETADO
echo ===================================================================