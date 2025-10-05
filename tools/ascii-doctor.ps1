# ASCII Doctor Script
# Este script busca y reemplaza caracteres no ASCII por sus equivalentes ASCII
# en todos los archivos de codigo del proyecto.

# Configuracion
$extensions = @("*.js", "*.jsx", "*.json", "*.ts", "*.tsx", "*.md", "*.ps1")
$rootDir = "$PSScriptRoot\.."
$logFile = "$rootDir\ascii-doctor-log.txt"
$backupDir = "$rootDir\__ascii_backups__"

# Crear directorio de respaldo si no existe
if (-not (Test-Path -Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "Directorio de respaldo creado en: $backupDir" -ForegroundColor Green
}

# Iniciar log
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"ASCII Doctor iniciado: $timestamp" | Out-File -FilePath $logFile

# Contador de archivos y reemplazos
$totalFiles = 0
$modifiedFiles = 0
$totalReplacements = 0

# Funcion para reemplazar caracteres especiales
function Replace-NonASCII {
    param (
        [string]$content
    )
    
    $replacements = 0
    $newContent = $content
    
    # Mapa de reemplazos comunes
    $replacementMap = @{
        # Comillas
        "'" = "'"  # Comilla simple curva a recta
        "'" = "'"  # Comilla simple curva a recta
        """ = "`""  # Comilla doble curva a recta
        """ = "`""  # Comilla doble curva a recta
        
        # Guiones y puntos
        "–" = "-"  # Guion medio a guion normal
        "—" = "--"  # Guion largo a doble guion
        "…" = "..."  # Puntos suspensivos a tres puntos
        
        # Simbolos
        "✓" = "[OK]"  # Marca de verificacion
        "✔" = "[OK]"  # Marca de verificacion bold
        "❌" = "[X]"  # X roja
        "⚠️" = "[!]"  # Advertencia
        "⚠" = "[!]"  # Advertencia sin emoji
        "→" = "->"  # Flecha derecha
        "←" = "<-"  # Flecha izquierda
        "⇒" = "=>"  # Flecha doble derecha
        "⇐" = "<="  # Flecha doble izquierda
        
        # Acentos
        "á" = "a"
        "é" = "e"
        "í" = "i"
        "ó" = "o"
        "ú" = "u"
        "ü" = "u"
        "ñ" = "n"
        "Á" = "A"
        "É" = "E"
        "Í" = "I"
        "Ó" = "O"
        "Ú" = "U"
        "Ü" = "U"
        "Ñ" = "N"
        
        # Otros caracteres especiales
        "°" = "grados"
        "©" = "(c)"
        "®" = "(R)"
        "™" = "(TM)"
        "€" = "EUR"
        "£" = "GBP"
        "¥" = "JPY"
        
        # Caracteres españoles adicionales
        "¿" = "?"
        "¡" = "!"
        
        # Caracteres matematicos
        "×" = "x"
        "÷" = "/"
        "≤" = "<="
        "≥" = ">="
        "≠" = "!="
        "≈" = "~="
        "∞" = "infinito"
    }
    
    foreach ($key in $replacementMap.Keys) {
        $count = 0
        $value = $replacementMap[$key]
        if ($newContent -match [regex]::Escape($key)) {
            $newContent = $newContent -replace [regex]::Escape($key), $value
            $count = ([regex]::Matches($content, [regex]::Escape($key))).Count
            $replacements += $count
        }
    }
    
    # Buscar y reemplazar otros caracteres no ASCII que no estan en el mapa
    $asciiPattern = [regex] '[^\x00-\x7F]'
    $matches = $asciiPattern.Matches($newContent)
    
    if ($matches.Count -gt 0) {
        foreach ($match in $matches) {
            $nonAsciiChar = $match.Value
            $newContent = $newContent -replace [regex]::Escape($nonAsciiChar), "?"
            $replacements++
        }
    }
    
    return @{
        Content = $newContent
        Replacements = $replacements
    }
}

# Buscar archivos y procesar
foreach ($ext in $extensions) {
    $files = Get-ChildItem -Path $rootDir -Filter $ext -Recurse -File | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*\.git*" -and $_.FullName -notlike "*__ascii_backups__*" }
    
    foreach ($file in $files) {
        $totalFiles++
        $fileReplacements = 0
        
        try {
            # Leer contenido del archivo
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
            
            # Reemplazar caracteres no ASCII
            $result = Replace-NonASCII -content $content
            $newContent = $result.Content
            $fileReplacements = $result.Replacements
            
            # Si hay cambios, crear backup y guardar archivo modificado
            if ($fileReplacements -gt 0) {
                $modifiedFiles++
                $totalReplacements += $fileReplacements
                
                # Crear backup
                $backupPath = Join-Path -Path $backupDir -ChildPath ($file.FullName.Substring($rootDir.Length + 1) + ".bak")
                $backupFolder = Split-Path -Path $backupPath -Parent
                
                if (-not (Test-Path -Path $backupFolder)) {
                    New-Item -ItemType Directory -Path $backupFolder -Force | Out-Null
                }
                
                Copy-Item -Path $file.FullName -Destination $backupPath -Force
                
                # Guardar archivo modificado con codificacion ASCII
                $newContent | Out-File -FilePath $file.FullName -Encoding ascii
                
                # Registrar en log
                "$($file.FullName) - $fileReplacements reemplazos" | Out-File -FilePath $logFile -Append
            }
            
            # Mostrar progreso
            Write-Host "Procesando: $($file.FullName) - $fileReplacements reemplazos" -ForegroundColor $(if ($fileReplacements -gt 0) {
                    "Yellow" 
                } else {
                    "Gray" 
                })
            
        } catch {
            "ERROR en $($file.FullName): $_" | Out-File -FilePath $logFile -Append
            Write-Host "ERROR en $($file.FullName): $_" -ForegroundColor Red
        }
    }
}

# Resumen
$summary = @"

======= RESUMEN ASCII DOCTOR =======
Archivos analizados: $totalFiles
Archivos modificados: $modifiedFiles
Total reemplazos: $totalReplacements
Respaldos guardados en: $backupDir
Log completo en: $logFile
==================================
"@

$summary | Out-File -FilePath $logFile -Append
Write-Host $summary -ForegroundColor Green

# Crear archivo de instrucciones para PowerShell
$psInstructionsFile = "$rootDir\tools\POWERSHELL_BEST_PRACTICES.md"

$psInstructions = @"
# Mejores Practicas para PowerShell en el Proyecto

## Recomendaciones Generales

1. **Usar solo caracteres ASCII** en todos los scripts:
   - Evitar caracteres especiales, acentos o simbolos Unicode
   - Usar equivalentes ASCII para todos los caracteres especiales

2. **Manejo de Errores**:
   ```powershell
   try {
       # Codigo que podria fallar
   } catch {
       Write-Host "Error: $_" -ForegroundColor Red
   }
   ```

3. **Codificacion de Archivos**:
   - Guardar archivos PowerShell como ASCII o UTF-8 sin BOM
   - Evitar UTF-16 o otras codificaciones que puedan causar problemas

4. **Uso de Comillas**:
   - Usar comillas dobles para variables: `"Valor: $variable"`
   - Usar comillas simples para texto literal: `'Texto sin variables'`

## Estandares de Codigo

1. **Espaciado y Formato**:
   - Usar 4 espacios para indentacion, no tabs
   - Usar PascalCase para funciones y CamelCase para variables

2. **Comentarios**:
   - Documentar todas las funciones con comentarios descriptivos
   - Usar comentarios para bloques de codigo complejos

3. **Manejo de Rutas**:
   - Usar `Join-Path` en lugar de concatenacion de strings
   - Ejemplo: `$filePath = Join-Path -Path $directorio -ChildPath $archivo`

## Comandos Adaptados para PowerShell

| Comando Unix/Linux | Equivalente PowerShell |
|-------------------|------------------------|
| `mkdir -p ruta`   | `New-Item -ItemType Directory -Path ruta -Force` |
| `cat archivo`     | `Get-Content -Path archivo` |
| `ls -la`          | `Get-ChildItem -Path . -Force` |
| `rm archivo`      | `Remove-Item -Path archivo` |
| `cp origen destino` | `Copy-Item -Path origen -Destination destino` |
| `grep patron archivo` | `Select-String -Pattern patron -Path archivo` |

## Recomendaciones para la Ejecucion de Scripts

1. **Politica de Ejecucion**:
   - Para un script: `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process`
   - Para todo el sistema: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned`

2. **Verificacion de Permisos**:
   ```powershell
   if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]"Administrator")) {
       Write-Host "Ejecuta como administrador para funcionalidad completa" -ForegroundColor Yellow
   }
   ```

3. **Validacion de Entorno**:
   ```powershell
   if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
       Write-Host "Node.js no esta instalado. Por favor instalalo primero." -ForegroundColor Red
       exit 1
   }
   ```
"@

$psInstructions | Out-File -FilePath $psInstructionsFile -Encoding ascii
Write-Host "Guia de mejores practicas PowerShell creada en: $psInstructionsFile" -ForegroundColor Green