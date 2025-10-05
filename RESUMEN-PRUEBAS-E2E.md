# Ejecución de Pruebas E2E para Pergamino App

He configurado un sistema para ejecutar pruebas end-to-end que verifican las funcionalidades clave:

## Funcionalidades probadas

1. **Sidebar**
   - Verificación de visibilidad y navegación
   - Comprobación de enlaces funcionales

2. **KPIs en Dashboard**
   - Verificación de que todos los KPIs importantes son visibles
   - Comprobación de que muestran datos numéricos reales
   - Validación del selector de fechas

3. **Exportación de datos**
   - Verificación del botón de exportación
   - Prueba de la funcionalidad de exportar a CSV
   - Verificación de permisos

## Archivos creados/modificados

- `E2E-TESTS.md` - Documentación detallada sobre cómo ejecutar las pruebas
- `ejecutar-tests-e2e-simple-sinservidor.ps1` - Script PowerShell simplificado para ejecutar pruebas
- `playwright.config.simple.ts` - Configuración simplificada de Playwright

## Cómo ejecutar las pruebas

Para ejecutar las pruebas, simplemente use el siguiente comando en PowerShell:

```powershell
.\ejecutar-tests-e2e-simple-sinservidor.ps1
```

Este script ejecutará las pruebas con un navegador visible para que pueda ver el proceso de verificación.

## Visualización de resultados

Después de ejecutar las pruebas, puede ver un informe detallado con:

```powershell
npx playwright show-report
```

El informe incluirá capturas de pantalla, registros y detalles de cualquier error encontrado.

## Notas importantes

- Las pruebas utilizan los archivos existentes en `apps/admin-web/e2e/kpi-export.spec.js`
- Se requiere una configuración adecuada en `.env.test` para las credenciales
- El archivo `.env.test.example` puede copiarse a `.env.test` como punto de partida