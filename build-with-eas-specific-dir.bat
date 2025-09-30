@echo off
cd %~dp0

echo ===================================================================
echo CREANDO BUILD DESDE DIRECTORIO ESPECÍFICO
echo ===================================================================

echo 1. Creando copia temporal de activos necesarios...
if not exist "apps\mobile-expo\assets" mkdir "apps\mobile-expo\assets"

echo Copiando archivos de assets...
copy "assets\icon.png" "apps\mobile-expo\assets\" /Y
copy "assets\splash.png" "apps\mobile-expo\assets\" /Y
copy "assets\adaptive-icon.png" "apps\mobile-expo\assets\" /Y
copy "assets\favicon.png" "apps\mobile-expo\assets\" /Y

echo 2. Actualizando app.json para usar rutas locales...

cd apps\mobile-expo

echo Modificando app.json temporalmente para build...
powershell -Command "(Get-Content -Path app.json) -replace '\"icon\": \"../../assets/icon.png\"', '\"icon\": \"./assets/icon.png\"' | Set-Content -Path app.json.temp"
powershell -Command "(Get-Content -Path app.json.temp) -replace '\"image\": \"../../assets/splash.png\"', '\"image\": \"./assets/splash.png\"' | Set-Content -Path app.json.temp2"
powershell -Command "(Get-Content -Path app.json.temp2) -replace '\"foregroundImage\": \"../../assets/adaptive-icon.png\"', '\"foregroundImage\": \"./assets/adaptive-icon.png\"' | Set-Content -Path app.json.temp3"
powershell -Command "(Get-Content -Path app.json.temp3) -replace '\"favicon\": \"../../assets/favicon.png\"', '\"favicon\": \"./assets/favicon.png\"' | Set-Content -Path app.json.build"

del app.json.temp
del app.json.temp2
del app.json.temp3

echo 3. Instalando dependencias...
call npm install --legacy-peer-deps

echo 4. Verificando sesión en EAS...
call npx eas whoami
if %ERRORLEVEL% NEQ 0 (
    echo Por favor, inicia sesión en tu cuenta de Expo:
    call npx eas login
)

echo 5. Creando build de desarrollo con EAS...
echo.
echo NOTA: Este proceso enviará el proyecto a los servidores de EAS para su construcción.
echo       Una vez completado, podrás descargar el APK desde el enlace proporcionado.
echo.

call npx eas build -p android --profile development --config=eas.json --local-build-artifact-path=build --non-interactive -p json=app.json.build

echo.
echo ===================================================================
echo PROCESO INICIADO. Una vez que el build termine en los servidores de EAS,
echo podrás descargarlo desde el enlace que se te proporcionará. Después de instalarlo, ejecuta:
echo.
echo   cd apps\mobile-expo
echo   npx expo start --dev-client
echo.
echo para conectarte a la aplicación.
echo ===================================================================

echo 6. Restaurando archivos originales...
del app.json.build

cd ..\..

echo Build process completed.