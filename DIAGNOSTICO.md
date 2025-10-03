# Diagnóstico de Problemas de Navegación en Pergamino

## Estructura de la Aplicación

La aplicación tiene una estructura correcta con:

- Rutas protegidas implementadas en el directorio `app/(protected)/`
- Layout protegido con verificación de autenticación en `app/(protected)/layout.tsx`
- Provider de autenticación en `app/providers.tsx`
- Componente Sidebar con enlaces a todas las secciones

## Problemas Identificados

1. **Error de Conexión**: Los errores `net::ERR_ABORTED` indican que el servidor de desarrollo no está en ejecución cuando se ejecutan las pruebas.

2. **Autenticación**: Las pruebas intentan acceder a rutas protegidas sin autenticación, lo que provoca redirecciones o errores.

3. **Inconsistencia en Sistemas de Autenticación**: Hay dos sistemas de autenticación implementados:
   - `lib/auth.tsx` con AuthProvider y withAuth
   - `providers.tsx` con su propio contexto de autenticación

## Soluciones Implementadas

1. **Script de Prueba Mejorado**: `run-full-test.ps1` ahora inicia automáticamente el servidor de desarrollo antes de ejecutar las pruebas.

2. **Manejo de Errores**: Las pruebas ahora manejan errores de conexión y navegación de manera más robusta.

3. **Verificación Estática**: Se creó `check-protected-routes.ps1` para verificar la estructura de directorios sin necesidad de ejecutar el servidor.

## Próximos Pasos Recomendados

1. **Unificar Sistema de Autenticación**: Estandarizar en un solo sistema de autenticación, preferiblemente `providers.tsx`.

2. **Usuario de Prueba**: Crear un usuario de prueba específico para pruebas automatizadas.

3. **Pruebas Robustas**: Actualizar todas las pruebas para manejar correctamente las redirecciones de autenticación.

4. **Emulador**: Asegurarse de que el emulador de Firebase esté en ejecución para las pruebas que requieren autenticación.

## Comandos Útiles

```powershell
# Verificar estructura de rutas protegidas
.\check-protected-routes.ps1

# Ejecutar pruebas con servidor automático
.\run-full-test.ps1

# Ejecutar prueba específica
cd apps/admin-web
npx playwright test tests/e2e/sidebar-structure.spec.ts --project=chromium
```

## Estado Actual

La estructura de la aplicación está correctamente implementada, pero las pruebas fallan por problemas de conexión y autenticación. Con las soluciones implementadas, las pruebas deberían ejecutarse correctamente.