# Pruebas End-to-End - Panel de Administración

## Configuración

Se ha configurado Playwright para ejecutar pruebas automatizadas en el panel de administración web.

### Requisitos

- Node.js v20+
- npm
- Playwright

## Instalación

Para instalar las dependencias necesarias, ejecuta:

```bash
# En Windows (PowerShell)
.\install-web-tests.ps1

# O manualmente
npm install --save-dev @playwright/test --legacy-peer-deps
npx playwright install --with-deps
```

## Ejecución de pruebas

```bash
# Ejecutar todas las pruebas en secuencia (recomendado)
npm run test:e2e  # Usa --workers=1 internamente

# Ejecutar pruebas con UI
npm run test:e2e:ui

# Ejecutar en modo debug
npm run test:e2e:debug

# Ver informe de resultados
npm run test:e2e:report

# Ejecutar solo pruebas de smoke
npm run test:smoke  # También usa --workers=1
```

> **IMPORTANTE**: Las pruebas siempre deben ejecutarse con `--workers=1` para evitar problemas de concurrencia. Los scripts npm ya incluyen esta configuración.

## Variables de entorno

Para ejecutar pruebas contra entornos específicos, configura estas variables:

```
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000  # URL base para las pruebas
TEST_ADMIN_EMAIL=admin@local.test              # Email de administrador para pruebas
TEST_ADMIN_PASSWORD=Admin123!                  # Contraseña para pruebas
TEST_NS=custom-namespace                       # Opcional: Namespace para datos de pruebas
```

## Datos de Prueba

### Namespace para Pruebas

Las pruebas utilizan un namespace único para aislar los datos:
- En CI: `ci-[hash-commit]`
- En local: `ci-[hash-aleatorio]`

Esto permite ejecutar pruebas concurrentes sin interferencia entre ellas.

### Scripts Disponibles

Para generar datos de prueba:

```bash
# Crear usuario admin
node tests/utils/seedAdminUser.real.js

# Crear un cliente
node tests/utils/seedOneClient.real.js

# Generar códigos seriales
node tests/utils/emitSerials.real.js --count=3

# Limpiar datos de prueba
node tests/utils/cleanupTests.real.js
```

## Estructura de las pruebas

Las pruebas se encuentran en la carpeta `tests/e2e/` y siguen esta estructura:

```
tests/e2e/
├── admin-panel.spec.ts    # Pruebas básicas del panel admin
├── navigation.spec.ts     # Pruebas de navegación entre secciones
└── utils/                 # Scripts de utilidad para pruebas
    ├── testNamespace.js         # Gestión de namespaces para aislamiento
    ├── seedAdminUser.real.js    # Creación de usuario admin
    ├── seedOneClient.real.js    # Creación de cliente único
    ├── emitSerials.real.js      # Generación de seriales mínimos
    └── cleanupTests.real.js     # Limpieza post-pruebas
```

## Pruebas implementadas

- **Authentication**: Verificación de login, manejo de errores y autenticación exitosa
- **Navigation**: Navegación entre las diferentes secciones del panel con aserciones robustas
- **KPI Dashboard**: Verificación de carga y visualización de componentes KPI

## CI/CD

Las pruebas E2E se ejecutan automáticamente en el flujo de CI:

1. Para cada PR que apunta a `main`
2. En cada push a `main`
3. Manualmente desde GitHub Actions

### Reportes en CI

Los reportes de las pruebas se suben como artefactos en GitHub Actions y están disponibles para su descarga en cada ejecución.