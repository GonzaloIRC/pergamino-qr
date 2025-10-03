@echo off
setlocal enabledelayedexpansion
color 0B

echo =========================================================================
echo             PERGAMINO APP - PREPARACIÓN Y DEVELOPMENT BUILD 
echo =========================================================================
echo.

REM Añadir Android SDK a PATH
set PATH=%PATH%;C:\Users\k\AppData\Local\Android\Sdk\platform-tools

REM Verificar dispositivo conectado
echo [1/7] Verificando dispositivo conectado...
adb devices > tmp_devices.txt
type tmp_devices.txt
findstr /C:"device" tmp_devices.txt > nul
if %errorlevel% neq 0 (
    color 0C
    echo ERROR: No se detectó ningún dispositivo Android conectado.
    echo Por favor conecta tu dispositivo y habilita la depuración USB.
    del tmp_devices.txt
    pause
    exit /b 1
)
del tmp_devices.txt
echo √ Dispositivo detectado correctamente.
echo.

REM Actualizar dependencias conflictivas
echo [2/7] Actualizando dependencias conflictivas...
echo Desinstalando react-native-reanimated (versión problemática)...
call npm uninstall react-native-reanimated --legacy-peer-deps

echo Instalando react-native-reanimated versión compatible...
call npm install react-native-reanimated@3.4.0 --legacy-peer-deps
echo √ Dependencias actualizadas.
echo.

REM Limpieza profunda
echo [3/7] Realizando limpieza profunda...
if exist "android\build" rd /s /q "android\build"
if exist "android\app\build" rd /s /q "android\app\build"
if exist ".expo" rd /s /q ".expo"
if exist "node_modules\.cache" rd /s /q "node_modules\.cache"
echo √ Limpieza completada.
echo.

REM Aplicar parche para problemas específicos de RN 
echo [4/7] Verificando si es necesario aplicar parches...
echo Nota: Esta operación puede tomar unos momentos...
call npx patch-package --patch-dir=./patches
echo √ Verificación completada.
echo.

REM Crear prebuild
echo [5/7] Creando prebuild para development build...
echo Este proceso puede tomar varios minutos. Por favor espere...
echo.
call npx expo prebuild --platform android --clean

if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Fallo en la creación del prebuild.
    echo.
    echo Intentando alternativa simplificada...
    call npx expo start --dev-client
    pause
    exit /b 1
)
echo √ Prebuild completado exitosamente.
echo.

REM Intentar compilación
echo [6/7] Intentando compilar e instalar la aplicación...
echo Este proceso puede tomar varios minutos. Por favor espere...
echo.

REM Primera opción: con --dev-client
echo Probando con --dev-client...
call npx expo run:android --device --dev-client

if %errorlevel% neq 0 (
    echo No se pudo compilar con --dev-client, probando sin esta opción...
    call npx expo run:android --device
    
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo ERROR: No se pudo compilar la aplicación.
        echo.
        echo Iniciando modo alternativo con Expo Go...
        call npx expo start
        pause
        exit /b 1
    )
)

echo [7/7] Configurando desarrollo futuro...
echo.
echo Creando script para iniciar rápidamente...
echo @echo off > quick-start-dev.bat
echo echo Iniciando Development Build Server... >> quick-start-dev.bat
echo npx expo start --dev-client >> quick-start-dev.bat

echo.
color 0A
echo =========================================================================
echo     ¡DEVELOPMENT BUILD INSTALADA Y EJECUTADA CORRECTAMENTE!
echo =========================================================================
echo.
echo Para ejecutar la app en el futuro:
echo 1. Conecta tu dispositivo
echo 2. Ejecuta el archivo "quick-start-dev.bat"
echo 3. Abre la app en tu dispositivo
echo.
pause