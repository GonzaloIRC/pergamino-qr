# Pruebas E2E para Pergamino App

Este documento explica cómo ejecutar las pruebas end-to-end (E2E) que verifican las funcionalidades clave de la aplicación: sidebar, KPIs y exportación.

## Requisitos previos

- Node.js v20.x o superior
- npm o yarn
- PowerShell 5.1 o superior

## Configuración

1. Asegúrese de tener instalado Playwright:
   ```
   npm install -D @playwright/test
   npx playwright install --with-deps
   ```

2. Configure el archivo de variables de entorno:
   - Copie `.env.test.example` a `.env.test`
   - Modifique las credenciales según sea necesario

## Pruebas disponibles

Las pruebas verifican las siguientes funcionalidades clave:

### 1. Sidebar
- Verifica que el sidebar está visible
- Comprueba que los enlaces de navegación funcionan correctamente
- Valida la navegación entre diferentes secciones

### 2. KPIs en Dashboard
- Verifica que todos los KPIs importantes se muestran correctamente
- Comprueba que los KPIs muestran datos numéricos reales
- Valida el funcionamiento del selector de fechas
- Verifica la actualización de los datos

### 3. Exportación de datos
- Verifica que el botón de exportación está visible y habilitado
- Prueba la exportación a CSV
- Valida el archivo generado
- Comprueba los permisos necesarios para la funcionalidad de exportación

## Ejecutar las pruebas

### Usando el script completo

```powershell
.\run-e2e-tests.ps1
```

Este script proporciona información detallada durante la ejecución, verifica dependencias y muestra mensajes formatados.

### Usando el script simplificado

```powershell
.\ejecutar-tests-e2e-simple.ps1
```

Este comando ejecuta directamente las pruebas con un navegador visible.

### Ejecutando pruebas específicas

Si desea ejecutar solo una prueba específica, puede utilizar:

```powershell
npx playwright test apps/admin-web/e2e/kpi-export.spec.js --grep "should display dashboard with KPI metrics"
```

## Ver informes de pruebas

Después de ejecutar las pruebas, puede ver un informe detallado:

```powershell
npx playwright show-report
```

Los informes incluyen capturas de pantalla, trazas y registros que pueden ayudar a diagnosticar fallos.

## Problemas comunes

1. **Error de autenticación**: Verifique que las credenciales en `.env.test` son correctas.

2. **Elementos no encontrados**: La estructura de la página puede haber cambiado. Actualice los selectores en las pruebas.

3. **Tiempo de espera excedido**: La aplicación puede estar cargando lentamente. Aumente los tiempos de espera en `playwright.config.ts`.