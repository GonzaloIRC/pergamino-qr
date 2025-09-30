@echo off
cd %~dp0

echo ===================================================================
echo CONFIGURACIÓN INICIAL DE EAS PARA PERGAMINO APP
echo ===================================================================

cd apps\mobile-expo

echo 1. Verificando si estás conectado a EAS...
call npx eas whoami
if %ERRORLEVEL% NEQ 0 (
    echo No estás conectado a EAS. Iniciando sesión...
    call npx eas login
) else (
    echo Ya estás conectado a EAS como el usuario mostrado arriba.
)

echo 2. Verificando si el proyecto ya está vinculado a EAS...
call npx eas project:info
if %ERRORLEVEL% NEQ 0 (
    echo El proyecto no está correctamente vinculado. Reconfigurando...
    del app.json.bak 2>nul
    copy app.json app.json.bak
    powershell -Command "(Get-Content -Path app.json) | ForEach-Object { $_ -replace '\"projectId\": \"[^\"]*\"', '\"projectId\": null' } | Set-Content -Path app.json"
    call npx eas init
    if %ERRORLEVEL% NEQ 0 (
        echo Error al inicializar el proyecto. Restaurando app.json...
        copy app.json.bak app.json
        exit /b 1
    )
)

echo 3. Configurando credenciales de Android...
echo.
echo NOTA: A continuación se configurarán las credenciales para tu proyecto Android.
echo       Es posible que se te solicite crear un keystore si no lo has hecho antes.
echo.
call npx eas credentials

echo ===================================================================
echo CONFIGURACIÓN DE EAS COMPLETADA
echo ===================================================================
echo.
echo Ahora puedes usar cualquiera de los siguientes scripts para crear builds:
echo.
echo   build-with-eas-minimal.bat    - Build con configuración mínima
echo   build-standalone-eas.bat      - Build con directorio independiente
echo.
echo Recuerda que después de instalar el APK, debes ejecutar:
echo   cd apps\mobile-expo
echo   npx expo start --dev-client
echo.
echo para conectarte a la aplicación.
echo ===================================================================