@echo off
:: Este script purga archivos sensibles del historial de Git
:: Debe ejecutarse desde Git Bash o CMD (no desde PowerShell)

echo ===============================================
echo  PURGAR ARCHIVOS SENSIBLES DEL HISTORIAL DE GIT
echo ===============================================
echo.
echo ADVERTENCIA: Este script modificará el historial de Git.
echo Todos los colaboradores deberán clonar nuevamente el repositorio.
echo.
echo Archivos que se purgarán:
echo - .env
echo - gpt-context/tools/serviceAccount.json
echo.
pause

:: Crear un backup primero
echo Creando backup...
mkdir ..\pergamino-backup
xcopy /E /H /C /I .\ ..\pergamino-backup\

:: Purgar los archivos sensibles
echo Purgando archivos sensibles...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .env gpt-context/tools/serviceAccount.json" --prune-empty --tag-name-filter cat -- --all

echo.
echo ---------------------------------------------
echo Limpieza de referencias y objetos antiguos...
echo ---------------------------------------------
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now

echo.
echo ==============================================
echo IMPORTANTE: Ahora debes forzar la subida con:
echo git push origin --force --all
echo git push origin --force --tags
echo ==============================================
echo.

pause
