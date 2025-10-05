# Script para corregir y asegurar compatibilidad ASCII en archivos JavaScript# Script para corregir y asegurar compatibilidad ASCII en archivos JavaScript

# Este script se enfoca en el sistema de tablas de seguimiento# Este script se enfoca especialmente en el sistema de tablas de seguimiento



# Configuracion# Configuracion

$rootDir = "$PSScriptRoot\.."$rootDir = "$PSScriptRoot\.."

$trackingComponentsDir = "$rootDir\src\components\TrackingTable"$trackingComponentsDir = "$rootDir\src\components\TrackingTable"

$trackingScreensDir = "$rootDir\src\screens"$trackingScreensDir = "$rootDir\src\screens"

$trackingServicesDir = "$rootDir\src\services"$trackingServicesDir = "$rootDir\src\services"

$logFile = "$rootDir\js-ascii-doctor-log.txt"$logFile = "$rootDir\js-ascii-doctor-log.txt"



# Iniciar log# Iniciar log

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

"JavaScript ASCII Doctor iniciado: $timestamp" | Out-File -FilePath $logFile"JavaScript ASCII Doctor iniciado: $timestamp" | Out-File -FilePath $logFile



# Lista de archivos importantes del sistema de tracking# Lista de archivos importantes del sistema de tracking

$trackingFiles = @()$trackingFiles = @()



# Agregar componentes de tracking# Agregar componentes de tracking

if (Test-Path $trackingComponentsDir) {if (Test-Path $trackingComponentsDir) {

    $trackingFiles += Get-ChildItem -Path $trackingComponentsDir -Filter "*.js" -Recurse    $trackingFiles += Get-ChildItem -Path $trackingComponentsDir -Filter "*.js" -Recurse

}}



# Agregar pantallas de tracking# Agregar pantallas de tracking

if (Test-Path $trackingScreensDir) {if (Test-Path $trackingScreensDir) {

    $trackingFiles += Get-ChildItem -Path $trackingScreensDir -Filter "*Tracking*.js" -Recurse    $trackingFiles += Get-ChildItem -Path $trackingScreensDir -Filter "*Tracking*.js" -Recurse

}}



# Agregar servicios de tracking# Agregar servicios de tracking

if (Test-Path $trackingServicesDir) {if (Test-Path $trackingServicesDir) {

    $trackingFiles += Get-ChildItem -Path $trackingServicesDir -Filter "*tracking*.js" -Recurse    $trackingFiles += Get-ChildItem -Path $trackingServicesDir -Filter "*tracking*.js" -Recurse

}}



# Funcion para reemplazar caracteres no ASCII y corregir problemas comunes# Funcion para reemplazar caracteres no ASCII y corregir problemas comunes

function Repair-JavaScriptFile {function Repair-JavaScriptFile {

    param (    param (

        [string]$filePath        [string]$filePath

    )    )

        

    Write-Host "Procesando archivo: $filePath" -ForegroundColor Cyan    Write-Host "Procesando archivo: $filePath" -ForegroundColor Cyan

        

    try {    try {

        # Leer contenido del archivo        # Leer contenido del archivo

        $content = Get-Content -Path $filePath -Raw -Encoding UTF8        $content = Get-Content -Path $filePath -Raw -Encoding UTF8

        $originalContent = $content        $originalContent = $content

        $changesArray = @()        $changes = @()

                

        # Reemplazos de caracteres comunes        # 1. Reemplazar caracteres especiales y simbolos

        $charReplacements = @(        $replacements = @{

            # Formato: [Caracter original, Reemplazo]            # Comillas

            @("'", "'"),            "'" = "'"

            @("'", "'"),            "''" = "'"

            @("""", """"),            "'" = "'"

            @("""", """"),            """" = "`""

            @("–", "-"),            """" = "`""

            @("—", "--"),            

            @("…", "..."),            # Guiones y puntos

            @("✓", "[OK]"),            "–" = "-"

            @("✔", "[OK]"),            "—" = "--"

            @("❌", "[X]"),            "…" = "..."

            @("⚠️", "[!]"),            

            @("⚠", "[!]"),            # Simbolos

            @("→", "->"),            "✓" = "[OK]"

            @("←", "<-"),            "✔" = "[OK]"

            @("⇒", "=>"),            "❌" = "[X]"

            @("⇐", "<="),            "⚠️" = "[!]"

            @("á", "a"),            "⚠" = "[!]"

            @("é", "e"),            "→" = "->"

            @("í", "i"),            "←" = "<-"

            @("ó", "o"),            "⇒" = "=>"

            @("ú", "u"),            "⇐" = "<="

            @("ü", "u"),            

            @("ñ", "n"),            # Caracteres espanoles

            @("Á", "A"),            "á" = "a"

            @("É", "E"),            "é" = "e"

            @("Í", "I"),            "í" = "i"

            @("Ó", "O"),            "ó" = "o"

            @("Ú", "U"),            "ú" = "u"

            @("Ü", "U"),            "ü" = "u"

            @("Ñ", "N"),            "ñ" = "n"

            @("¿", "?"),            "Á" = "A"

            @("¡", "!")            "É" = "E"

        )            "Í" = "I"

                    "Ó" = "O"

        # Aplicar reemplazos            "Ú" = "U"

        foreach ($replacement in $charReplacements) {            "Ü" = "U"

            $oldChar = $replacement[0]            "Ñ" = "N"

            $newChar = $replacement[1]            "¿" = "?"

                        "¡" = "!"

            if ($content.Contains($oldChar)) {        }

                $content = $content.Replace($oldChar, $newChar)        

                $changesArray += "Reemplazado: '$oldChar' con '$newChar'"        foreach ($key in $replacements.Keys) {

            }            if ($content -match [regex]::Escape($key)) {

        }                $oldContent = $content

                        $content = $content -replace [regex]::Escape($key), $replacements[$key]

        # Patrones para corregir en el codigo                if ($oldContent -ne $content) {

                            $changes += "Reemplazado caracter especial: '$key' con '$($replacements[$key])'"

        # 1. Corregir etiquetas en la interfaz de usuario                }

        $labelPattern = "title(?:=\""|\s*:\s*['\""])([^'\""]*)(['\""])"            }

        $labelMatches = [regex]::Matches($content, $labelPattern)        }

                

        foreach ($match in $labelMatches) {        # 2. Corregir textos en interfaz de usuario para reflejar los cambios

            $originalText = $match.Groups[1].Value        # Estos son patrones especificos para los archivos de tracking

            $fixedText = $originalText        

                    # Textos en botones y etiquetas

            foreach ($replacement in $charReplacements) {        if ($content -match "título:\s*['""]([^'""]*[áéíóúüñÁÉÍÓÚÜÑ¿¡][^'""]*)['""]") {

                $oldChar = $replacement[0]            $matches = [regex]::Matches($content, "título:\s*['""]([^'""]*[áéíóúüñÁÉÍÓÚÜÑ¿¡][^'""]*)['""]")

                $newChar = $replacement[1]            foreach ($match in $matches) {

                if ($fixedText.Contains($oldChar)) {                $original = $match.Groups[1].Value

                    $fixedText = $fixedText.Replace($oldChar, $newChar)                $fixed = $original

                }                foreach ($key in $replacements.Keys) {

            }                    $fixed = $fixed -replace [regex]::Escape($key), $replacements[$key]

                            }

            if ($originalText -ne $fixedText) {                if ($original -ne $fixed) {

                $fullMatch = $match.Value                    $content = $content -replace [regex]::Escape("título: ""$original"""), "titulo: ""$fixed"""

                $newText = $fullMatch.Replace($originalText, $fixedText)                    $changes += "Corregido texto en UI: '$original' -> '$fixed'"

                $content = $content.Replace($fullMatch, $newText)                }

                $changesArray += "Corregido texto en UI: '$originalText' -> '$fixedText'"            }

            }        }

        }        

                # 3. Corregir mensajes de alerta y errores

        # 2. Corregir mensajes de alerta        if ($content -match "Alert\.alert\(['""]([^'""]*[áéíóúüñÁÉÍÓÚÜÑ¿¡][^'""]*)['""]") {

        $alertPattern = "Alert\.alert\(['\""]([^'\""]*)['\""]"            $matches = [regex]::Matches($content, "Alert\.alert\(['""]([^'""]*[áéíóúüñÁÉÍÓÚÜÑ¿¡][^'""]*)['""]")

        $alertMatches = [regex]::Matches($content, $alertPattern)            foreach ($match in $matches) {

                        $original = $match.Groups[1].Value

        foreach ($match in $alertMatches) {                $fixed = $original

            $originalText = $match.Groups[1].Value                foreach ($key in $replacements.Keys) {

            $fixedText = $originalText                    $fixed = $fixed -replace [regex]::Escape($key), $replacements[$key]

                            }

            foreach ($replacement in $charReplacements) {                if ($original -ne $fixed) {

                $oldChar = $replacement[0]                    $content = $content -replace [regex]::Escape("Alert.alert(""$original"""), "Alert.alert(""$fixed"""

                $newChar = $replacement[1]                    $changes += "Corregido mensaje de alerta: '$original' -> '$fixed'"

                if ($fixedText.Contains($oldChar)) {                }

                    $fixedText = $fixedText.Replace($oldChar, $newChar)            }

                }        }

            }        

                    # 4. Corregir comentarios con caracteres especiales

            if ($originalText -ne $fixedText) {        if ($content -match "//\s*([^\r\n]*[áéíóúüñÁÉÍÓÚÜÑ¿¡][^\r\n]*)") {

                $fullMatch = $match.Value            $matches = [regex]::Matches($content, "//\s*([^\r\n]*[áéíóúüñÁÉÍÓÚÜÑ¿¡][^\r\n]*)")

                $newText = $fullMatch.Replace($originalText, $fixedText)            foreach ($match in $matches) {

                $content = $content.Replace($fullMatch, $newText)                $original = $match.Groups[1].Value

                $changesArray += "Corregido mensaje de alerta: '$originalText' -> '$fixedText'"                $fixed = $original

            }                foreach ($key in $replacements.Keys) {

        }                    $fixed = $fixed -replace [regex]::Escape($key), $replacements[$key]

                        }

        # 3. Corregir comentarios                if ($original -ne $fixed) {

        $commentPattern = "\/\/\s*(.+)"                    $content = $content -replace [regex]::Escape("// $original"), "// $fixed"

        $commentMatches = [regex]::Matches($content, $commentPattern)                    $changes += "Corregido comentario: '$original' -> '$fixed'"

                        }

        foreach ($match in $commentMatches) {            }

            $originalText = $match.Groups[1].Value        }

            $fixedText = $originalText        

                    # Guardar cambios si se hicieron modificaciones

            foreach ($replacement in $charReplacements) {        if ($originalContent -ne $content) {

                $oldChar = $replacement[0]            # Crear backup

                $newChar = $replacement[1]            Copy-Item -Path $filePath -Destination "$filePath.bak" -Force

                if ($fixedText.Contains($oldChar)) {            

                    $fixedText = $fixedText.Replace($oldChar, $newChar)            # Guardar contenido modificado

                }            $content | Out-File -FilePath $filePath -Encoding ASCII

            }            

                        $changeLog = "Cambios en $filePath:`r`n" + ($changes -join "`r`n")

            if ($originalText -ne $fixedText) {            $changeLog | Out-File -FilePath $logFile -Append

                $fullMatch = $match.Value            

                $newText = $fullMatch.Replace($originalText, $fixedText)            Write-Host "  Modificado: $filePath" -ForegroundColor Green

                $content = $content.Replace($fullMatch, $newText)            foreach ($change in $changes) {

                $changesArray += "Corregido comentario: '$originalText' -> '$fixedText'"                Write-Host "    - $change" -ForegroundColor Yellow

            }            }

        }        } else {

                    Write-Host "  Sin cambios: $filePath" -ForegroundColor Gray

        # Guardar cambios si se hicieron modificaciones        }

        if ($originalContent -ne $content) {        

            # Crear backup    } catch {

            Copy-Item -Path $filePath -Destination "$filePath.bak" -Force        $errorMsg = "ERROR en $filePath`: $_"

                    $errorMsg | Out-File -FilePath $logFile -Append

            # Guardar contenido modificado        Write-Host $errorMsg -ForegroundColor Red

            $content | Out-File -FilePath $filePath -Encoding ASCII    }

            }

            $changeLog = "Cambios en $($filePath):`r`n" + ($changesArray -join "`r`n")

            $changeLog | Out-File -FilePath $logFile -Append# Procesar cada archivo de tracking

            $totalFiles = $trackingFiles.Count

            Write-Host "  Modificado: $filePath" -ForegroundColor Green$processedFiles = 0

            foreach ($change in $changesArray) {

                Write-Host "    - $change" -ForegroundColor Yellowforeach ($file in $trackingFiles) {

            }    $processedFiles++

        } else {    Write-Host "[$processedFiles/$totalFiles] " -NoNewline

            Write-Host "  Sin cambios: $filePath" -ForegroundColor Gray    Fix-JavaScriptFile -filePath $file.FullName

        }}

        

    } catch {# Crear informe de verificacion

        $errorMsg = "ERROR en $($filePath): $_"$reportFile = "$rootDir\tracking-ascii-report.md"

        $errorMsg | Out-File -FilePath $logFile -Append

        Write-Host $errorMsg -ForegroundColor Red$report = @"

    }# Informe de Conversion a ASCII - Sistema de Tracking Tables

}

Fecha: $(Get-Date -Format "yyyy-MM-dd")

# Procesar cada archivo de tracking

$totalFiles = $trackingFiles.Count## Archivos Procesados

$processedFiles = 0

Se han procesado $totalFiles archivos del sistema de tablas de seguimiento.

foreach ($file in $trackingFiles) {Log completo disponible en: $logFile

    $processedFiles++

    Write-Host "[$processedFiles/$totalFiles] " -NoNewline## Recomendaciones para el Sistema de Tracking

    Repair-JavaScriptFile -filePath $file.FullName

}1. **Textos en UI**:

   - Usar solo caracteres ASCII para todas las etiquetas y mensajes

# Crear informe de verificacion   - Para caracteres especiales, usar equivalentes ASCII

$reportFile = "$rootDir\tracking-ascii-report.md"

2. **Mensajes de Error**:

$report = @"   - Simplificar mensajes de error y alertas

# Informe de Conversion a ASCII - Sistema de Tracking Tables   - Evitar caracteres especiales en mensajes al usuario



Fecha: $(Get-Date -Format "yyyy-MM-dd")3. **Exportacion a CSV**:

   - Verificar que la exportacion a CSV maneje correctamente caracteres especiales

## Archivos Procesados   - Considerar la opcion de agregar un parametro de codificacion



Se han procesado $totalFiles archivos del sistema de tablas de seguimiento.4. **Pruebas de Compatibilidad**:

Log completo disponible en: $logFile   - Realizar pruebas en diferentes dispositivos y sistemas operativos

   - Verificar la visualizacion correcta de todos los textos

## Recomendaciones para el Sistema de Tracking

## Proximos Pasos

1. **Textos en UI**:

   - Usar solo caracteres ASCII para todas las etiquetas y mensajes1. Verificar funcionamiento de todas las caracteristicas del sistema de tracking

   - Para caracteres especiales, usar equivalentes ASCII2. Realizar pruebas de exportacion de datos

3. Verificar compatibilidad con dispositivos iOS y Android

2. **Mensajes de Error**:4. Actualizar documentacion con las consideraciones de codificacion ASCII

   - Simplificar mensajes de error y alertas

   - Evitar caracteres especiales en mensajes al usuario"@



3. **Exportacion a CSV**:$report | Out-File -FilePath $reportFile -Encoding ASCII

   - Verificar que la exportacion a CSV maneje correctamente caracteres especialesWrite-Host "`r`nInforme de verificacion creado en: $reportFile" -ForegroundColor Green

   - Considerar la opcion de agregar un parametro de codificacionWrite-Host "Revision de archivos JavaScript completada." -ForegroundColor Cyan

4. **Pruebas de Compatibilidad**:
   - Realizar pruebas en diferentes dispositivos y sistemas operativos
   - Verificar la visualizacion correcta de todos los textos

## Proximos Pasos

1. Verificar funcionamiento de todas las caracteristicas del sistema de tracking
2. Realizar pruebas de exportacion de datos
3. Verificar compatibilidad con dispositivos iOS y Android
4. Actualizar documentacion con las consideraciones de codificacion ASCII

"@

$report | Out-File -FilePath $reportFile -Encoding ASCII
Write-Host "`r`nInforme de verificacion creado en: $reportFile" -ForegroundColor Green
Write-Host "Revision de archivos JavaScript completada." -ForegroundColor Cyan