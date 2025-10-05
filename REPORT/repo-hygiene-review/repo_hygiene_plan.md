# Análisis de limpieza del repositorio - Pergamino App

## Resumen de archivos candidatos para eliminación

Hemos encontrado varios archivos que parecen ser copias de respaldo o archivos temporales en el repositorio.
Esta es una clasificación de los archivos encontrados:

### 1. Scripts de PowerShell (.bak) en la carpeta tools

Se encontraron 25 archivos .bak en la carpeta `tools`. Estos son copias de respaldo de scripts 
de PowerShell que probablemente ya no son necesarios:

```
C:\Users\k\Documents\Pergamino-app 2\tools\bootstrap-and-pack.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\export-context.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\fix-duplicate-scanner.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\fix-powershell-encoding.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\free-port-8080.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\kill-firebase-ports.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\kill-port-8080.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\pack-mobile-context.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\phase-apply-fixed.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\phase-apply-new.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\phase-apply.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\preflight.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\run-all-e2e.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\run-all-local.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\run-app-dev.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\run-tests.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\sanity-check.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\setup-env.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\simple-apply.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\start-emulators.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\test-history-export.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\test-kpi-export.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\test-sidebar.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\zip-for-chat.ps1.bak
C:\Users\k\Documents\Pergamino-app 2\tools\zip-project-for-chat.ps1.bak
```

### 2. Archivos de configuración en __backups__

Se encontraron varios archivos de configuración en la carpeta `__backups__`. Esta carpeta parece
estar destinada a almacenar respaldos, pero debería verificarse que no contiene información sensible:

```
C:\Users\k\Documents\Pergamino-app 2\__backups__\secure\.env.local.backup
C:\Users\k\Documents\Pergamino-app 2\__backups__\secure\.env.production.backup
C:\Users\k\Documents\Pergamino-app 2\__backups__\secure\.env.staging.backup
C:\Users\k\Documents\Pergamino-app 2\__backups__\secure\.env.staging.bak
C:\Users\k\Documents\Pergamino-app 2\__backups__\secure\firebaseConfig.js.backup
C:\Users\k\Documents\Pergamino-app 2\__backups__\secure\firebaseConfig.js.bak
C:\Users\k\Documents\Pergamino-app 2\__backups__\secure\firebase\firebaseConfig.js.backup
```

### 3. Archivos de respaldo generales

Otros archivos de respaldo o temporales encontrados en el repositorio:

```
C:\Users\k\Documents\Pergamino-app 2\app.json.backup
C:\Users\k\Documents\Pergamino-app 2\.gitignore.orig
C:\Users\k\Documents\Pergamino-app 2\BACKUP_COMPLETO_FIRESTORE_VERIFICADO_2025-08-07.md
C:\Users\k\Documents\Pergamino-app 2\BACKUP_ESTADO_FUNCIONAL_2025-08-07.md
C:\Users\k\Documents\Pergamino-app 2\BACKUP_FUNCIONAL_07_AGOSTO_2025.md
```

### 4. Archivos de registro (logs)

Se encontraron archivos de registro que no deberían ser incluidos en el repositorio:

```
C:\Users\k\Documents\Pergamino-app 2\firebase-debug.log
C:\Users\k\Documents\Pergamino-app 2\firestore-debug.log
```

### 5. Archivos de node_modules (falsos positivos)

También se encontraron muchos archivos dentro de `node_modules` que contienen las palabras clave de búsqueda,
pero estos son falsos positivos ya que son parte de las dependencias y no deben eliminarse manualmente.

## Recomendaciones de limpieza

1. **Eliminar archivos .bak de la carpeta tools**: Estos son copias de respaldo que ocupan espacio innecesario.
2. **Revisar la carpeta __backups__**: Asegurar que no contiene información sensible y considerar excluirla del repositorio.
3. **Eliminar archivos de registro**: Los archivos .log no deben estar en el repositorio.
4. **Actualizar .gitignore**: Para evitar que archivos temporales y de respaldo sean incluidos en futuros commits.

## Plan de acción propuesto

1. Respaldar los archivos a eliminar en un archivo zip (por precaución)
2. Eliminar los archivos .bak de la carpeta tools
3. Eliminar los archivos de registro (.log)
4. Actualizar .gitignore para incluir patrones como *.bak, *.log, etc.
5. Realizar un commit con los cambios de limpieza

## Script de limpieza propuesto

```powershell
# Respaldar archivos antes de eliminar
$backupDir = "REPORT\repo-hygiene-backup"
New-Item -ItemType Directory -Force $backupDir | Out-Null

# Backup de archivos .bak en tools
$toolsBakFiles = Get-ChildItem -Path "tools" -Filter "*.bak"
foreach ($file in $toolsBakFiles) {
    Copy-Item $file.FullName -Destination "$backupDir\$(Split-Path -Leaf $file.FullName)"
}

# Eliminar archivos .bak en tools
$toolsBakFiles | Remove-Item -Force

# Eliminar archivos de registro
Remove-Item -Force "firebase-debug.log" -ErrorAction SilentlyContinue
Remove-Item -Force "firestore-debug.log" -ErrorAction SilentlyContinue

# Actualizar .gitignore
$gitignoreContent = Get-Content -Path ".gitignore" -Raw
$newGitignoreEntry = @"

# Archivos de respaldo y temporales
*.bak
*.old
*.tmp
*.orig
*.log
"@

if (-not $gitignoreContent.Contains("Archivos de respaldo y temporales")) {
    Add-Content -Path ".gitignore" -Value $newGitignoreEntry
}
```