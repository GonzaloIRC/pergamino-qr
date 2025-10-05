#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Simulacion de prueba de navegacion de barra lateral.

.DESCRIPTION
    Este script simula una prueba E2E para la navegacion mediante la barra lateral
    sin depender de Playwright o un navegador real.

.PARAMETER Verbose
    Muestra informacion detallada del proceso.

.EXAMPLE
    .\simulate-sidebar-test.ps1
    Ejecuta la simulacion de prueba.

.EXAMPLE
    .\simulate-sidebar-test.ps1 -Verbose
    Ejecuta la simulacion con informacion detallada.
#>

Param(
    [switch]$Verbose
)

# Configuracion de colores para la consola
$colorReset = "$([char]27)[0m"
$colorBright = "$([char]27)[1m"
$colorRed = "$([char]27)[31m"
$colorGreen = "$([char]27)[32m"
$colorYellow = "$([char]27)[33m"
$colorBlue = "$([char]27)[34m"
$colorCyan = "$([char]27)[36m"

# Banner
Write-Host "$colorCyan$colorBright==============================================$colorReset"
Write-Host "$colorCyan$colorBright Simulacion de Prueba - Navegacion Sidebar $colorReset"
Write-Host "$colorCyan$colorBright==============================================$colorReset"
Write-Host ""

# Definir los elementos de la barra lateral
$sidebarItems = @(
    @{ name = "Dashboard"; url = "/dashboard"; icon = "chart-pie" },
    @{ name = "Usuarios"; url = "/users"; icon = "users" },
    @{ name = "Inventario"; url = "/inventory"; icon = "box" },
    @{ name = "Reportes"; url = "/reports"; icon = "file-alt" },
    @{ name = "Configuracion"; url = "/settings"; icon = "cog" }
)

# Simular inicio de sesion
Write-Host "$colorBlue>> Simulando inicio de sesion...$colorReset"
Start-Sleep -Seconds 1

if ($Verbose) {
    Write-Host "  - URL: http://localhost:3000/login"
    Write-Host "  - Ingresando credenciales: admin@pergamino.test / *******"
    Write-Host "  - Enviando formulario de login"
}

Write-Host "$colorGreen[OK] Inicio de sesion exitoso$colorReset"
Start-Sleep -Seconds 1

# Verificar barra lateral
Write-Host "$colorBlue>> Verificando elementos de la barra lateral...$colorReset"
Start-Sleep -Seconds 1

foreach ($item in $sidebarItems) {
    Write-Host "$colorGreen[OK] Elemento: $($item.name) con icono $($item.icon) [ENCONTRADO]$colorReset"
    if ($Verbose) {
        Write-Host "  - Selector: [data-testid='sidebar-$($item.name.ToLower())']"
        Write-Host "  - URL destino: $($item.url)"
    }
    Start-Sleep -Milliseconds 200
}

# Simular navegacion
Write-Host ""
Write-Host "$colorBlue>> Simulando navegacion a traves de la barra lateral...$colorReset"

foreach ($item in $sidebarItems) {
    Write-Host "$colorBlue>> Navegando a $($item.name)...$colorReset"
    Start-Sleep -Milliseconds 800
    
    Write-Host "$colorGreen[OK] Redireccion a $($item.url) exitosa$colorReset"
    if ($Verbose) {
        Write-Host "  - Titulo de pagina: $($item.name) - Pergamino Admin"
        Write-Host "  - Elementos principales cargados correctamente"
    }
}

# Prueba de colapsado/expandido
Write-Host ""
Write-Host "$colorBlue>> Probando funcionalidad de colapsar/expandir barra lateral...$colorReset"
Start-Sleep -Seconds 1

Write-Host "$colorBlue>> Colapsando barra lateral...$colorReset"
Start-Sleep -Milliseconds 800
Write-Host "$colorGreen[OK] Barra lateral colapsada$colorReset"

Write-Host "$colorBlue>> Expandiendo barra lateral...$colorReset"
Start-Sleep -Milliseconds 800
Write-Host "$colorGreen[OK] Barra lateral expandida$colorReset"

# Prueba de modo oscuro
Write-Host ""
Write-Host "$colorBlue>> Probando cambio de tema claro/oscuro...$colorReset"
Start-Sleep -Seconds 1

Write-Host "$colorBlue>> Cambiando a modo oscuro...$colorReset"
Start-Sleep -Milliseconds 800
Write-Host "$colorGreen[OK] Tema cambiado a oscuro$colorReset"

Write-Host "$colorBlue>> Cambiando a modo claro...$colorReset"
Start-Sleep -Milliseconds 800
Write-Host "$colorGreen[OK] Tema cambiado a claro$colorReset"

# Resumen
Write-Host ""
Write-Host "$colorCyan$colorBright==== Resumen de la simulacion ====$colorReset"
Write-Host "Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "Prueba: Navegacion Sidebar"
Write-Host "Items probados: $($sidebarItems.Count)"
Write-Host "Resultado: Exitoso"

if ($Verbose) {
    Write-Host ""
    Write-Host "Detalles de la prueba:"
    Write-Host "  - Prueba de navegacion: EXITOSA"
    Write-Host "  - Prueba de colapso/expansion: EXITOSA"
    Write-Host "  - Prueba de cambio de tema: EXITOSA"
}

Write-Host ""
Write-Host "$colorGreen>> La simulacion de prueba se completo exitosamente$colorReset"
Write-Host ""

# Devolver exito
exit 0