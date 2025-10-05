# Pruebas E2E para Pergamino Admin Web

Este documento describe cómo ejecutar y mantener las pruebas end-to-end (E2E) para el panel de administración web de Pergamino.

## Requisitos previos

- Node.js 16 o superior
- npm 7 o superior
- Playwright instalado (`npm install -g @playwright/test`)

## Configuración

1. Asegúrate de tener el archivo `.env.test` configurado con las credenciales de prueba.
2. Instala las dependencias si aún no lo has hecho:

```bash
cd apps/admin-web
npm install
```

3. Instala los navegadores de Playwright si es necesario:

```bash
npx playwright install
```

## Ejecutar las pruebas E2E

Para ejecutar todas las pruebas E2E:

```bash
npm run test:e2e
```

Para ejecutar las pruebas con interfaz visual:

```bash
npm run test:e2e:ui
```

Para depurar las pruebas:

```bash
npm run test:e2e:debug
```

Para ver el informe de las pruebas después de ejecutarlas:

```bash
npm run test:e2e:report
```

## Estructura de las pruebas

Las pruebas E2E se encuentran en el directorio `apps/admin-web/e2e/` y están organizadas por funcionalidad:

- `kpi-export.spec.js`: Prueba las funcionalidades de KPIs y exportación de datos
- Otros archivos de prueba...

## Elementos testeados

Las pruebas E2E verifican los siguientes elementos críticos:

1. **Sidebar**: Se comprueba que el sidebar esté presente y funcional, permitiendo la navegación entre las diferentes secciones de la aplicación.

2. **KPIs visibles**: Se verifica que todos los KPIs importantes estén visibles en el dashboard y muestren datos reales.

3. **Botón de exportación**: Se comprueba que el botón de exportación esté presente, habilitado y que al hacer clic en él se descargue correctamente un archivo CSV.

## Resultados de las pruebas

Los resultados de las pruebas se guardan en el directorio `test-results/` y se pueden visualizar con el comando `npm run test:e2e:report`.

## Solución de problemas comunes

- **Error de conexión a la base de datos**: Asegúrate de que las credenciales de Firebase en `.env.test` sean correctas.
- **Error de autenticación**: Verifica que los usuarios de prueba existan y tengan los permisos correctos.
- **Error en la descarga de archivos**: Comprueba que la ruta de descarga en las pruebas sea accesible.