@echo off
:: Script para ejecutar preflight.js con Node.js
:: Uso:
::   preflight.bat             - Verificación básica
::   preflight.bat --with-e2e  - Incluir pruebas E2E
::   preflight.bat --no-emulators - Sin iniciar emuladores
::
:: Autor: Equipo de desarrollo de Pergamino
:: Fecha: Octubre 2025

echo === Preflight - Verificacion del entorno y proyecto ===
echo.

node "%~dp0\preflight.js" %*

if %ERRORLEVEL% neq 0 (
  echo.
  echo [31mLa verificacion de preflight ha fallado.[0m
  echo Por favor, revisa los errores anteriores.
  exit /b %ERRORLEVEL%
)

echo.
echo [32mPreflight completado con exito![0m
