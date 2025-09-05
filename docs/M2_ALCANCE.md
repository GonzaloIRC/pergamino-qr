# Alcance de M2 (Phase2-Core)

Este documento define el alcance para la fase 2 del proyecto Pergamino, enfocado en expandir las funcionalidades básicas establecidas en M1 y preparar el terreno para las capacidades avanzadas de M3.

## Objetivos Principales

1. **Sistema de Beneficios Avanzado**
   - Categorización de beneficios por tipo y valor
   - Reglas de acumulación configurables
   - Histórico completo con filtros avanzados
   - Expiración programada de beneficios

2. **Gestión de Usuarios Multi-Rol**
   - Perfiles detallados para administradores
   - Perfiles para personal (baristas, meseros)
   - Perfiles para clientes con preferencias
   - Asignación y gestión de permisos por rol

3. **Notificaciones Básicas**
   - Alertas in-app para eventos importantes
   - Notificaciones push básicas
   - Centro de notificaciones con historial
   - Preferencias de notificación configurables

4. **Funcionalidades Offline**
   - Sincronización de datos cuando no hay conexión
   - Cola de transacciones pendientes
   - Resolución de conflictos en sincronización
   - Indicadores de estado de conexión

5. **Mejoras de Experiencia de Usuario**
   - Temas oscuro/claro con preferencias guardadas
   - Animaciones y transiciones mejoradas
   - Accesibilidad básica implementada
   - Rendimiento optimizado en dispositivos de gama baja

6. **Seguridad Intermedia**
   - Reglas de Firestore optimizadas
   - Validaciones en cliente y servidor
   - Prevención de ataques comunes
   - Gestión segura de sesiones prolongadas

## Infraestructura y Técnicas

1. **Optimización de Base de Datos**
   - Índices compuestos para consultas frecuentes
   - Estructura de colecciones revisada para escalabilidad
   - Implementación de caching estratégico
   - Paginación para conjuntos grandes de datos

2. **CI/CD Básico**
   - Pipeline básico de integración continua
   - Tests automatizados para componentes críticos
   - Despliegue automatizado a entorno de pruebas
   - Verificaciones de calidad de código

## Criterios de Éxito

- Sistema de beneficios funcionando con todas sus características
- Gestión de usuarios multi-rol implementada y probada
- Sistema de notificaciones básico funcionando
- Aplicación usable en modo offline para operaciones críticas
- Mejoras de UX implementadas con feedback positivo
- Infraestructura preparada para las características avanzadas de M3

## Notas

Esta fase construye sobre la base establecida en M1 y prepara la infraestructura necesaria para las características avanzadas de M3. Es crucial completar adecuadamente esta fase antes de proceder con las funcionalidades más complejas de analíticas y campañas.

> Nota: Las funcionalidades relacionadas con TrackingTable siguen siendo solo de referencia documental y no forman parte del alcance de implementación de M2.
