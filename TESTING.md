# Guía de Testing para Pergamino App

## Configuración del entorno de pruebas

### Instalación de dependencias

Para instalar todas las dependencias necesarias para ejecutar los tests:

**Windows (PowerShell):**
```powershell
.\install-test-deps.ps1
```

**Unix/macOS (Bash):**
```bash
chmod +x ./install-test-deps.sh
./install-test-deps.sh
```

### Variables de entorno para pruebas

Crea un archivo `.env.test` en la raíz del proyecto con las siguientes variables:

```
TEST_ADMIN_EMAIL=tu_email_de_prueba@ejemplo.com
TEST_ADMIN_PASSWORD=tu_contraseña_de_prueba
TEST_BASE_URL=http://localhost:3000
```

## Ejecución de pruebas

### Pruebas E2E para Panel de Administración Web

Estas pruebas utilizan Playwright para automatizar la interacción con el panel de administración.

```bash
# Ejecutar todas las pruebas E2E
npm run test:e2e

# Ejecutar pruebas E2E con interfaz gráfica
npm run test:e2e:ui

# Ejecutar pruebas E2E en modo debug
npm run test:e2e:debug

# Ver informe de resultados
npm run test:e2e:report

# Ejecutar solo pruebas de smoke
npm run test:smoke
```

### Pruebas de la Aplicación Móvil

Para las pruebas de la aplicación móvil se utiliza Maestro. Necesitarás instalarlo siguiendo las instrucciones en [maestro.mobile.dev](https://maestro.mobile.dev/).

```bash
# Instalar Maestro (macOS/Linux)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Ejecutar pruebas de smoke para la aplicación móvil
maestro test tests/mobile/app-smoke-test.yaml
```

## Estructura de las pruebas

```
tests/
├── e2e/                   # Pruebas E2E para el panel web
│   ├── admin-panel.spec.ts   # Pruebas básicas del panel admin
│   ├── analytics.spec.ts     # Pruebas de la página de Analytics
│   ├── alerts.spec.ts        # Pruebas de la página de Alertas
│   ├── maintenance-mode.spec.ts # Pruebas del modo mantenimiento
│   └── helpers/              # Utilidades para pruebas
│       └── auth.ts           # Helper para autenticación
└── mobile/                # Pruebas para la app móvil
    └── app-smoke-test.yaml   # Prueba básica de funcionalidad
```

## Guía para crear nuevas pruebas

### Pruebas E2E para Web

1. Crea un nuevo archivo en `tests/e2e/` con el nombre de la funcionalidad.
2. Importa los helpers necesarios:
   ```typescript
   import { test, expect } from '../helpers/auth';
   ```
3. Agrupa pruebas relacionadas usando `test.describe()`.
4. Usa `authenticatedPage` si necesitas estar logueado.
5. Ejecuta las pruebas con `npm run test:e2e`.

### Pruebas para App Móvil

1. Crea un nuevo archivo YAML en `tests/mobile/`.
2. Define el flujo de prueba usando la sintaxis de Maestro.
3. Ejecuta las pruebas con Maestro CLI.

## Integración con CI/CD

Las pruebas E2E se ejecutan automáticamente en GitHub Actions:
- En cada push a la rama `main`
- En cada Pull Request hacia `main`
- Manualmente desde la interfaz de GitHub

Para configurar variables secretas para CI/CD, agrega los siguientes secretos en la configuración de GitHub:
- `TEST_ADMIN_EMAIL`
- `TEST_ADMIN_PASSWORD`
- `TEST_BASE_URL` (opcional, si quieres apuntar a un entorno específico)
