# Scripts de Prueba E2E para Pergamino App

Este directorio incluye scripts para ejecutar y simular pruebas E2E de la aplicación Pergamino. Estos complementan las herramientas de desarrollo existentes documentadas en este README.

## Scripts de Prueba E2E

### Scripts de prueba real

- `test-kpi-export.ps1`: Prueba la exportación de KPIs con Playwright
- `test-sidebar.ps1`: Prueba la navegación de la barra lateral con Playwright
- `test-history-export.ps1`: Prueba la exportación de datos históricos con Playwright
- `run-all-e2e.ps1`: Ejecuta todas las pruebas E2E secuencialmente

### Scripts de simulación (sin navegador)

- `simulate-kpi-export-test.ps1`: Simula la prueba de exportación de KPIs
- `simulate-sidebar-test.ps1`: Simula la prueba de navegación de barra lateral
- `test-basic-powershell-ascii.ps1`: Prueba básica para verificar PowerShell
- `run-all-simulations.ps1`: Ejecuta todas las simulaciones secuencialmente

### Scripts de utilidad

- `fix-powershell-encoding.ps1`: Corrige problemas de codificación en scripts PowerShell

## Consideraciones importantes para scripts PowerShell

### Problemas de codificación

Para evitar problemas con caracteres especiales en PowerShell, estos scripts:

1. Evitan el uso de caracteres Unicode especiales (✓, ❌, ⚠️)
2. Usan alternativas ASCII como `[OK]`, `[X]`, `[!]`
3. Eliminan acentos en comentarios y cadenas

### Ejecución de scripts

Para ejecutar un script, use el siguiente comando desde PowerShell:

```powershell
.\tools\nombre-del-script.ps1
```

Para obtener ayuda sobre un script específico:

```powershell
Get-Help .\tools\nombre-del-script.ps1 -Full
```

## Ejemplos de uso

### Ejecutar una prueba específica con interfaz gráfica

```powershell
.\tools\test-kpi-export.ps1 -Headless $false
```

### Ejecutar todas las pruebas y generar reportes

```powershell
.\tools\run-all-e2e.ps1 -GenerateReport
```

### Ejecutar las simulaciones con información detallada

```powershell
.\tools\run-all-simulations.ps1 -Verbose
```

## Resolución de problemas

Si encuentra errores relacionados con la codificación:

1. Asegúrese de que los archivos están guardados con codificación UTF-8
2. Evite usar caracteres especiales en los scripts
3. Utilice el script `fix-powershell-encoding.ps1` para corregir problemas

Si Playwright no puede iniciar un servidor:

1. Use la opción `-config=playwright.config.simple.js` para no intentar iniciar un servidor
2. Asegúrese de que el servidor de desarrollo esté en ejecución antes de las pruebas