@echo off
cd %~dp0

echo ===================================================================
echo LIMPIEZA DE ARCHIVOS SENSIBLES ANTES DE COMMIT
echo ===================================================================

echo 1. Limpiando archivos sensibles del directorio...

REM Eliminar archivos de credenciales si existen
if exist "apps\mobile-expo\android-credentials*.json" (
    echo [INFO] Eliminando archivos de credenciales de Android en apps\mobile-expo\
    del /q "apps\mobile-expo\android-credentials*.json"
)

if exist "service-account*.json" (
    echo [INFO] Eliminando service-account.json de la raíz
    del /q "service-account*.json"
)

if exist "android\app\google-services*.json" (
    echo [INFO] Eliminando google-services.json de la carpeta Android
    del /q "android\app\google-services*.json"
)

if exist "apps\admin-web\service-account*.json" (
    echo [INFO] Eliminando service-account.json de admin-web
    del /q "apps\admin-web\service-account*.json"
)

REM Limpiar posibles archivos temporales con tokens
if exist "*temp*token*.json" (
    echo [INFO] Eliminando archivos temporales con tokens
    del /q "*temp*token*.json"
)

echo 2. Verificando archivos que podrían contener información sensible...

echo [INFO] Buscando archivos potencialmente sensibles
echo       (Esta búsqueda puede tardar un momento)

REM Búsqueda de posibles archivos con información sensible
powershell -Command "Get-ChildItem -Path . -Recurse -File -Include *.json, *.js, *.ts, *.env* | Where-Object { $_.Name -like '*key*' -or $_.Name -like '*secret*' -or $_.Name -like '*token*' -or $_.Name -like '*credential*' -or $_.Name -like '*password*' } | ForEach-Object { Write-Output \"ADVERTENCIA: Posible archivo sensible: $($_.FullName)\" }"

echo.
echo 3. Verificando estado de git...

git status

echo.
echo ===================================================================
echo LIMPIEZA COMPLETADA
echo ===================================================================
echo.
echo IMPORTANTE:
echo 1. Revisa cuidadosamente los archivos marcados como "Posible archivo sensible"
echo 2. Verifica que ningún archivo con credenciales esté en la lista para commit
echo 3. Si ves archivos sensibles en el status de git, agrega sus patrones al .gitignore
echo.
echo Para hacer commit de forma segura ahora:
echo   git add . --exclude=*.keystore --exclude=*credential* --exclude=*secret*
echo   git commit -m "Tu mensaje de commit"
echo   git push origin tu-rama
echo ===================================================================