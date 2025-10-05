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
            "mkdir ([^-])"            = "New-Item -ItemType Directory $1"
            "mkdir -p"                = "New-Item -ItemType Directory -Force"
            "rm -rf"                  = "Remove-Item -Recurse -Force"
            "rm -f"                   = "Remove-Item -Force"
            "rm ([^-])"               = "Remove-Item $1"
            "cp -r"                   = "Copy-Item -Recurse"
            "cp ([^-])"               = "Copy-Item $1"
            "cat ([^|]+)"             = "Get-Content $1"
            "ls -la"                  = "Get-ChildItem -Force"
            "ls"                      = "Get-ChildItem"
            "grep "                   = "Select-String -Pattern "
            "touch "                  = "New-Item -ItemType File "
            
            # Otros comandos comunes
            "echo ([^>]+) > ([^>]+)"  = "Set-Content -Path $2 -Value $1"
            "echo ([^>]+) >> ([^>]+)" = "Add-Content -Path $2 -Value $1"
        }
        
        foreach ($cmd in $unixCommands.Keys) {
            if ($content -match $cmd) {
                $content = [regex]::Replace($content, $cmd, $unixCommands[$cmd])
                $changes += "Reemplazado comando Unix: $cmd -> $($unixCommands[$cmd])"
            }
        }
        
        # 3. Comillas - reemplazar comillas tipograficas por rectas
        if ($content -match "[''"""]") {
            $oldContent = $content
            $content = $content -replace "'", "'" -replace "'", "'" -replace """, "`"" -replace """, "`""
            if ($oldContent -ne $content) {
                $changes += "Corregidas comillas tipograficas"
            }
        }
        
        # 4. Reemplazar && y || con la sintaxis de PowerShell
        if ($content -match " && ") {
            $content = $content -replace " && ", " -and "
            $changes += "Reemplazado && con -and"
        }
        
        if ($content -match " \ | \ | ") {
            $content = $content -replace " \ | \ | ", " -or "
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
        if (-not ($content -match "try | catch") -and ($content -match "npm | node | expo | babel | firestore")) {
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
                        | -------- | ---------- - | ------------ |
                        "@

foreach ($file in $psFiles) {
    $relativePath = $file.FullName.Substring($rootDir.Length + 1)
    $priority = if ($file.Name -match "(setup | init | install | config)") { "Alta" } else { "Normal" }
    $checklist += "`r`n| $relativePath | $priority | [ ] | "
}

$checklist += @"

                        ## Verificacion Manual

                        Para cada script, verifica:

                        1. El script se ejecuta correctamente sin errores
                        2. La funcionalidad es identica a la version anterior
                        3. Los mensajes son claros y legibles (sin caracteres especiales)
                        4. El manejo de errores es adecuado

                        ## Problemas Conocidos

                        Set-Item encuentras algun problema durante la verificacion, anotalo aqui:

                        - 

                        "@

$checklist | Out-File -FilePath $checklistFile -Encoding ASCII
Write-Host "`r`nChecklist de verificacion manual creada en: $checklistFile" -ForegroundColor Green
Write-Host "Revision PowerShell completada. Por favor verifica los cambios manualmente." -ForegroundColor Cyan