# Script para verificar la configuración de tablas de seguimiento
# Este script comprueba si las tablas de seguimiento están correctamente configuradas

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
Write-Title "PERGAMINO APP - VERIFICACIÓN DE TABLAS DE SEGUIMIENTO"
Write-ColorMessage ""

# Verificar Node.js
Write-ColorMessage "Verificando Node.js..." $Yellow
try {
    $nodeVersion = node --version
    Write-ColorMessage "Node.js instalado: $nodeVersion" $Green
} catch {
    Write-ColorMessage "Error: Node.js no está instalado o no está en el PATH." $Red
    Write-ColorMessage "Por favor, instala Node.js desde https://nodejs.org/" $Red
    exit 1
}

# Verificar Firebase CLI
Write-ColorMessage "Verificando Firebase CLI..." $Yellow
try {
    $firebaseVersion = firebase --version
    Write-ColorMessage "Firebase CLI instalado: $firebaseVersion" $Green
} catch {
    Write-ColorMessage "Advertencia: Firebase CLI no está instalado." $Yellow
    Write-ColorMessage "Es recomendable instalar Firebase CLI con: npm install -g firebase-tools" $Yellow
}

# Verificar configuración de Firebase
Write-Title "VERIFICACIÓN DE FIREBASE"

# Comprobar si existe el archivo de configuración de Firebase
$firebaseConfigPath = ".\firebase\firebaseConfig.js"
if (Test-Path $firebaseConfigPath) {
    Write-ColorMessage "Archivo de configuración de Firebase encontrado." $Green

    # Intentar leer el archivo para verificar que contiene información válida
    $content = Get-Content $firebaseConfigPath -Raw
    if ($content -match "apiKey" -and $content -match "projectId") {
        Write-ColorMessage "La configuración de Firebase parece válida." $Green
    } else {
        Write-ColorMessage "Advertencia: La configuración de Firebase podría estar incompleta." $Yellow
    }
} else {
    Write-ColorMessage "Error: No se encontró el archivo de configuración de Firebase." $Red
    Write-ColorMessage "Asegúrate de que el archivo $firebaseConfigPath exista y contenga la configuración correcta." $Red
    exit 1
}

# Verificar estructura de archivos para tablas de seguimiento
Write-Title "VERIFICACIÓN DE ARCHIVOS DEL MÓDULO"

# Lista de archivos importantes para el módulo
$requiredFiles = @(
    ".\init-tracking-data.js",
    ".\docs\TRACKING_TABLE_MODULE.md",
    ".\src\components\TrackingTable.js",
    ".\src\screens\TrackingDashboard.js",
    ".\src\screens\TrackingTableSetup.js"
)

$allFilesFound = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-ColorMessage "Archivo encontrado: $file" $Green
    } else {
        Write-ColorMessage "Error: No se encontró $file" $Red
        $allFilesFound = $false
    }
}

if (-not $allFilesFound) {
    Write-ColorMessage "Faltan algunos archivos necesarios para el módulo de tablas de seguimiento." $Yellow
} else {
    Write-ColorMessage "Todos los archivos necesarios están presentes." $Green
}

# Verificar si se han inicializado datos de prueba
Write-Title "VERIFICACIÓN DE DATOS DE PRUEBA"
Write-ColorMessage "Para verificar la existencia de datos de prueba, se requiere conexión a Firebase." $Yellow
Write-ColorMessage ""
Write-ColorMessage "Deseas ejecutar la inicialización de datos de prueba? (s/n)" $Yellow
$response = Read-Host

if ($response -eq 's' -or $response -eq 'S') {
    Write-ColorMessage "Inicializando datos de prueba..." $Yellow
    try {
        npx babel-node init-tracking-data.js
        Write-ColorMessage "Si no hubo errores, los datos de prueba se han inicializado correctamente." $Green
    } catch {
        Write-ColorMessage "Error al ejecutar el script de inicialización: $_" $Red
    }
} else {
    Write-ColorMessage "Omitiendo inicialización de datos de prueba." $Yellow
    Write-ColorMessage "Para inicializarlos más tarde, ejecuta: npx babel-node init-tracking-data.js" $Yellow
}

# Recomendaciones finales
Write-Title "RECOMENDACIONES"
Write-ColorMessage "1. Asegúrate de que la autenticación de Firebase esté configurada correctamente." $Yellow
Write-ColorMessage "2. Verifica las reglas de seguridad de Firestore para proteger las tablas de seguimiento." $Yellow
Write-ColorMessage "3. Consulta la documentación en docs/TRACKING_TABLE_MODULE.md para más detalles." $Yellow

# Mensaje final
Write-Title "VERIFICACIÓN COMPLETA"
Write-ColorMessage ""
Write-ColorMessage "Para iniciar la aplicación con el módulo de tablas de seguimiento, ejecuta:" $Yellow
Write-ColorMessage "npm start" $Yellow
Write-ColorMessage ""