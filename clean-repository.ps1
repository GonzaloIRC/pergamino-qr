# Script de limpieza de repositorio para Pergamino App
# Este script elimina archivos temporales y de respaldo innecesarios

# Colores para mensajes
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Red = [System.ConsoleColor]::Red
$Cyan = [System.ConsoleColor]::Cyan

# Función para mostrar mensajes
function Write-ColorMessage {
    param(
        [string] $Message,
        [System.ConsoleColor] $Color = [System.ConsoleColor]::White
    )
    Write-Host $Message -ForegroundColor $Color
}

# Función para mostrar título
function Write-Title {
    param(
        [string] $Title
    )
    Write-ColorMessage "" 
    Write-ColorMessage "----------------------------------------" $Cyan
    Write-ColorMessage " $Title " $Cyan
    Write-ColorMessage "----------------------------------------" $Cyan
}

# Cabecera
Write-Title "PERGAMINO APP - LIMPIEZA DE REPOSITORIO"
Write-ColorMessage ""

# Respaldar archivos antes de eliminar
$backupDir = "REPORT\repo-hygiene-backup"
New-Item -ItemType Directory -Force $backupDir | Out-Null
Write-ColorMessage "Creando directorio de respaldo: $backupDir" $Green

# Backup de archivos .bak en tools
Write-ColorMessage "Respaldando archivos .bak en tools..." $Yellow
$toolsBakFiles = Get-ChildItem -Path "tools" -Filter "*.bak"
foreach ($file in $toolsBakFiles) {
    $destName = "tools_$(Split-Path -Leaf $file.FullName)"
    Copy-Item $file.FullName -Destination "$backupDir\$destName"
    Write-ColorMessage "  Respaldado: $($file.FullName) -> $backupDir\$destName" $Green
}

# Eliminar archivos .bak en tools
Write-Title "ELIMINANDO ARCHIVOS .BAK EN TOOLS"
$count = 0
foreach ($file in $toolsBakFiles) {
    Remove-Item -Force $file.FullName
    Write-ColorMessage "  Eliminado: $($file.FullName)" $Yellow
    $count++
}
Write-ColorMessage "Archivos .bak eliminados: $count" $Green

# Eliminar archivos de registro
Write-Title "ELIMINANDO ARCHIVOS DE REGISTRO"
$logFiles = @(
    "firebase-debug.log",
    "firestore-debug.log"
)
foreach ($file in $logFiles) {
    if (Test-Path $file) {
        Remove-Item -Force $file
        Write-ColorMessage "  Eliminado: $file" $Yellow
    } else {
        Write-ColorMessage "  No encontrado: $file" $Yellow
    }
}

# Actualizar .gitignore
Write-Title "ACTUALIZANDO .GITIGNORE"
$gitignorePath = ".gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content -Path $gitignorePath -Raw
    $newGitignoreEntry = @"

# Archivos de respaldo y temporales
*.bak
*.old
*.tmp
*.orig
*.log
*copy*
*backup*
*copia*
*respaldo*
"@

    if (-not $gitignoreContent.Contains("Archivos de respaldo y temporales")) {
        Add-Content -Path $gitignorePath -Value $newGitignoreEntry
        Write-ColorMessage "Se ha actualizado .gitignore con patrones para archivos temporales" $Green
    } else {
        Write-ColorMessage ".gitignore ya contiene patrones para archivos temporales" $Green
    }
} else {
    Write-ColorMessage "No se encontró el archivo .gitignore" $Red
}

# Resumen
Write-Title "RESUMEN DE LA LIMPIEZA"
Write-ColorMessage "Archivos respaldados en: $backupDir" $Green
Write-ColorMessage "Archivos .bak eliminados: $count" $Green
Write-ColorMessage "Archivos .log eliminados: $($logFiles.Count)" $Green
Write-ColorMessage ".gitignore actualizado para ignorar archivos temporales" $Green

# Mensaje final
Write-ColorMessage ""
Write-ColorMessage "La limpieza del repositorio ha finalizado." $Green
Write-ColorMessage "Para confirmar los cambios, ejecute:" $Yellow
Write-ColorMessage "git add ." $Yellow
Write-ColorMessage "git commit -m 'chore: limpieza de archivos temporales y respaldos'" $Yellow
Write-ColorMessage ""