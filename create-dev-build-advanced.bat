@echo off
setlocal enabledelayedexpansion
color 0B

echo =========================================================================
echo             PERGAMINO APP - DEVELOPMENT BUILD AVANZADO
echo =========================================================================
echo.

REM Añadir Android SDK a PATH
set PATH=%PATH%;C:\Users\k\AppData\Local\Android\Sdk\platform-tools

REM Verificar dispositivo conectado
echo [1/6] Verificando dispositivo conectado...
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

REM Verificar que tenemos expo-dev-client instalado
echo [2/6] Verificando dependencias necesarias...
findstr /C:"expo-dev-client" "package.json" > nul
if %errorlevel% neq 0 (
    echo ⚠ expo-dev-client no está en package.json, instalando...
    call npm install expo-dev-client --legacy-peer-deps
) else (
    echo √ expo-dev-client ya está instalado.
)
echo.

REM Preguntar si se desea limpiar builds anteriores
echo [3/6] Configuración de limpieza:
echo.
choice /C SN /M "¿Desea limpiar las builds anteriores? (S/N)"
if %errorlevel% equ 1 (
    echo Limpiando builds anteriores...
    if exist "android\build" rd /s /q "android\build"
    if exist "android\app\build" rd /s /q "android\app\build"
    if exist ".expo" rd /s /q ".expo"
    if exist "node_modules\.cache" rd /s /q "node_modules\.cache"
    echo √ Limpieza completada.
) else (
    echo Omitiendo limpieza, se usará caché existente.
)
echo.

REM Crear prebuild
echo [4/6] Creando prebuild para development build...
echo Este proceso puede tomar varios minutos. Por favor espere...
echo.
call npx expo prebuild --platform android --clean

if %errorlevel% neq 0 (
    color 0C
    echo ERROR: Fallo en la creación del prebuild.
    echo.
    echo Posibles soluciones:
    echo 1. Verifica tu conexión a internet
    echo 2. Asegúrate que todas las dependencias están instaladas
    echo 3. Revisa los logs para más detalles
    pause
    exit /b 1
)
echo √ Prebuild completado exitosamente.
echo.

REM Preguntar si desea ejecutar ahora o solo construir
echo [5/6] Opciones de ejecución:
echo.
echo 1. Compilar e instalar en el dispositivo ahora
echo 2. Solo compilar (sin instalar)
echo.
choice /C 12 /M "Seleccione una opción"
set BUILD_OPTION=%errorlevel%
echo.

if %BUILD_OPTION% equ 1 (
    echo [6/6] Compilando e instalando en el dispositivo...
    echo Este proceso puede tomar varios minutos. Por favor espere...
    echo.
    call npx expo run:android --device
    
    if %errorlevel% neq 0 (
        color 0C
        echo ERROR: Fallo al compilar/instalar en el dispositivo.
        echo.
        echo Posibles soluciones:
        echo 1. Verifica que el dispositivo sigue conectado
        echo 2. Asegúrate que el dispositivo tiene suficiente espacio
        echo 3. Revisa los logs para más detalles
        pause
        exit /b 1
    )
    
    echo.
    color 0A
    echo =========================================================================
    echo   ¡DEVELOPMENT BUILD INSTALADA Y EJECUTADA CORRECTAMENTE!
    echo =========================================================================
    echo.
    echo Para ejecutar la app nuevamente, puedes:
    echo 1. Abrir la app "Pergamino App (Dev)" directamente en tu dispositivo
    echo 2. Ejecutar: npx expo start --dev-client
    echo    y luego abrir la app en tu dispositivo
    echo.
) else (
    echo [6/6] Compilación completada sin instalación.
    echo.
    echo Para instalar manualmente:
    echo 1. Ejecuta: npx expo run:android --device
    echo.
    echo O para iniciar el servidor de desarrollo:
    echo 1. Ejecuta: npx expo start --dev-client
    echo.
)

pause