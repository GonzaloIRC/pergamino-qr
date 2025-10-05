# Script maestro para aplicar correccion ASCII a todo el proyecto
# Este script ejecuta los tres scripts de correccion:
# 1. ascii-doctor.ps1 - Corrige caracteres no ASCII en general
# 2. ps-doctor.ps1 - Corrige scripts PowerShell
# 3. js-ascii-doctor.ps1 - Corrige archivos JavaScript del sistema de tracking

# Configuracion
$rootDir = $PSScriptRoot
$logFile = "$rootDir\ascii-doctor-master-log.txt"

# Iniciar log
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"ASCII Doctor Master iniciado: $timestamp" | Out-File -FilePath $logFile

# Funcion para ejecutar un script y registrar su salida
function Invoke-DoctorScript {
    param (
        [string]$scriptName,
        [string]$description
    )
    
    $scriptPath = Join-Path -Path $rootDir -ChildPath "tools\$scriptName"
    
    Write-Host ""
    Write-Host "====================================" -ForegroundColor Cyan
    Write-Host "Ejecutando: $description" -ForegroundColor Cyan
    Write-Host "====================================" -ForegroundColor Cyan
    
    try {
        # Verificar si el script existe
        if (Test-Path $scriptPath) {
            & $scriptPath
            if ($LASTEXITCODE -ne 0) {
                Write-Host "ERROR: El script $scriptName finalizo con codigo $LASTEXITCODE" -ForegroundColor Red
                "ERROR: El script $scriptName finalizo con codigo $LASTEXITCODE" | Out-File -FilePath $logFile -Append
            } else {
                Write-Host "Script $scriptName ejecutado correctamente" -ForegroundColor Green
                "Script $scriptName ejecutado correctamente" | Out-File -FilePath $logFile -Append
            }
        } else {
            Write-Host "ERROR: El script $scriptPath no existe" -ForegroundColor Red
            "ERROR: El script $scriptPath no existe" | Out-File -FilePath $logFile -Append
        }
    } catch {
        Write-Host "ERROR ejecutando $scriptName`: $_" -ForegroundColor Red
        "ERROR ejecutando $scriptName`: $_" | Out-File -FilePath $logFile -Append
    }
}

# Verificar si los archivos existen y crearlos si no
function Ensure-ScriptExists {
    param (
        [string]$scriptPath,
        [string]$scriptContent
    )
    
    if (-not (Test-Path $scriptPath)) {
        try {
            $scriptContent | Out-File -FilePath $scriptPath -Encoding ASCII
            Write-Host "Creado script: $scriptPath" -ForegroundColor Green
            "Creado script: $scriptPath" | Out-File -FilePath $logFile -Append
        } catch {
            Write-Host "ERROR creando script $scriptPath`: $_" -ForegroundColor Red
            "ERROR creando script $scriptPath`: $_" | Out-File -FilePath $logFile -Append
        }
    }
}

# Crear directorio tools si no existe
$toolsDir = Join-Path -Path $rootDir -ChildPath "tools"
if (-not (Test-Path $toolsDir)) {
    New-Item -Path $toolsDir -ItemType Directory -Force | Out-Null
    Write-Host "Directorio tools creado" -ForegroundColor Green
}

# Contenido para el script general ASCII Doctor
$asciiDoctorContent = @'
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
        """" = """"  # Comilla doble curva a recta
        """" = """"  # Comilla doble curva a recta
        
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
        
        # Caracteres espanoles adicionales
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
    $nonAsciiMatches = $asciiPattern.Matches($newContent)
    
    if ($nonAsciiMatches.Count -gt 0) {
        foreach ($match in $nonAsciiMatches) {
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
            Write-Host "Procesando: $($file.FullName) - $fileReplacements reemplazos" -ForegroundColor $(if ($fileReplacements -gt 0) { "Yellow" } else { "Gray" })
            
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
'@

# Contenido para el script PowerShell Doctor
$psDoctorContent = @'
# Script para corregir y adaptar archivos PowerShell
# Este script revisa y corrige scripts PowerShell para seguir mejores practicas

# Configuracion
$rootDir = "$PSScriptRoot\.."
$logFile = "$rootDir\ps-doctor-log.txt"
$psFiles = Get-ChildItem -Path $rootDir -Filter "*.ps1" -Recurse -File |
           Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*\.git*" }

# Iniciar log
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"PowerShell Doctor iniciado: $timestamp" | Out-File -FilePath $logFile

function Fix-PowerShellScript {
    param (
        [string]$filePath
    )
    
    Write-Host "Procesando script: $filePath" -ForegroundColor Cyan
    
    try {
        # Leer contenido del archivo
        $content = Get-Content -Path $filePath -Raw -Encoding UTF8
        $originalContent = $content
        $changes = @()
        
        # 1. Corregir cabeceras - asegurar que tienen informacion basica
        if (-not ($content -match "^#[\s\S]{1,500}$")) {
            $fileName = Split-Path -Path $filePath -Leaf
            $headerComment = "# $fileName`r`n# Script para el proyecto Pergamino App`r`n# Creado/modificado por PowerShell Doctor`r`n`r`n"
            $content = $headerComment + $content
            $changes += "Agregada cabecera al script"
        }
        
        # 2. Corregir comandos Unix a PowerShell
        $unixCommands = @{
            # Comandos basicos
            "mkdir ([^-])" = "New-Item -ItemType Directory $1"
            "mkdir -p" = "New-Item -ItemType Directory -Force"
            "rm -rf" = "Remove-Item -Recurse -Force"
            "rm -f" = "Remove-Item -Force"
            "rm ([^-])" = "Remove-Item $1"
            "cp -r" = "Copy-Item -Recurse"
            "cp ([^-])" = "Copy-Item $1"
            "cat ([^|]+)" = "Get-Content $1"
            "ls -la" = "Get-ChildItem -Force"
            "ls" = "Get-ChildItem"
            "grep " = "Select-String -Pattern "
            "touch " = "New-Item -ItemType File "
            
            # Otros comandos comunes
            "echo ([^>]+) > ([^>]+)" = "Set-Content -Path $2 -Value $1"
            "echo ([^>]+) >> ([^>]+)" = "Add-Content -Path $2 -Value $1"
        }
        
        foreach ($cmd in $unixCommands.Keys) {
            if ($content -match $cmd) {
                $content = [regex]::Replace($content, $cmd, $unixCommands[$cmd])
                $changes += "Reemplazado comando Unix: $cmd -> $($unixCommands[$cmd])"
            }
        }
        
        # 3. Comillas - reemplazar comillas tipograficas por rectas
        if ($content -match "[''""""]") {
            $oldContent = $content
            $content = $content -replace "'", "'" -replace "'", "'" -replace """", """" -replace """", """"
            if ($oldContent -ne $content) {
                $changes += "Corregidas comillas tipograficas"
            }
        }
        
        # 4. Reemplazar && y || con la sintaxis de PowerShell
        if ($content -match " && ") {
            $content = $content -replace " && ", " -and "
            $changes += "Reemplazado && con -and"
        }
        
        if ($content -match " \|\| ") {
            $content = $content -replace " \|\| ", " -or "
            $changes += "Reemplazado || con -or"
        }
        
        # 5. Reemplazar referencias a $LASTEXITCODE
        if ($content -match "if \(\s*\$\?") {
            $content = $content -replace "if \(\s*\$\?", "if (`$LASTEXITCODE -eq 0"
            $changes += "Corregida verificacion de exito de comando con `$LASTEXITCODE"
        }
        
        # 6. Verificar uso de Write-Host para mensajes
        if ($content -match "echo ") {
            $content = $content -replace "echo (.+)", "Write-Host `$1"
            $changes += "Reemplazado 'echo' con 'Write-Host'"
        }
        
        # 7. Agregar manejo de errores a comandos importantes
        if (-not ($content -match "try|catch") -and ($content -match "npm|node|expo|babel|firestore")) {
            $changes += "RECOMENDACION: Agregar manejo de errores (try/catch) para comandos externos"
        }
        
        # Guardar cambios si se hicieron modificaciones
        if ($originalContent -ne $content) {
            # Crear backup
            Copy-Item -Path $filePath -Destination "$filePath.bak" -Force
            
            # Guardar contenido modificado como ASCII
            $content | Out-File -FilePath $filePath -Encoding ASCII
            
            $changeLog = "Cambios en $filePath:`r`n" + ($changes -join "`r`n")
            $changeLog | Out-File -FilePath $logFile -Append
            
            Write-Host "  Modificado: $filePath" -ForegroundColor Green
            foreach ($change in $changes) {
                Write-Host "    - $change" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  Sin cambios: $filePath" -ForegroundColor Gray
        }
    } catch {
        $errorMsg = "ERROR en $filePath`: $_"
        $errorMsg | Out-File -FilePath $logFile -Append
        Write-Host $errorMsg -ForegroundColor Red
    }
}

# Procesar cada archivo PowerShell
$totalFiles = $psFiles.Count
$processedFiles = 0

foreach ($file in $psFiles) {
    $processedFiles++
    Write-Host "[$processedFiles/$totalFiles] " -NoNewline
    Fix-PowerShellScript -filePath $file.FullName
}

# Crear lista de verificacion para validacion manual
$checklistFile = "$rootDir\ps-scripts-checklist.md"

$checklist = @"
# Checklist de Verificacion Manual para Scripts PowerShell

Fecha: $(Get-Date -Format "yyyy-MM-dd")

## Scripts Procesados

Los siguientes scripts PowerShell han sido procesados por PowerShell Doctor.
Por favor, verifica manualmente su funcionamiento:

| Script | Prioridad | Verificado |
|--------|-----------|------------|
"@

foreach ($file in $psFiles) {
    $relativePath = $file.FullName.Substring($rootDir.Length + 1)
    $priority = if ($file.Name -match "(setup|init|install|config)") { "Alta" } else { "Normal" }
    $checklist += "`r`n| $relativePath | $priority | [ ] |"
}

$checklist += @"

## Verificacion Manual

Para cada script, verifica:

1. El script se ejecuta correctamente sin errores
2. La funcionalidad es identica a la version anterior
3. Los mensajes son claros y legibles (sin caracteres especiales)
4. El manejo de errores es adecuado

## Problemas Conocidos

Si encuentras algun problema durante la verificacion, anotalo aqui:

- 

"@

$checklist | Out-File -FilePath $checklistFile -Encoding ASCII
Write-Host "`r`nChecklist de verificacion manual creada en: $checklistFile" -ForegroundColor Green
Write-Host "Revision PowerShell completada. Por favor verifica los cambios manualmente." -ForegroundColor Cyan
'@

# Asegurar que los scripts existan
$asciiDoctorPath = Join-Path -Path $toolsDir -ChildPath "ascii-doctor.ps1"
$psDoctorPath = Join-Path -Path $toolsDir -ChildPath "ps-doctor.ps1"

Ensure-ScriptExists -scriptPath $asciiDoctorPath -scriptContent $asciiDoctorContent
Ensure-ScriptExists -scriptPath $psDoctorPath -scriptContent $psDoctorContent

# Crear guia de mejores practicas PowerShell
$psInstructionsFile = "$rootDir\.vscode\POWERSHELL_FORMATTING.md"

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

## Problema Comun: Caracteres Especiales

Los siguientes caracteres han causado problemas en scripts PowerShell:

- ✓ (marca de verificacion) - Usar [OK] en su lugar
- ❌ (X roja) - Usar [X] en su lugar
- ⚠️ (advertencia) - Usar [!] en su lugar
- Acentos (á, é, í, ó, ú) - Evitar completamente

Usar el script `ascii-doctor.ps1` para convertir automáticamente estos caracteres.
"@

# Crear directorio .vscode si no existe
$vscodeDir = Join-Path -Path $rootDir -ChildPath ".vscode"
if (-not (Test-Path $vscodeDir)) {
    New-Item -Path $vscodeDir -ItemType Directory -Force | Out-Null
    Write-Host "Directorio .vscode creado" -ForegroundColor Green
}

# Guardar guia de mejores practicas
$psInstructions | Out-File -FilePath $psInstructionsFile -Encoding ASCII
Write-Host "Guia de mejores practicas PowerShell creada en: $psInstructionsFile" -ForegroundColor Green

# Ejecutar los scripts
Invoke-DoctorScript -scriptName "ascii-doctor.ps1" -description "Corrector general de caracteres ASCII"
Invoke-DoctorScript -scriptName "ps-doctor.ps1" -description "Corrector de scripts PowerShell"

# Resumen final
$summary = @"

=================================================
      ASCII DOCTOR - PROCESO COMPLETADO
=================================================

Scripts ejecutados:
1. ascii-doctor.ps1 - Correccion general de caracteres no ASCII
2. ps-doctor.ps1 - Correccion de scripts PowerShell

Archivos generados:
- Log principal: $logFile
- Guia de mejores practicas: $psInstructionsFile
- Checklist de scripts PowerShell: $rootDir\ps-scripts-checklist.md

Proximos pasos:
1. Revisar los logs para verificar los cambios realizados
2. Probar los scripts PowerShell modificados
3. Verificar que todo el texto en la aplicacion es compatible con ASCII

=================================================

"@

$summary | Out-File -FilePath $logFile -Append
Write-Host $summary -ForegroundColor Green