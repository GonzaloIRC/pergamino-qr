# Decisiones Técnicas del Proyecto

## Estructura y Tecnología Base

- **Framework**: Expo SDK 53.0.22
- **Base**: React Native 0.79.5
- **Almacenamiento de datos**: Firebase/Firestore
- **Entorno**: Node.js v20.x (LTS)
- **Control de versiones**: Git con múltiples ramas de features

## Parámetros del Proyecto

### Decisiones de Arquitectura

1. **Estructura de Módulos**:
   - División por roles de usuario (cliente, mesero, admin)
   - Componentes compartidos en carpeta `components`
   - Servicios reutilizables en `services`
   - Navegación centralizada en `navigation`

2. **Gestión de Estado**:
   - Contextos React para estado global (`AuthContext`, `DataContext`, `ThemeContext`)
   - Reducers para lógica de estado compleja

3. **Conectividad y Persistencia**:
   - Firebase para autenticación y datos
   - Firestore para almacenamiento estructurado
   - Soporte offline con sincronización en reconexión

### Decisiones de Implementación

1. **Autenticación**:
   - Sistema multi-rol (cliente, mesero, admin)
   - Login anónimo para escaneo rápido
   - Login con email/password para roles con privilegios

2. **Escaneo de QR**:
   - Formato de códigos estandarizado: `BNF:SER-XXXX` para beneficios
   - Formato de acumulación: `APP:{dni}:{nonce}` 

3. **Seguridad**:
   - Reglas Firestore por rol
   - Validación de inputs en cliente y servidor
   - Emuladores para pruebas locales

### Estándares de Desarrollo

1. **Testing**:
   - Tests unitarios para utilidades y servicios
   - Tests de integración para flujos críticos
   - E2E con Maestro y Detox

2. **Despliegue**:
   - Canales de Expo para diferentes entornos
   - EAS Build para generación de binarios
   - Configuración por entorno (.env.*) vía app.config.ts
   - CI/CD automatizado para builds y deploys

3. **Documentación**:
   - Docs técnica en archivos MD
   - Comentarios para funciones complejas
   - Auditorías regulares con `expo-doctor`
