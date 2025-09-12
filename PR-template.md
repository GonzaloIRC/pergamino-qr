# M3: Implementación de Sistema de Referidos y Antifraude

Este PR implementa las funcionalidades restantes para el milestone M3, específicamente el sistema de referidos para clientes y el sistema de detección y prevención de fraudes que no fueron cubiertos por el script de automatización.

## Componentes implementados

### 1. Sistema de Referidos
- `src/services/referrals.js`: Servicio para generar y gestionar códigos de referido
- `src/screens/ReferralsScreen.js`: Pantalla para visualizar y compartir códigos de referido
- Integración en CustomerDashboard para acceso directo a la funcionalidad

### 2. Sistema Antifraude
- `src/services/antiFraud.js`: Servicio con algoritmos de detección de actividad sospechosa
- `src/screens/admin/FraudAlertsScreen.js`: Pantalla para administradores para monitorear alertas
- Integración en AdminDashboard para supervisión de actividades fraudulentas

### 3. Actualizaciones de Navegación
- `src/navigation/RoleBasedNavigator.js`: Actualización para incluir las nuevas pantallas
- Nuevos botones en los dashboards para acceder a las funcionalidades

## Características implementadas
- **Sistema de referidos**: 
  - Generación automática de códigos únicos para cada usuario
  - Seguimiento de referidos completados
  - Recompensas automáticas basadas en la configuración
  - Interfaz para compartir códigos en redes sociales
  
- **Sistema antifraude**:
  - Detección de anomalías en patrones de escaneo
  - Prevención de reutilización de dispositivos para acumular puntos
  - Sistema de alertas para revisión por parte de administradores
  - Interfaz para gestionar casos sospechosos

## Integración con sistemas existentes
- Integración con el sistema de puntos para recompensas por referidos
- Integración con el flujo de escaneo para detección de actividad sospechosa
- Actualización de dashboards para incluir las nuevas funcionalidades

## Instrucciones de prueba
1. Instalar dependencias: `npm ci`
2. Iniciar la aplicación: `npx expo start -c`
3. Para probar el sistema de referidos:
   - Acceder como usuario cliente
   - Navegar a "Mis Referidos" desde el dashboard
   - Generar y compartir un código
4. Para probar el sistema antifraude:
   - Acceder como administrador
   - Navegar a "Alertas de Fraude" desde el dashboard
   - Revisar las alertas generadas automáticamente

## Screenshots
*[Se añadirán capturas de pantalla de las nuevas funcionalidades]*

## Checklist
- [x] Sistema de referidos completamente implementado
  - [x] Generación de códigos únicos
  - [x] Seguimiento de referidos
  - [x] Interfaz para usuarios
  - [x] Sistema de recompensas
- [x] Sistema antifraude implementado
  - [x] Detección de anomalías
  - [x] Prevención de abuso de dispositivos
  - [x] Panel de alertas para administradores
  - [x] Mecanismos de resolución
- [x] Navegación actualizada para las nuevas pantallas
- [x] Integración con dashboards existentes
- [x] Scripts de utilidad para desarrollo
- [x] Pruebas unitarias básicas
