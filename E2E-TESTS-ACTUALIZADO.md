# Pruebas E2E para Pergamino App

## Introducción

Este documento describe cómo ejecutar pruebas end-to-end (E2E) que verifican las funcionalidades clave de Pergamino App:
- Sidebar (navegación lateral)
- KPIs en el dashboard 
- Exportación de datos

## Requisitos previos

- Node.js versión 20.x o superior
- NPM o Yarn
- PowerShell (versión 5.1 o superior)
- Playwright instalado (`npm install -D @playwright/test`)

## Ejecutar pruebas E2E

### Opción 1: Modo simulación (recomendado para verificación rápida)

Este método ejecuta las pruebas en modo simulado sin necesidad de tener un servidor en funcionamiento:

```powershell
.\ejecutar-simulacion-e2e.ps1
```

### Opción 2: Modo completo (requiere servidor en funcionamiento)

Si tienes un servidor de desarrollo funcionando en http://localhost:3000, puedes ejecutar las pruebas completas:

```powershell
.\kpi-export-test.ps1
```

Este script:
1. Configura el entorno para las pruebas
2. Ejecuta las pruebas en Chrome
3. Muestra los resultados en la consola

## Casos de prueba

Las pruebas verifican las siguientes funcionalidades:

### 1. Sidebar
- Verifican que el sidebar está visible
- Comprueban que contiene los enlaces de navegación principales
- Validan que la navegación entre secciones funciona correctamente

### 2. KPIs en Dashboard
- Verifican que todos los KPIs importantes se muestran correctamente
- Comprueban que los KPIs contienen datos numéricos reales
- Validan que el selector de fechas funciona correctamente
- Verifican la actualización de datos

### 3. Exportación de datos
- Verifican que el botón de exportación está visible y habilitado
- Prueban la funcionalidad de exportación a CSV
- Comprueban los permisos necesarios para esta funcionalidad

## Ver reportes detallados

Después de ejecutar las pruebas, puedes ver un reporte HTML detallado con:

```powershell
npx playwright show-report
```

Este reporte incluye:
- Resultados de todas las pruebas
- Capturas de pantalla de los fallos
- Trazas de ejecución para depuración

## Solución de problemas

### Error de conexión al servidor
Las pruebas asumen que la aplicación está corriendo en http://localhost:3000. Si estás usando un puerto o URL diferente, deberás actualizar la variable de entorno `E2E_BASE_URL`.

### Errores de autenticación
Las pruebas usan credenciales por defecto. Si necesitas personalizar las credenciales, crea un archivo `.env.test` con:

```
TEST_USER_EMAIL=tu_email@ejemplo.com
TEST_USER_PASSWORD=tu_contraseña
```

### Problemas con selectores
Si la interfaz ha cambiado, es posible que los selectores en las pruebas necesiten ser actualizados. Revisa `kpi-export.spec.js` y actualiza los selectores según sea necesario.

### Error "Missing script: start:test"
Si encuentras este error, significa que Playwright está intentando iniciar el servidor web automáticamente pero no encuentra el script correspondiente. Para solucionar esto:

1. Usa el modo de simulación con `.\ejecutar-simulacion-e2e.ps1` que no requiere un servidor.
2. O inicia manualmente tu servidor de desarrollo y luego ejecuta las pruebas con `.\kpi-export-test.ps1`.

### Error "Requiring @playwright/test second time"
Este error ocurre cuando hay conflictos entre múltiples instalaciones de Playwright. La solución es usar nuestros scripts simplificados que evitan estos conflictos.