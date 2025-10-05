# Testing

Este directorio contiene todas las pruebas automatizadas para la aplicación Pergamino.

## Estructura de pruebas

- `e2e-web/`: Pruebas end-to-end para la aplicación web
- `helpers/`: Funciones auxiliares para pruebas
- `integration/`: Pruebas de integración
- `rules/`: Pruebas para reglas de seguridad de Firestore
- `smoke/`: Pruebas de humo básicas
- `unit/`: Pruebas unitarias
- `utils/`: Utilidades compartidas para testing
- `__mocks__/`: Mocks para pruebas

## E2E

- Ejecuta: `npm run e2e` (usa --workers=1).
- Requiere variables `E2E_EMAIL` y `E2E_PASSWORD`.
- Testea login, sidebar, KPIs y export CSV del módulo History.

### Configuración para pruebas E2E

Para ejecutar las pruebas E2E correctamente, asegúrate de:

1. Tener las variables de entorno configuradas:
   ```
   E2E_EMAIL=usuario_prueba@example.com
   E2E_PASSWORD=contraseña_segura
   ```

2. La cuenta de prueba debe tener permisos adecuados para acceder a:
   - Dashboard de KPIs
   - Módulo de historial
   - Funcionalidad de exportación

### Scripts disponibles

- `npm run e2e`: Ejecuta todas las pruebas E2E
- `npm run e2e:specific`: Ejecuta un test específico (requiere parámetro)

### PowerShell scripts

Para usuarios de Windows, hay scripts PowerShell disponibles:

- `.\kpi-export-test.ps1`: Ejecuta pruebas específicas de exportación de KPIs
- `.\history-export-test.ps1`: Ejecuta pruebas específicas de exportación de historial
- `.\ejecutar-simulacion-e2e.ps1`: Simulación completa de pruebas E2E

## Buenas prácticas

- Usa `data-testid` en componentes clave para facilitar selección en pruebas
- Mantén pruebas independientes entre sí
- Evita dependencias externas en pruebas unitarias
- Documenta patrones complejos de testing