# Exportación de KPIs en Pergamino Admin Web

Este proyecto implementa la funcionalidad para visualizar y exportar KPIs (Key Performance Indicators) desde el panel de administración web de Pergamino.

## Características principales

### 1. Panel de KPIs
- Visualización de métricas clave del negocio
- Filtrado por rangos de fechas
- Indicadores visuales de tendencias
- Actualización en tiempo real de datos

### 2. Historial de Transacciones
- Visualización de todas las transacciones realizadas
- Búsqueda y filtrado por múltiples campos:
  - Rango de fechas
  - DNI del cliente
  - Número de mesa
- Paginación para manejo eficiente de grandes volúmenes de datos

### 3. Exportación de datos
- Exportación a CSV de datos históricos
- Control de permisos para acciones de exportación
- Registro de auditoría de exportaciones
- Formato estandarizado para análisis posterior

## Estructura del Código

### Capa de Datos
- `lib/firestore/kpiClient.js`: Cliente para acceder a métricas y KPIs
- `lib/firestore/historyClient.js`: Cliente para acceder al historial de transacciones
- `lib/firestore/exportClient.js`: Cliente para manejo de exportaciones y permisos

### Interfaz de Usuario
- `app/(protected)/dashboard/`: Componentes del panel principal de KPIs
- `app/(protected)/history/`: Componentes del historial y exportación

### Pruebas
- `__tests__/kpi-dashboard.test.js`: Pruebas para la funcionalidad del dashboard
- `__tests__/history-page.test.js`: Pruebas para la funcionalidad del historial

## Uso

### Dashboard
1. Navega a la sección "Dashboard" desde el menú principal
2. Usa el selector de fechas para filtrar los datos por período
3. Visualiza las métricas y tendencias

### Historial y Exportación
1. Navega a la sección "Historial" desde el menú principal
2. Aplica los filtros deseados (fecha, DNI, mesa)
3. Para exportar a CSV, haz clic en el botón "Exportar CSV"
4. El archivo se descargará automáticamente

## Seguridad
- Las exportaciones están restringidas a usuarios con el permiso `canExport`
- Todas las acciones de exportación se registran en la colección de auditoría
- Los datos sensibles están debidamente protegidos

## Desarrollo Futuro
- Implementación de gráficas más detalladas
- Exportación en formatos adicionales (Excel, PDF)
- Panel de análisis avanzado con métricas personalizables
- Alertas y notificaciones basadas en umbrales de métricas