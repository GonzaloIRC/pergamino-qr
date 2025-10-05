# Scripts de Pruebas E2E para Pergamino Web

Este directorio contiene scripts PowerShell para automatizar pruebas end-to-end de la aplicación web administrativa de Pergamino.

## Requisitos Previos

- Node.js y npm instalados
- PowerShell 5.1 o superior
- Playwright instalado (`npx playwright install --with-deps`)

## Scripts Disponibles

### 1. Ejecutar todas las pruebas

```powershell
.\tools\run-all-e2e.ps1
```

Opciones disponibles:
- `-Headless $false` - Muestra la interfaz gráfica durante las pruebas
- `-Browser "firefox"` - Cambia el navegador (opciones: "chromium", "firefox", "webkit")
- `-GenerateReport` - Genera reportes HTML detallados
- `-SkipSetup` - Omite verificaciones de entorno e inicio de emuladores

### 2. Prueba de navegación de barra lateral

```powershell
.\tools\test-sidebar.ps1
```

Verifica que la barra lateral funcione correctamente, incluyendo navegación y comportamiento responsive.

### 3. Prueba de exportación de KPI

```powershell
.\tools\test-kpi-export.ps1
```

Verifica la funcionalidad de exportación CSV desde el panel de KPI.

### 4. Prueba de exportación de historial

```powershell
.\tools\test-history-export.ps1
```

Verifica la exportación CSV de datos históricos con diferentes filtros.

Opciones adicionales:
- `-WithFilters` - Ejecuta pruebas adicionales con diferentes combinaciones de filtros

## Verificación del Entorno

Para verificar que el entorno está correctamente configurado para desarrollo y pruebas:

```powershell
.\tools\preflight.ps1
```

o usando la versión JavaScript:

```
.\tools\preflight.bat
```

Opciones para preflight:
- `-WithE2E` / `--with-e2e` - Incluye ejecución de pruebas E2E
- `-NoEmulators` / `--no-emulators` - Omite iniciar emuladores de Firebase

## Consejos para Solucionar Problemas

1. **Error "Execution Policy"**: Si PowerShell muestra un error sobre política de ejecución, ejecuta:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   ```

2. **Problemas con Playwright**:
   - Reinstala Playwright: `npx playwright install --with-deps`
   - Limpia la caché del navegador: `npx playwright clear-browser-cache`

3. **Errores de acceso a Firebase**:
   - Verifica que los emuladores estén en ejecución: `npx firebase emulators:start`
   - Comprueba la configuración en `.env.local`

4. **Fallo en pruebas**:
   - Ejecuta con interfaz gráfica para ver visualmente el problema: `-Headless $false`
   - Genera reportes para análisis detallado: `-GenerateReport`
   - Revisa los reportes HTML: `npx playwright show-report playwright-report-*`

## Notas Importantes

- Los scripts asumen que se ejecutan desde la raíz del proyecto
- Las pruebas usan credenciales de prueba predeterminadas (`admin@pergamino.test/test1234`)
- Para cambiar las credenciales, configura las variables de entorno `TEST_USER_EMAIL` y `TEST_USER_PASSWORD`