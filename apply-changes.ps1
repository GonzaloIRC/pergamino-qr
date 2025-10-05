# Script para aplicar cambios específicos de feat/m2-inapp-admin a la nueva rama sincronizada
# Este script debe ejecutarse desde la rama feat/m2-inapp-admin-sync

# Colores para mensajes
$Green = @{ForegroundColor = "Green"}
$Yellow = @{ForegroundColor = "Yellow"}
$Red = @{ForegroundColor = "Red"}
$Cyan = @{ForegroundColor = "Cyan"}

# Función para copiar archivos específicos
function Copy-SpecificFiles {
    param (
        [string]$SourceBranch,
        [string[]]$FilePaths
    )
    
    Write-Host "`nCopiando archivos específicos desde $SourceBranch..." @Yellow
    
    foreach ($file in $FilePaths) {
        if (Test-Path $file) {
            # Respaldar el archivo actual si existe
            if (Test-Path $file) {
                Copy-Item $file "$file.orig" -Force
                Write-Host "  Respaldado: $file → $file.orig" @Cyan
            }
            
            # Copiar el archivo desde la rama fuente
            git checkout $SourceBranch -- $file
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Copiado: $file desde $SourceBranch" @Green
            } else {
                Write-Host "  Error al copiar: $file" @Red
            }
        } else {
            Write-Host "  Archivo no encontrado: $file" @Red
        }
    }
}

# Verifica que estamos en la rama correcta
$currentBranch = git branch --show-current
if ($currentBranch -ne "feat/m2-inapp-admin-sync") {
    Write-Host "Este script debe ejecutarse desde la rama feat/m2-inapp-admin-sync" @Red
    Write-Host "Rama actual: $currentBranch" @Red
    exit 1
}

# Lista de archivos a copiar desde feat/m2-inapp-admin
$filesToCopy = @(
    # Configuración y scripts
    ".gitignore",
    "secure-sync.ps1",
    "secure-sync.sh",
    "setup-dev-environment.ps1",
    "setup-dev-environment.sh",
    "firebase/firebaseConfig.example.js",
    
    # Estructura apps/
    "apps/mobile-expo/package-lock.json",
    "apps/mobile-expo/tsconfig.json",
    
    # Scripts para desarrollo
    "check-protected-routes.ps1",
    "create-dev-build-advanced.bat",
    "create-dev-build.bat",
    "create-eas-dev-build.bat",
    "install-test-deps.ps1",
    "install-test-deps.sh",
    "prepare-and-build-dev.bat",
    "run-complete-tests.ps1",
    "run-full-test.ps1",
    "run-mobile-app-isolated.ps1",
    "run-mobile-app.ps1",
    "run-mobile-minimal.ps1",
    "run-test-with-debug.ps1",
    "run-test-with-emulators.ps1",
    "run-tests-with-real-firebase.ps1",
    "start-dev-build.bat",
    "start-expo.bat",
    "start-expo.ps1",
    "start-mobile-app-simple.ps1",
    "start-mobile-app.ps1",
    "start-with-expo-go.bat",
    
    # Directorios completos
    "packages",
    "__tests__",
    "tests"
)

# Copia los archivos
Copy-SpecificFiles -SourceBranch "feat/m2-inapp-admin" -FilePaths $filesToCopy

# Mensaje final
Write-Host "`n✅ Archivos copiados con éxito" @Green
Write-Host "`nIMPORTANTE: Revisa y resuelve posibles conflictos antes de hacer commit" @Yellow
Write-Host "           Verifica que todos los archivos funcionen correctamente" @Yellow