#!/usr/bin/env pwsh
# Script para ejecutar el flujo completo de pruebas

# Función para mostrar mensajes coloridos
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

# Determinar si usar Firebase real o emuladores
$useRealFirebase = $true  # Cambiado a true para usar Firebase real

if ($useRealFirebase) {
    Write-ColorMessage "Ejecutando pruebas con Firebase REAL (no emuladores)" -ForegroundColor Green
    Write-ColorMessage "Asegúrate de tener las credenciales correctas configuradas" -ForegroundColor Yellow
    
    # Configurar variables de entorno para Firebase real
    $env:NEXT_PUBLIC_USE_EMULATORS = "false"
    
    # Crear un archivo temporal .env.e2e para las pruebas con Firebase real sin modificar .env.local
    $e2eEnvPath = "apps/admin-web/.env.e2e"
    
    if (Test-Path -Path "apps/admin-web/.env.local") {
        # Copiar .env.local a .env.e2e pero con emuladores desactivados
        $envContent = Get-Content -Path "apps/admin-web/.env.local" -Raw
        $envContent = $envContent -replace "NEXT_PUBLIC_USE_EMULATORS=true", "NEXT_PUBLIC_USE_EMULATORS=false"
        Set-Content -Path $e2eEnvPath -Value $envContent
        Write-ColorMessage "Creado archivo temporal $e2eEnvPath con emuladores desactivados" -ForegroundColor Green
        
        # Configurar para usar .env.e2e en lugar de .env.local durante las pruebas
        $env:NODE_ENV = "e2e"
    } else {
        Write-ColorMessage "⚠️ No se encontró archivo .env.local, las pruebas pueden fallar" -ForegroundColor Yellow
    }
    
    # Verificar/crear usuario admin en Firebase real
    Write-ColorMessage "Verificando usuario admin en Firebase real..." -ForegroundColor Cyan
    
    # Verificar si el paquete firebase-admin está instalado
    $firebaseAdminInstalled = npm list firebase-admin | Out-String
    if (-not ($firebaseAdminInstalled -match "firebase-admin")) {
        Write-ColorMessage "Instalando firebase-admin..." -ForegroundColor Yellow
        npm install --no-save firebase-admin
    }
    
    # Ejecutar script para verificar/crear usuario admin
    Write-ColorMessage "Ejecutando script de configuración de usuario admin..." -ForegroundColor Cyan
    node scripts/setupAdminUser.js
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "⚠️ Advertencia: No se pudo verificar/crear el usuario admin. Las pruebas podrían fallar." -ForegroundColor Yellow
        $confirmContinue = Read-Host "¿Deseas continuar de todas formas? (s/n)"
        if ($confirmContinue -ne "s" -and $confirmContinue -ne "S") {
            Write-ColorMessage "Cancelando pruebas." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-ColorMessage "✅ Usuario admin verificado/creado correctamente" -ForegroundColor Green
        Write-ColorMessage "📧 Email: admin@local.test" -ForegroundColor Green
        Write-ColorMessage "🔑 Password: Admin123!" -ForegroundColor Green
    }
} else {
    # Verificar si los emuladores están en ejecución
    try {
        Write-ColorMessage "Intentando conectar con los emuladores de Firebase..." -ForegroundColor Cyan
        Invoke-RestMethod -Uri "http://localhost:4000/emulator/v1/projects/demo-pergamino" -Method GET -ErrorAction Stop
        Write-ColorMessage "Emuladores de Firebase detectados en ejecucion" -ForegroundColor Green
        
        # Configurar variables de entorno para emuladores
        $env:NEXT_PUBLIC_USE_EMULATORS = "true"
    }
    catch {
        # Para propósitos de prueba, continuaremos aunque los emuladores no estén corriendo
        Write-ColorMessage "Los emuladores de Firebase no estan en ejecucion o no responden" -ForegroundColor Yellow
        Write-ColorMessage "Continuando de todas formas para verificar la estructura del código..." -ForegroundColor Yellow
    }
    
    # Crear usuario de prueba en los emuladores
    if ($null -ne (Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "firebase" })) {
        Write-ColorMessage "Creando usuario de prueba en emulador..." -ForegroundColor Cyan
        node scripts/createTestUser.js
    } else {
        Write-ColorMessage "Omitiendo creación de usuario de prueba (emuladores no disponibles)" -ForegroundColor Yellow
    }
}

# Verificar si hay duplicaciones en el código y moverlos a backup
if (Test-Path -Path "apps/admin-web/app/lib/auth.tsx") {
    Write-ColorMessage "Moviendo implementación duplicada de auth.tsx a backup..." -ForegroundColor Yellow
    if (-not (Test-Path -Path "apps/admin-web/duplicated-auth-backup")) {
        New-Item -Path "apps/admin-web/duplicated-auth-backup" -ItemType Directory -Force | Out-Null
    }
    Copy-Item -Path "apps/admin-web/app/lib/auth.tsx" -Destination "apps/admin-web/duplicated-auth-backup/auth.tsx" -Force
}

# Cargar variables de entorno para pruebas
Write-ColorMessage "Cargando variables de entorno para pruebas..." -ForegroundColor Cyan
Set-Location -Path "apps/admin-web"
if (Test-Path ".\load-test-env.ps1") {
    . .\load-test-env.ps1
    Write-ColorMessage "Variables de entorno cargadas correctamente" -ForegroundColor Green
} else {
    Write-ColorMessage "No se encontro el script load-test-env.ps1" -ForegroundColor Red
    exit 1
}

# Verificar si las variables críticas están definidas
Write-ColorMessage "Verificando variables de entorno criticas..." -ForegroundColor Cyan
$requiredVars = @(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_APP_ID"
)

$allVarsPresent = $true
foreach ($var in $requiredVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ([string]::IsNullOrEmpty($value)) {
        Write-ColorMessage "Variable $var no esta definida" -ForegroundColor Red
        $allVarsPresent = $false
    } else {
        Write-ColorMessage "$var = $value" -ForegroundColor Green
    }
}

# Mostrar el modo actual (emuladores o real)
Write-ColorMessage "NEXT_PUBLIC_USE_EMULATORS = $($env:NEXT_PUBLIC_USE_EMULATORS)" -ForegroundColor Cyan
Write-ColorMessage "Usando Firebase " + $(if ($env:NEXT_PUBLIC_USE_EMULATORS -eq "true") {"EMULADORES"} else {"REAL"}) -ForegroundColor Magenta

if (-not $allVarsPresent) {
    Write-ColorMessage "Faltan variables de entorno criticas" -ForegroundColor Yellow
    Write-ColorMessage "¡Advertencia! El script continuará pero las pruebas pueden fallar si faltan variables críticas." -ForegroundColor Yellow
}

# Verificar si hay un servidor en ejecución o iniciar uno nuevo
Write-ColorMessage "Verificando servidor para pruebas..." -ForegroundColor Cyan

# Detener cualquier proceso Next.js existente para evitar conflictos
Write-ColorMessage "Deteniendo procesos Next.js existentes..." -ForegroundColor Yellow
Stop-Process -Name node -ErrorAction SilentlyContinue

# Puerto predeterminado para pruebas
$serverPort = 3000

# Verificar si el puerto está disponible
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $portCheck = $tcpClient.BeginConnect("localhost", $serverPort, $null, $null)
    $wait = $portCheck.AsyncWaitHandle.WaitOne(100, $false)
    
    if ($wait) {
        # El puerto está en uso
        Write-ColorMessage "Puerto $serverPort ya está en uso. Intentando detener el proceso..." -ForegroundColor Yellow
        # Intentar detener el proceso usando el puerto
        if ($IsWindows -or $PSVersionTable.PSVersion.Major -lt 6) {
            # Windows
            $processId = netstat -ano | findstr ":$serverPort" | findstr "LISTENING" | ForEach-Object { $_.Split(" ")[-1] }
            if ($processId) {
                Write-ColorMessage "Deteniendo proceso con ID $processId que usa el puerto $serverPort" -ForegroundColor Yellow
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 2
            }
        }
    } else {
        Write-ColorMessage "Puerto $serverPort está disponible para pruebas." -ForegroundColor Green
    }
    $tcpClient.Close()
} catch {
    Write-ColorMessage "Error verificando puertos: $_" -ForegroundColor Red
}

# Iniciar el servidor Next.js para pruebas en un proceso separado
Write-ColorMessage "Iniciando servidor Next.js para pruebas en puerto $serverPort..." -ForegroundColor Green
$global:nextProcess = Start-Process powershell -ArgumentList "cd '$PWD'; npx next dev -p $serverPort" -WindowStyle Normal -PassThru

# Esperar a que el servidor esté disponible
Write-ColorMessage "Esperando a que el servidor Next.js esté disponible..." -ForegroundColor Yellow
$maxRetries = 10
$retryCount = 0
$serverReady = $false

while (-not $serverReady -and $retryCount -lt $maxRetries) {
    $retryCount++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$serverPort" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            Write-ColorMessage "¡Servidor Next.js está listo!" -ForegroundColor Green
        }
    } catch {
        Write-ColorMessage "Esperando al servidor ($retryCount/$maxRetries)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

# Salir si el servidor no está listo después de los intentos
if (-not $serverReady) {
    Write-ColorMessage "No se pudo iniciar el servidor Next.js después de $maxRetries intentos." -ForegroundColor Red
    if ($null -ne $global:nextProcess) {
        Stop-Process -Id $global:nextProcess.Id -Force -ErrorAction SilentlyContinue
    }
    exit 1
}

# Mostramos un mensaje de que estamos usando Firebase real
if ($env:NEXT_PUBLIC_USE_EMULATORS -ne "true") {
    Write-ColorMessage "IMPORTANTE: Ejecutando pruebas con FIREBASE REAL" -ForegroundColor Magenta
    Write-ColorMessage "Asegúrate de tener un usuario admin@local.test configurado en tu proyecto de Firebase" -ForegroundColor Magenta
    Write-ColorMessage "Presiona CTRL+C para cancelar o cualquier tecla para continuar..." -ForegroundColor Yellow
    $null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Verificar que el servidor de desarrollo ya está en ejecución
Write-ColorMessage "Verificando que el servidor de desarrollo está en ejecución..." -ForegroundColor Cyan
# No necesitamos iniciar un servidor ya que asumimos que ya está en ejecución
# Podemos añadir un pequeño delay para asegurarnos de que el servidor está listo
Start-Sleep -Seconds 2

# Verificar si el servidor está respondiendo correctamente
$serverUrl = "http://localhost:$serverPort"
$loginUrl = "$serverUrl/login"

Write-ColorMessage "Verificando si el servidor está respondiendo en $loginUrl..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $loginUrl -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
    
    # Verificar si la página de login tiene los elementos esperados
    if ($response.Content -match 'id="email"|id="password"|type="submit"') {
        Write-ColorMessage "Servidor respondiendo correctamente con la página de login." -ForegroundColor Green
    } else {
        Write-ColorMessage "La página de login no parece tener los elementos esperados." -ForegroundColor Yellow
    }
} catch {
    Write-ColorMessage "El servidor no está respondiendo correctamente: $_" -ForegroundColor Red
    exit 1
}

# Ejecutar pruebas directamente con la URL correcta
try {
    # Actualizar la URL base para las pruebas
    $serverUrl = "http://localhost:$serverPort"
    $env:PLAYWRIGHT_TEST_BASE_URL = $serverUrl
    Write-ColorMessage "Configurando URL base para pruebas: $serverUrl" -ForegroundColor Cyan
    
    # Variable para seguir si todas las pruebas pasan
    $allTestsPassed = $true
    
    # 1. Prueba de redirección
    Write-ColorMessage "1. Ejecutando prueba de redirección..." -ForegroundColor Cyan
    
    # Volver al directorio raíz para ejecutar estas pruebas
    Push-Location "../../"
    
    # Usar la configuración de Playwright de la raíz
    npx playwright test "tests/e2e/redirection.spec.ts" --config=playwright.config.ts --project=chromium
    
    # Guardar el resultado
    $redirResult = $LASTEXITCODE
    
    # Regresar al directorio anterior
    Pop-Location
    
    if ($redirResult -ne 0) {
        Write-ColorMessage "❌ Prueba de redirección falló" -ForegroundColor Red
        $allTestsPassed = $false
    } else {
        Write-ColorMessage "✅ Prueba de redirección exitosa" -ForegroundColor Green
    }

    # 2. Prueba de estructura del sidebar
    Write-ColorMessage "2. Ejecutando prueba de estructura del sidebar..." -ForegroundColor Cyan
    npx playwright test ./tests/e2e/sidebar-structure.spec.ts --project=chromium
    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "❌ Prueba de estructura del sidebar falló" -ForegroundColor Red
        $allTestsPassed = $false
    } else {
        Write-ColorMessage "✅ Prueba de estructura del sidebar exitosa" -ForegroundColor Green
    }

    # 3. Prueba de login con usuario real
    Write-ColorMessage "3. Ejecutando prueba de login con usuario real..." -ForegroundColor Cyan
    
    # Volver al directorio raíz para ejecutar estas pruebas
    Push-Location "../../"
    
    # Usar la configuración de Playwright de la raíz
    npx playwright test "tests/e2e/real-login.spec.ts" --config=playwright.config.ts --project=chromium
    
    # Guardar el resultado
    $loginResult = $LASTEXITCODE
    
    # Regresar al directorio anterior
    Pop-Location
    
    if ($loginResult -ne 0) {
        Write-ColorMessage "❌ Prueba de login con usuario real falló" -ForegroundColor Red
        $allTestsPassed = $false
    } else {
        Write-ColorMessage "✅ Prueba de login con usuario real exitosa" -ForegroundColor Green
    }

    # 4. Prueba de navegación
    Write-ColorMessage "4. Ejecutando prueba de navegación..." -ForegroundColor Cyan
    npx playwright test ./tests/e2e/navigation.spec.ts --project=chromium
    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "❌ Prueba de navegación falló" -ForegroundColor Red
        $allTestsPassed = $false
    } else {
        Write-ColorMessage "✅ Prueba de navegación exitosa" -ForegroundColor Green
    }

    # 5. Prueba del panel de administración específico
    Write-ColorMessage "5. Ejecutando prueba del panel de administración..." -ForegroundColor Cyan
    npx playwright test ./tests/e2e/admin-panel.spec.ts -g "admin user can login successfully" --project=chromium
    if ($LASTEXITCODE -ne 0) {
        Write-ColorMessage "❌ Prueba del panel de administración falló" -ForegroundColor Red
        $allTestsPassed = $false
    } else {
        Write-ColorMessage "✅ Prueba del panel de administración exitosa" -ForegroundColor Green
    }
    
    # Mostrar reporte
    Write-ColorMessage "Mostrando reporte de pruebas..." -ForegroundColor Cyan
    npx playwright show-report --port 9325
    
    # Mostrar resumen final
    Write-ColorMessage "`n=============================================" -ForegroundColor Cyan
    if ($allTestsPassed) {
        Write-ColorMessage "✅ TODAS LAS PRUEBAS HAN PASADO EXITOSAMENTE" -ForegroundColor Green
        Write-ColorMessage "Listo para hacer commit y push del PR fix/admin-auth-dashboard" -ForegroundColor Green
    } else {
        Write-ColorMessage "❌ ALGUNAS PRUEBAS HAN FALLADO" -ForegroundColor Red
        Write-ColorMessage "Revisa los errores antes de hacer commit" -ForegroundColor Red
    }
    Write-ColorMessage "=============================================" -ForegroundColor Cyan
} catch {
    Write-ColorMessage "Error ejecutando las pruebas: $_" -ForegroundColor Red
}

# Función para limpiar los procesos al finalizar
function Clear-TestResources {
    Write-ColorMessage "Limpiando recursos y deteniendo procesos..." -ForegroundColor Yellow
    if ($null -ne $global:nextProcess) {
        try {
            Stop-Process -Id $global:nextProcess.Id -Force -ErrorAction SilentlyContinue
            Write-ColorMessage "Servidor Next.js detenido." -ForegroundColor Green
        } catch {
            Write-ColorMessage "Error al detener el servidor Next.js: $_" -ForegroundColor Red
        }
    }
    
    # Detener cualquier proceso node restante
    Stop-Process -Name node -ErrorAction SilentlyContinue
}

# Registrar evento para limpiar recursos al salir
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Clear-TestResources } -ErrorAction SilentlyContinue

# Preguntar si quiere mantener el servidor en ejecución
Write-ColorMessage "`nPruebas completadas." -ForegroundColor Green
$keepServerRunning = Read-Host "¿Deseas mantener el servidor en ejecución para pruebas adicionales? (s/n)"

if ($keepServerRunning -eq "s" -or $keepServerRunning -eq "S") {
    Write-ColorMessage "Dejando el servidor en ejecución para pruebas adicionales..." -ForegroundColor Cyan
    Write-ColorMessage "IMPORTANTE: Recuerda detener manualmente el proceso cuando termines." -ForegroundColor Yellow
} else {
    Clear-TestResources
}

# Volver al directorio raíz
Set-Location -Path "../.."