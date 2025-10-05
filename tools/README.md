# Herramientas de Desarrollo

Esta carpeta contiene scripts y herramientas útiles para el desarrollo del proyecto Pergamino.

## Scripts disponibles

### preflight.js (recomendado)

Script Node.js para realizar verificaciones rápidas del entorno de desarrollo y proyecto. Esta versión es más robusta y compatible con cualquier terminal.

#### Uso básico

```bash
# Verificación básica (Node, Expo, Lint, Typecheck, Build)
node tools/preflight.js

# Incluir pruebas E2E
node tools/preflight.js --with-e2e

# Sin iniciar emuladores de Firebase
node tools/preflight.js --no-emulators

# Verificación completa con E2E pero sin emuladores
node tools/preflight.js --with-e2e --no-emulators
```

### preflight.ps1 (PowerShell)

Versión PowerShell del script de verificación. Requiere PowerShell y la configuración adecuada del entorno.

#### Requisitos para usar correctamente preflight.ps1
- Visual Studio Code con la extensión PowerShell (ms-vscode.powershell)
- Configuración adecuada de encoding (UTF-8)
- Formateo correcto del script

#### Uso básico

```powershell
# Verificación básica (Node, Expo, Lint, Typecheck, Build)
.\preflight.ps1

# Incluir pruebas E2E
.\preflight.ps1 -WithE2E

# Sin iniciar emuladores de Firebase
.\preflight.ps1 -NoEmulators

# Verificación completa con E2E pero sin emuladores
.\preflight.ps1 -WithE2E -NoEmulators

# Ver ayuda completa del script
Get-Help .\preflight.ps1 -Full
```

#### ¿Qué verifica?

1. **Entorno básico**: Node.js y npm
2. **Configuración de Expo**: Usando `expo doctor`
3. **Calidad de código**: Lint y verificación de tipos
4. **Compilación**: Build de admin-web
5. **Emuladores** (opcional): Inicia emuladores de Firebase
6. **Pruebas E2E** (opcional): Ejecuta pruebas end-to-end con Playwright

#### Comportamiento y salidas

- El script detiene la ejecución ante el primer error encontrado
- Muestra mensajes claros de éxito/error en cada etapa
- Proporciona un resumen final con el estado de cada componente
- Usa colores para facilitar la lectura de los resultados

#### Requerimientos

- Node.js y npm
- Expo CLI (`npm install -g expo-cli`)
- Firebase CLI (`npm install -g firebase-tools`)
- Playwright (`npx playwright install --with-deps`)

## Añadir nuevas herramientas

Si creas nuevos scripts o herramientas, por favor:

1. Documéntalos en este README
2. Incluye comentarios en el código que expliquen su funcionamiento
3. Si es posible, añade ejemplos de uso
