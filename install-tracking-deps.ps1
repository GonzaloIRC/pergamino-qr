# Script para instalar dependencias del módulo de tablas de seguimiento
# Este script utiliza caracteres ASCII para evitar problemas de codificación

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
Write-Title "PERGAMINO APP - INSTALACIÓN DE DEPENDENCIAS"
Write-Title "MÓDULO DE TABLAS DE SEGUIMIENTO"
Write-ColorMessage ""

# Verificar Node.js
Write-ColorMessage "Verificando Node.js..." $Yellow
try {
    $nodeVersion = node --version
    Write-ColorMessage "[OK] Node.js instalado: $nodeVersion" $Green
} catch {
    Write-ColorMessage "[X] Error: Node.js no está instalado o no está en el PATH." $Red
    Write-ColorMessage "Por favor, instala Node.js desde https://nodejs.org/" $Red
    exit 1
}

# Verificar NPM
Write-ColorMessage "Verificando NPM..." $Yellow
try {
    $npmVersion = npm --version
    Write-ColorMessage "[OK] NPM instalado: $npmVersion" $Green
} catch {
    Write-ColorMessage "[X] Error: NPM no está instalado correctamente." $Red
    exit 1
}

# Instalar dependencias principales del proyecto
Write-Title "DEPENDENCIAS PRINCIPALES"
Write-ColorMessage "Instalando dependencias principales del proyecto..." $Yellow

try {
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "[!] Advertencia: Hubo errores al instalar las dependencias principales." $Yellow
        Write-ColorMessage "    Intenta ejecutar 'npm install --force' manualmente si es necesario." $Yellow
    } else {
        Write-ColorMessage "[OK] Dependencias principales instaladas correctamente." $Green
    }
} catch {
    Write-ColorMessage "[X] Error al instalar dependencias principales: $_" $Red
}

# Instalar dependencias específicas para tablas de seguimiento
Write-Title "DEPENDENCIAS DEL MÓDULO"
Write-ColorMessage "Instalando dependencias específicas para tablas de seguimiento..." $Yellow

$trackingDependencies = @(
    "@react-native-community/datetimepicker",
    "react-native-csv",
    "react-native-fs",
    "expo-file-system",
    "expo-sharing",
    "expo-camera",
    "expo-barcode-scanner"
)

foreach ($dependency in $trackingDependencies) {
    Write-ColorMessage "Instalando $dependency..." $Yellow
    try {
        npm install $dependency --legacy-peer-deps
        if ($LASTEXITCODE -ne 0) {
            Write-ColorMessage "[!] Advertencia: No se pudo instalar $dependency." $Yellow
        } else {
            Write-ColorMessage "[OK] $dependency instalado correctamente." $Green
        }
    } catch {
        Write-ColorMessage "[X] Error al instalar $dependency: $_" $Red
    }
}

# Verificar instalación de Firebase
Write-Title "FIREBASE"
Write-ColorMessage "Verificando instalación de Firebase..." $Yellow

$firebaseDependencies = @(
    "firebase",
    "@firebase/firestore",
    "@firebase/auth"
)

$allFirebaseDepsInstalled = $true
foreach ($dependency in $firebaseDependencies) {
    if (Test-Path ".\node_modules\$dependency") {
        Write-ColorMessage "[OK] $dependency está instalado." $Green
    } else {
        Write-ColorMessage "[!] $dependency no está instalado. Intentando instalar..." $Yellow
        $allFirebaseDepsInstalled = $false
        try {
            npm install $dependency --legacy-peer-deps
            if ($LASTEXITCODE -eq 0) {
                Write-ColorMessage "[OK] $dependency instalado correctamente." $Green
            } else {
                Write-ColorMessage "[X] Error al instalar $dependency." $Red
            }
        } catch {
            Write-ColorMessage "[X] Error al instalar $dependency: $_" $Red
        }
    }
}

if ($allFirebaseDepsInstalled) {
    Write-ColorMessage "[OK] Todas las dependencias de Firebase están instaladas." $Green
} else {
    Write-ColorMessage "[!] Algunas dependencias de Firebase fueron instaladas recientemente." $Yellow
    Write-ColorMessage "    Reinicia tu aplicación para aplicar los cambios." $Yellow
}

# Verificar firebaseConfig.js
$firebaseConfigPath = ".\firebase\firebaseConfig.js"
if (Test-Path $firebaseConfigPath) {
    Write-ColorMessage "[OK] Archivo de configuración de Firebase encontrado." $Green
} else {
    Write-ColorMessage "[X] No se encontró el archivo de configuración de Firebase: $firebaseConfigPath" $Red
    Write-ColorMessage "    Asegúrate de tener la configuración de Firebase correctamente establecida." $Red
}

# Crear archivos adicionales si no existen
Write-Title "ARCHIVOS COMPLEMENTARIOS"

# Crear carpetas necesarias si no existen
$directories = @(
    ".\exports",
    ".\logs\tracking"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory | Out-Null
        Write-ColorMessage "[OK] Carpeta creada: $dir" $Green
    } else {
        Write-ColorMessage "[OK] Carpeta existente: $dir" $Green
    }
}

# Mensaje final
Write-Title "INSTALACIÓN COMPLETA"
Write-ColorMessage ""
Write-ColorMessage "Todas las dependencias necesarias para el módulo de tablas de seguimiento" $Green
Write-ColorMessage "han sido instaladas correctamente." $Green
Write-ColorMessage ""
Write-ColorMessage "Próximos pasos:" $Yellow
Write-ColorMessage "1. Inicializa datos de prueba con: .\setup-tracking-ascii.ps1" $Yellow
Write-ColorMessage "2. Verifica la configuración con: .\verify-tracking-tables.ps1" $Yellow
Write-ColorMessage "3. Inicia la aplicación con: npm start" $Yellow
Write-ColorMessage ""
Write-ColorMessage "Para más información, consulta:" $Yellow
Write-ColorMessage ".\docs\TRACKING_TABLE_MODULE.md" $Yellow
Write-ColorMessage ".\docs\tracking-tables-best-practices.md" $Yellow
Write-ColorMessage ""