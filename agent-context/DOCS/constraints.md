# Restricciones del Proyecto

Este documento detalla las restricciones técnicas y de negocio que deben considerarse durante el desarrollo y mantenimiento del proyecto Pergamino-app.

## Restricciones Técnicas

### 1. Entorno de Ejecución

- **Node.js**: Versión 20.x LTS
- **React Native**: Limitado a las APIs compatibles con Expo SDK 53
- **Plataformas**: iOS 15+, Android 9+

### 2. Rendimiento

- **Tiempo de Inicio**: La aplicación debe iniciar en menos de 3 segundos en dispositivos de gama media
- **Tamaño**: El APK/IPA no debe exceder 50MB
- **Memoria**: Consumo máximo de 200MB RAM en operación normal

### 3. Conectividad

- **Offline First**: La aplicación debe funcionar con capacidades básicas sin conexión
- **Sincronización**: Debe sincronizarse automáticamente al recuperar conexión
- **Latencia**: Tolerancia a conexiones de hasta 500ms de latencia

## Restricciones de Negocio

### 1. Seguridad

- **Datos Sensibles**: No almacenar información sensible localmente sin encriptación
- **Autenticación**: Implementar timeout de sesión después de 30 minutos de inactividad
- **Validación**: Toda entrada de usuario debe ser validada tanto en cliente como en servidor

### 2. Cumplimiento Legal

- **GDPR/LGPD**: Implementar mecanismos para exportación y eliminación de datos de usuario
- **Términos de Servicio**: Requerir aceptación explícita de términos en registro
- **Cookies/Tracking**: Informar y obtener consentimiento para cualquier seguimiento

### 3. Experiencia de Usuario

- **Accesibilidad**: Cumplir con WCAG 2.1 nivel AA
- **Internacionalización**: Soporte para español como mínimo, estructura para añadir otros idiomas
- **Modos**: Soporte para modo oscuro y modo de ahorro de batería

## Limitaciones de Integración

### 1. Firebase/Firestore

- **Cuotas**: Limitar operaciones de lectura/escritura para mantenerse en plan gratuito/básico
- **Indices**: Crear índices compuestos solo para consultas críticas
- **Transacciones**: Mantener transacciones limitadas a 500 operaciones por lote

### 2. Expo

- **APIs Nativas**: Limitarse a las APIs disponibles en Expo SDK o mediante config plugins
- **Actualizaciones**: Soportar OTA updates para correcciones menores
- **EAS**: Configurar builds para optimizar tiempos de CI/CD
