# Checklist de Aceptación

## Funcionalidad
- [x] KPIs cargan desde Firestore con estados de carga/error.
- [x] History filtra por fecha, DNI, serial y lista resultados.
- [x] Export CSV genera archivo con encabezados e ISO datetime.

## Testabilidad
- [x] data-testid presentes en filtros, tabla, KPIs y botones.
- [x] E2E verdes en CI (workers=1).

## Revisión de Código
- [ ] Código comentado y con tipos adecuados
- [ ] Sin console.log de desarrollo
- [ ] Error handling implementado
- [ ] Optimización de rendimiento considerada

## Detalles de Implementación
### KPIs
- Implementación de estados de carga (loading skeletons)
- Manejo de errores con mensajes informativos
- Actualización en tiempo real desde Firestore

### History
- Filtros funcionando correctamente:
  - Por fecha (rango inicio/fin)
  - Por DNI (búsqueda parcial)
  - Por serial (búsqueda exacta)
- Resultados paginados y ordenados por fecha
- Indicadores de estado vacío/carga/error

### Export CSV
- Formato correcto con encabezados
- Fechas en formato ISO
- Datos escapados correctamente
- Nombre de archivo con timestamp
- Indicador de progreso durante exportación

### Testing
- Tests E2E verifican:
  - Login funcional
  - Navegación por sidebar
  - Carga de KPIs
  - Filtros de History
  - Funcionalidad de exportación
- CI configurado para ejecutar pruebas con --workers=1