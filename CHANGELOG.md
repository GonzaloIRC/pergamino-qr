# Changelog

Todas las modificaciones notables al proyecto serán documentadas en este archivo.

## [1.1.0] - M1 - En desarrollo

### Nuevas Características
- Sistema de escáner QR mejorado para clientes
- Sistema de autenticación con roles completo
- Panel de administración para gestión de clientes
- Sistema de puntos para fidelización
- Registro y validación de clientes

### Mejoras Técnicas
- Implementación de pruebas unitarias
- Optimización del rendimiento de la aplicación
- Mejora en la gestión de estados con Context API
- Componentes reutilizables para formularios

## [1.0.1] - M0 - Completado

### Seguridad
- Implementación de reglas de seguridad en Firestore basadas en roles
- Funciones isAdmin(), isMesero(), isCliente() para validación de acceso
- Configuración de reglas específicas por colección

### Correcciones
- Estandarización de importaciones Firebase usando '../services/firebaseClient'
- Corrección de rutas de importación en múltiples componentes
- Optimización de configuración de Babel
- Mantenimiento del orden correcto de plugins (reanimated/plugin como último)

### Estructura
- Reorganización de archivos en estructura más ordenada
- Separación de servicios en carpeta services/
- Documentación técnica en carpeta docs/

## [1.0.0] - Versión Base

### Características Base
- Estructura inicial de la aplicación
- Configuración básica de Firebase
- Navegación básica entre pantallas
- Implementación inicial de roles
