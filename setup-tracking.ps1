# Pergamino App - Configuración del módulo de tablas de seguimiento
# Este script instala las dependencias necesarias y configura el entorno de desarrollo

# Colores para mensajes
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Red = [System.ConsoleColor]::Red

# Función para mostrar mensajes
function Write-ColorMessage {
    param(
        [string] $Message,
        [System.ConsoleColor] $Color = [System.ConsoleColor]::White
    )
    Write-Host $Message -ForegroundColor $Color
}

# Cabecera
Write-ColorMessage "==================================" $Green
Write-ColorMessage "   PERGAMINO APP - CONFIGURACION  " $Green
Write-ColorMessage "   TABLAS DE SEGUIMIENTO          " $Green
Write-ColorMessage "==================================" $Green
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

# Instalar dependencias
Write-ColorMessage "Instalando dependencias del proyecto..." $Yellow
npm install --legacy-peer-deps

# Verificar si hay errores
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "Error al instalar las dependencias. Intente con: npm install --force" $Red
    exit 1
} else {
    Write-ColorMessage "Dependencias instaladas correctamente." $Green
}

# Instalar dependencias específicas para el módulo de tablas de seguimiento
Write-ColorMessage "Instalando dependencias adicionales para tablas de seguimiento..." $Yellow
npm install @react-native-community/datetimepicker --legacy-peer-deps

# Verificar si hay errores
if ($LASTEXITCODE -ne 0) {
    Write-ColorMessage "Error al instalar dependencias adicionales." $Red
    exit 1
} else {
    Write-ColorMessage "Dependencias adicionales instaladas correctamente." $Green
}

# Inicializar datos de prueba
Write-ColorMessage "¿Deseas inicializar datos de prueba para las tablas de seguimiento?" $Yellow
$response = Read-Host "Escribe 's' para sí o 'n' para no"
if ($response -eq 's' -or $response -eq 'S') {
    Write-ColorMessage "Inicializando datos de prueba..." $Yellow
    try {
        node init-tracking-data.js
        if ($LASTEXITCODE -ne 0) {
            Write-ColorMessage "Error al inicializar los datos de prueba." $Red
        } else {
            Write-ColorMessage "Datos de prueba inicializados correctamente." $Green
        }
    } catch {
        Write-ColorMessage "Error al ejecutar el script de inicialización: $_" $Red
    }
}

# Mensaje final
Write-ColorMessage ""
Write-ColorMessage "==================================" $Green
Write-ColorMessage "   CONFIGURACION COMPLETADA       " $Green
Write-ColorMessage "==================================" $Green
Write-ColorMessage ""
Write-ColorMessage "Para iniciar la aplicacion, ejecuta:" $Yellow
Write-ColorMessage "npm start" $Yellow
Write-ColorMessage ""
Write-ColorMessage "Documentacion disponible en:" $Yellow
Write-ColorMessage "./docs/TRACKING_TABLE_MODULE.md" $Yellow
Write-ColorMessage ""