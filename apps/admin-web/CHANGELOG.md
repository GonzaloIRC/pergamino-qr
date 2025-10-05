# Changelog

## [1.5.0] - 2025-10-03

### Added - KPI Export Feature (feat/admin-web-kpis-export)

#### Data Layer
- Agregado `kpiClient.js` para consulta de métricas desde Firestore
- Mejorado `historyClient.js` con soporte para filtrado avanzado
- Implementado `exportClient.js` para manejo de exportaciones y permisos

#### UI Dashboard
- Mejorado panel de KPIs con indicadores visuales de tendencias
- Agregado selector de rango de fechas para filtrado de métricas
- Implementados componentes reutilizables para visualización de métricas

#### History Module 
- Implementada página de historial con filtros avanzados
- Agregada función de exportación a CSV con formato estandarizado
- Desarrollada UI para visualización tabular de transacciones históricas
- Implementado sistema de paginación para grandes volúmenes de datos

#### Tests & Documentation
- Agregados tests unitarios para componentes del dashboard
- Agregados tests para funcionalidad de exportación
- Documentada la nueva funcionalidad en README-KPI-EXPORT.md
- Actualizado CHANGELOG con los cambios de esta versión

### Fixed
- Corregido error en la visualización de fechas en formato internacional
- Mejorado rendimiento en la carga de datos históricos grandes
- Corregidos problemas de permisos en exportación de datos

## [1.4.0] - 2025-09-15

### Added
- Funcionalidad de tracking de mesas en tiempo real
- Panel administrativo para gestión de mesas
- Sistema de notificaciones para estados críticos

### Fixed
- Problemas de conexión en entorno de producción
- Errores de renderizado en dispositivos iOS