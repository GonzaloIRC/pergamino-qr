<#
.SYNOPSIS
    Herramienta para corregir caracteres especiales en scripts PowerShell.

.DESCRIPTION
    Este script analiza y corrige caracteres Unicode especiales en archivos PowerShell (.ps1),
    reemplazÃ¡ndolos por alternativas ASCII para evitar problemas de codificaciÃ³n.

.PARAMETER FilePath
    Ruta al archivo PowerShell que se desea corregir. Si no se especifica, se buscan todos los
    scripts .ps1 en la carpeta tools.

.PARAMETER BackupFiles
    Crea una copia de seguridad de los archivos originales antes de modificarlos.

.PARAMETER ShowChanges
    Muestra un resumen de los cambios realizados.

.EXAMPLE
    .\fix-powershell-encoding.ps1
    Corrige todos los scripts PowerShell en la carpeta tools.

.EXAMPLE
    .\fix-powershell-encoding.ps1 -FilePath ".\tools\test-kpi-export.ps1" -ShowChanges
    Corrige un archivo especÃ­fico y muestra los cambios realizados.
#>

Param(
    [string]$FilePath = "",
    [switch]$BackupFiles,
    [switch]$ShowChanges = $false
)

# Por defecto, hacer copia de seguridad
if (-not $PSBoundParameters.ContainsKey('BackupFiles')) {
    $BackupFiles = $true
}

# FunciÃ³n para corregir un archivo
function Fix-PowerShellFile {
    param (
        [string]$Path
    )
    
    Write-Host "Procesando: $Path"
    
    # Crear copia de seguridad si se solicita
    if ($BackupFiles) {
        $backupPath = "$Path.bak"
        Copy-Item -Path $Path -Destination $backupPath -Force
        Write-Host "  Copia de seguridad creada: $backupPath"
    }
    
    # Leer contenido del archivo
    $content = Get-Content -Path $Path -Raw
    $originalContent = $content
    
    # Aplicar reemplazos de caracteres Unicode
    $replacements = @(
        @{ Pattern = [char]0x2713; Replace = '[OK]' },  # Checkmark
        @{ Pattern = [char]0x274C; Replace = '[X]' },   # Cross mark
        @{ Pattern = [char]0x26A0; Replace = '[!]' },   # Warning
        @{ Pattern = '...'; Replace = '....' },
        @{ Pattern = '-'; Replace = '-' },
        @{ Pattern = [char]0x00A0; Replace = ' ' },     # Non-breaking space
        @{ Pattern = [char]0x200B; Replace = '' },      # Zero width space
        @{ Pattern = [char]0xFEFF; Replace = '' }       # BOM
    )
    
    $changes = 0
    foreach ($item in $replacements) {
        $oldContent = $content
        $content = $content.Replace($item.Pattern, $item.Replace)
        if ($oldContent -ne $content) {
            $changes++
        }
    }
    
    # TambiÃ©n arreglar patrones problemÃ¡ticos comunes
    $patternReplacements = @(
        @{ Pattern = '\$_\$'; Replace = '$($$_.ToString())$$' },
        @{ Pattern = '\$_\)'; Replace = '$($$_.ToString()))' },
        @{ Pattern = '\$_\s+\$'; Replace = '$($$_.ToString())$$' },
        @{ Pattern = '\$_\s+\)'; Replace = '$($$_.ToString()))' }
    )
    
    foreach ($item in $patternReplacements) {
        $oldContent = $content
        $content = $content -replace $item.Pattern, $item.Replace
        if ($oldContent -ne $content) {
            $changes++
        }
    }
    
    # Guardar el archivo si hubo cambios
    if ($content -ne $originalContent) {
        Set-Content -Path $Path -Value $content -NoNewline -Encoding UTF8
        Write-Host "  Archivo actualizado con $changes cambios"
        
        # Mostrar cambios si se solicita
        if ($ShowChanges) {
            $diffLines = @()
            $originalLines = $originalContent -split "`n"
            $newLines = $content -split "`n"
            
            for ($i = 0; $i -lt [Math]::Max($originalLines.Length, $newLines.Length); $i++) {
                if ($i -lt $originalLines.Length -and $i -lt $newLines.Length) {
                    if ($originalLines[$i] -ne $newLines[$i]) {
                        $diffLines += "  LÃ­nea $($i+1):"
                        $diffLines += "    - $($originalLines[$i])"
                        $diffLines += "    + $($newLines[$i])"
                    }
                }
            }
            
            if ($diffLines.Count -gt 0) {
                Write-Host "  Cambios detectados:"
                $diffLines | ForEach-Object { Write-Host $_ }
            }
        }
    }
    else {
        Write-Host "  No se encontraron caracteres problemÃ¡ticos"
    }
}

# Procesar archivos
if ($FilePath -ne "") {
    # Procesar archivo especÃ­fico
    if (Test-Path $FilePath) {
        Fix-PowerShellFile -Path $FilePath
    }
    else {
        Write-Host "El archivo $FilePath no existe"
    }
}
else {
    # Procesar todos los scripts en la carpeta tools
    $toolsDir = Join-Path (Get-Location) "tools"
    if (-not (Test-Path $toolsDir)) {
        $toolsDir = "."  # Usar directorio actual si no existe /tools
    }
    
    $psScripts = Get-ChildItem -Path $toolsDir -Filter "*.ps1" -Recurse
    
    if ($psScripts.Count -eq 0) {
        Write-Host "No se encontraron scripts PowerShell en $toolsDir"
    }
    else {
        Write-Host "Encontrados $($psScripts.Count) scripts PowerShell para procesar"
        foreach ($script in $psScripts) {
            Fix-PowerShellFile -Path $script.FullName
        }
    }
}

Write-Host ""
Write-Host "Proceso completado"
Write-Host ""
Write-Host "Recomendaciones adicionales:"
Write-Host "1. AsegÃºrate de que los archivos estÃ¡n guardados en codificaciÃ³n UTF-8 sin BOM"
Write-Host "2. Usa el formateador de PowerShell de VS Code para un formato consistente"
Write-Host "3. Para bloques catch, usa `$_.ToString() o `$_.Exception.Message en lugar de `$_"
Write-Host "4. Verifica que tienes instalada la extensiÃ³n de PowerShell para VS Code (ms-vscode.powershell)"