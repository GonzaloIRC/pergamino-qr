# Alcance de M1 (Phase1-Base)

Este documento define el alcance mínimo para la fase 1 del proyecto Pergamino, enfocado en retomar la funcionalidad básica con seguridad mejorada.

## Objetivos Principales

1. **Inicialización Modular de Firebase**
   - Estructura en `src/firebase/` 
   - Implementación modular de Firestore y Authentication
   - Configuración correcta para entorno de desarrollo y producción

2. **Autenticación de Desarrollo**
   - Email/Password habilitado en Firebase Console
   - Soporte para autenticación anónima como fallback
   - Manejo de sesiones y tokens

3. **Escáner QR con expo-camera**
   - Implementación de dos formatos de códigos QR:
     - BNF:{serial} → Gestión de beneficios/seriales
     - APP:{dni}:{nonce} → Registro de acumulación
   - Funcionalidades avanzadas:
     - Debounce de ~1500ms para evitar múltiples escaneos
     - Control de linterna (torch)
     - Ajuste de foco
     - Entrada manual de seriales para casos de fallo de lectura
   - Procesamiento de transacciones:
     - Para BNF: Actualización de `BeneficioSeriales/{serial}` a estado="usado"
     - Para APP: Creación de registro en colección `Historial` tipo="acumulacion"
     - Bloqueo de re-escaneo para prevenir uso duplicado

4. **Gestión de Clientes**
   - Alta por DNI (con validación de unicidad)
   - Búsqueda en tiempo real
   - Lista actualizada en vivo mediante `onSnapshot`
   - Detalles de cliente con historial de transacciones

5. **Inicialización de Datos**
   - Uso de `SCRIPTS/seedBeneficioDemo.js` para datos iniciales
   - Generación de beneficios y seriales de demostración

6. **Interfaz de Usuario**
   - Pantalla de bienvenida mejorada
   - Tema personalizado Pergamino
   - Navegación fluida entre componentes

7. **Documentación**
   - README actualizado con instrucciones de configuración
   - CHANGELOG con los cambios importantes de esta fase

## Criterios de Éxito

- Flujo end-to-end funcionando correctamente:
  1. Autenticación de usuario
  2. Escaneo de QR (ambos formatos)
  3. Procesamiento de transacciones
  4. Gestión de clientes
  
- Validaciones y manejo de errores implementados
- Pruebas manuales exitosas en dispositivo físico
- Documentación actualizada y completa

## Notas

Este alcance representa lo mínimo necesario para volver a encaminar el proyecto. Cualquier funcionalidad adicional ya implementada debe verificarse y asegurarse de que funciona correctamente con las mejoras de seguridad incorporadas en M0.
