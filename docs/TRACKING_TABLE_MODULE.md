# Módulo de Tablas de Seguimiento para Pergamino App

Este módulo permite crear y gestionar tablas de seguimiento personalizables para diferentes propósitos dentro de la aplicación Pergamino.

## Características

- **Tablas personalizables**: Crea tablas con columnas de diferentes tipos (texto, número, fecha, booleano, etc.).
- **Escáner QR integrado**: Captura datos mediante código QR y asígnalos a registros.
- **Exportación a CSV**: Exporta los datos de las tablas en formato CSV para análisis externo.
- **Filtrado y búsqueda**: Filtra y busca registros para encontrar información rápidamente.
- **Persistencia en Firestore**: Todos los datos se almacenan en Firebase Firestore para acceso desde cualquier dispositivo.

## Estructura del Módulo

### Componentes

- `TrackingTable`: Componente principal para mostrar los datos en formato tabla con funcionalidades de filtrado, ordenación y exportación.
- `TrackingForm`: Formulario dinámico para agregar nuevos registros a una tabla.

### Pantallas

- `TrackingDashboard`: Muestra un resumen de las tablas disponibles y permite acceder a ellas.
- `TrackingTableSetup`: Permite crear y configurar nuevas tablas de seguimiento.

### Servicios

- `trackingTableService.js`: Contiene las funciones para interactuar con Firestore y gestionar los datos de las tablas.

## Configuración de Firebase

El módulo utiliza Firestore para almacenar:

1. **Configuraciones de tablas**: Colección `trackingTables` con documentos que definen la estructura de cada tabla.
2. **Datos de las tablas**: Colecciones con formato `tracking_[ID_TABLA]` para almacenar los registros.

## Uso Básico

### 1. Crear una Nueva Tabla

1. Navega a la pantalla de `TrackingTableSetup`.
2. Define un nombre para la tabla.
3. Agrega las columnas necesarias, especificando nombre y tipo de dato.
4. Guarda la configuración.

### 2. Agregar Registros

1. Desde `TrackingDashboard`, selecciona la tabla deseada.
2. Pulsa el botón "+" para agregar un nuevo registro.
3. Completa el formulario y guarda.

### 3. Escanear QR para Datos

1. Usa la funcionalidad de escaneo desde la pantalla principal.
2. Escanea un código QR.
3. Selecciona la tabla donde deseas guardar el registro.
4. Completa los datos adicionales si es necesario.

### 4. Exportar Datos

1. Desde la vista de tabla, pulsa el botón "Exportar".
2. Se generará un archivo CSV que podrás compartir o guardar.

## Datos de Prueba

Para crear datos de prueba y probar la funcionalidad:

1. Ejecuta el script `init-tracking-data.js`:

```bash
npx babel-node init-tracking-data.js
```

Este script creará:
- Una tabla de inventario
- Una tabla de registro de visitas
- Algunos registros de ejemplo en ambas tablas

## Extensión

El sistema es fácilmente extensible para añadir:
- Nuevos tipos de columna
- Permisos por usuario o rol
- Notificaciones basadas en reglas
- Vistas personalizadas por tabla

## Dependencias

- Firebase Firestore
- React Native Paper
- Expo Camera (para escaneo QR)
- Expo File System y Sharing (para exportación)

## Notas Importantes

- Asegúrate de que la configuración de Firebase esté correctamente inicializada antes de usar este módulo.
- Para entornos de desarrollo, considera habilitar la persistencia offline de Firestore.
- Los campos de sistema (fecha de creación, última actualización, etc.) se agregan automáticamente.