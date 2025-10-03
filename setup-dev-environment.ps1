# Script para preparar el entorno de desarrollo después de clonar el repo
# Crea los archivos de configuración necesarios a partir de los ejemplos

# Colores para mensajes
$Green = @{ForegroundColor = "Green"}
$Yellow = @{ForegroundColor = "Yellow"}
$Red = @{ForegroundColor = "Red"}

# Función para crear archivos a partir de ejemplos
function Copy-ExampleToReal {
    param (
        [string]$ExampleFile,
        [string]$RealFile
    )
    
    if (Test-Path $ExampleFile) {
        if (-not (Test-Path $RealFile)) {
            Copy-Item $ExampleFile $RealFile
            Write-Host "  Creado: $RealFile" @Green
            return $true
        } else {
            Write-Host "  El archivo $RealFile ya existe" @Yellow
            return $false
        }
    } else {
        Write-Host "  No se encontró el archivo de ejemplo: $ExampleFile" @Red
        return $false
    }
}

Write-Host "Configurando entorno de desarrollo..." @Yellow

# Configuración de archivos de entorno
$envFiles = @(
    @{example = ".env.example"; real = ".env.local"},
    @{example = ".env.example"; real = ".env.development"},
    @{example = ".env.example"; real = ".env.staging"}
)

foreach ($env in $envFiles) {
    Copy-ExampleToReal -ExampleFile $env.example -RealFile $env.real
}

# Configuración de Firebase
$firebaseDir = "firebase"
if (Test-Path $firebaseDir) {
    Copy-ExampleToReal -ExampleFile "$firebaseDir/firebaseConfig.example.js" -RealFile "$firebaseDir/firebaseConfig.js"
}

Write-Host "`nConfiguracion inicial completada!" @Green
Write-Host "`nIMPORTANTE: Recuerda editar los archivos creados con tus credenciales reales." @Yellow