# Guía para completar el Panel Admin de Pergamino App

## Resumen de lo ya implementado

El proyecto ya tiene una estructura base sólida con:
- Autenticación Firebase implementada
- Estructura de rutas protegidas
- Layout con sidebar y navegación
- Componentes básicos para cada módulo

## Tareas pendientes por módulo

### 1. Configuración general

- [x] Crear archivos de configuración (.env.local.example)
- [x] Implementar helpers para Firestore
- [x] Implementar helpers para CSV
- [x] Implementar roleGuard para protección por rol admin

### 2. Módulo Clients

- [ ] Corregir colección en Firestore (Clientes)
- [ ] Implementar formulario de alta con DNI único
- [ ] Añadir validación de campo DNI
- [ ] Implementar búsqueda por DNI/nombre
- [ ] Actualizar tabla con paginación

### 3. Módulo Benefits

- [ ] Corregir colección en Firestore (Beneficios)
- [ ] Implementar CRUD completo
- [ ] Añadir soft-delete (activo=false)
- [ ] Implementar validaciones con zod

### 4. Módulo Serials

- [ ] Corregir colección en Firestore (BeneficioSeriales)
- [ ] Implementar emisión masiva de seriales (SER-XXXX)
- [ ] Añadir asignación opcional de emitidoA:dni
- [ ] Implementar exportación CSV
- [ ] Implementar importación CSV

### 5. Módulo History

- [ ] Corregir colección en Firestore (Historial)
- [ ] Implementar filtros (tipo, rango de fechas, DNI, serial)
- [ ] Implementar ordenamiento por ts desc
- [ ] Añadir exportación CSV

### 6. Módulo Settings

- [ ] Corregir colección en Firestore (Ajustes/global)
- [ ] Actualizar campos según los requerimientos
- [ ] Implementar validación con zod
- [ ] Añadir feedback visual para operaciones

### 7. Seguridad

- [ ] Asegurar que todas las rutas estén protegidas por rol admin
- [ ] Añadir manejo de errores en todas las vistas
- [ ] Implementar loading states para mejorar UX

### 8. Documentación

- [ ] Completar README con instrucciones de uso
- [ ] Documentar configuración de índices de Firestore
- [ ] Añadir instrucciones de prueba para cada módulo

## Pruebas de verificación (GATE PR B)

Una vez completadas las tareas anteriores, realizar las siguientes pruebas:

1. Login admin -> acceder al panel
2. Emitir 10 seriales y verificar en Firestore
3. Canjear un serial desde la app móvil
4. Verificar que el canje aparece en History
5. Editar QR_TTL_SECONDS y verificar cambio en la app
6. Probar CRUD de Clients y Benefits

## Notas adicionales

- Mantener consistencia en los nombres de colecciones
- Usar los helpers de Firestore para todas las operaciones
- Implementar manejo de errores consistente