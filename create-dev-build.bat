@echo off
setlocal enabledelayedexpansion

echo =======================================================
echo    PERGAMINO APP - CREANDO DEVELOPMENT BUILD
echo =======================================================
echo.

REM Añadir Android SDK a PATH
set PATH=%PATH%;C:\Users\k\AppData\Local\Android\Sdk\platform-tools

REM Verificar dispositivo conectado
echo Verificando dispositivo conectado...
adb devices > tmp_devices.txt
type tmp_devices.txt
findstr /C:"device" tmp_devices.txt > nul
if %errorlevel% neq 0 (
    echo ERROR: No se detectó ningún dispositivo Android conectado.
    echo Por favor conecta tu dispositivo y habilita la depuración USB.
    del tmp_devices.txt
    exit /b 1
)
del tmp_devices.txt

REM Limpiar la build anterior
echo.
echo Limpiando builds anteriores...
if exist "android\build" rd /s /q "android\build"
if exist "android\app\build" rd /s /q "android\app\build"

REM Crear prebuild de desarrollo
echo.
echo Creando prebuild de desarrollo (esto puede tardar unos minutos)...
call npx expo prebuild --platform android --clean

if %errorlevel% neq 0 (
    echo ERROR: Fallo en la creación del prebuild.
    exit /b 1
)

REM Compilar y ejecutar en modo dev
echo.
echo Compilando y ejecutando en el dispositivo (modo desarrollo)...
call npx expo run:android --device --no-build-cache

if %errorlevel% neq 0 (
    echo ERROR: Fallo al compilar/ejecutar en el dispositivo.
    exit /b 1
)

echo.
echo =======================================================
echo Development build instalada y ejecutada correctamente!
echo =======================================================