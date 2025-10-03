# Script para preparar la sincronización segura con GitHub
# Guarda archivos sensibles y luego los restaura después de sincronizar

# Colores para mensajes
$Green = @{ForegroundColor = "Green"}
$Yellow = @{ForegroundColor = "Yellow"}
$Red = @{ForegroundColor = "Red"}

# Directorio de backups
$BACKUP_DIR = "__backups__/secure"

# Crear directorio de backups si no existe
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -Path $BACKUP_DIR -ItemType Directory -Force | Out-Null
}

# Función para respaldar archivos sensibles
function Backup-SensitiveFiles {
    Write-Host "Respaldando archivos sensibles..." @Yellow
    
    # Lista de archivos sensibles a respaldar
    $FILES_TO_BACKUP = @(
        ".env"
        ".env.local"
        ".env.development"
        ".env.staging"
        ".env.production"
        "firebase/firebaseConfig.js"
        # Añade más archivos sensibles aquí
    )
    
    # Respaldar cada archivo si existe
    foreach ($file in $FILES_TO_BACKUP) {
        if (Test-Path $file) {
            $filename = Split-Path $file -Leaf
            $directory = Split-Path $file -Parent
            
            # Si el archivo está en un subdirectorio, crear la estructura en el directorio de backups
            if ($directory -ne "" -and $directory -ne ".") {
                $backup_dir = Join-Path $BACKUP_DIR $directory
                if (-not (Test-Path $backup_dir)) {
                    New-Item -Path $backup_dir -ItemType Directory -Force | Out-Null
                }
                Copy-Item $file -Destination "$backup_dir/$filename.backup" -Force
            } else {
                Copy-Item $file -Destination "$BACKUP_DIR/$filename.backup" -Force
            }
            
            Write-Host "  Respaldado: $file" @Green
        }
    }
}

# Función para restaurar archivos sensibles
function Restore-SensitiveFiles {
    Write-Host "Restaurando archivos sensibles..." @Yellow
    
    # Buscar todos los archivos de backup recursivamente
    $backup_files = Get-ChildItem -Path $BACKUP_DIR -Recurse -Filter "*.backup"
    
    # Restaurar cada archivo respaldado
    foreach ($backup_file in $backup_files) {
        $original_name = $backup_file.Name -replace "\.backup$", ""
        $relative_path = $backup_file.FullName.Replace("$((Get-Location).Path)\$BACKUP_DIR\", "").Replace(".backup", "")
        
        # Crear directorios si no existen
        $dir = Split-Path -Path $relative_path -Parent
        if ($dir -and (-not (Test-Path $dir))) {
            New-Item -Path $dir -ItemType Directory -Force | Out-Null
        }
        
        # Restaurar el archivo
        Copy-Item $backup_file.FullName -Destination $relative_path -Force
        Write-Host "  Restaurado: $relative_path" @Green
    }
}

# Basado en los argumentos, ejecutar la acción correspondiente
$action = $args[0]
switch ($action) {
    "backup" {
        Backup-SensitiveFiles
    }
    "restore" {
        Restore-SensitiveFiles
    }
    default {
        Write-Host "Uso:" @Yellow
        Write-Host "  .\secure-sync.ps1 backup   - Respalda archivos sensibles antes de sincronizar" @Green
        Write-Host "  .\secure-sync.ps1 restore  - Restaura archivos sensibles después de sincronizar" @Green
    }
}