# Documentación: Módulo TrackingTable

## Descripción
El módulo TrackingTable proporciona una solución completa para el seguimiento y gestión de mesas en restaurantes. Permite a los meseros y administradores visualizar el estado actual de cada mesa, actualizar su estado, y llevar un registro de los cambios y consumos.

## Características principales

### 1. Vista general de mesas
- Visualización en tiempo real del estado de todas las mesas
- Filtrado por estado (disponible, ocupada, esperando servicio, etc.)
- Indicadores visuales claros del estado de cada mesa

### 2. Gestión de estados
- Cambio rápido entre los siguientes estados:
  - **Disponible**: La mesa está lista para recibir clientes
  - **Ocupada**: La mesa está siendo utilizada por clientes
  - **Esperando servicio**: Los clientes están esperando ser atendidos
  - **Esperando cuenta**: Los clientes han solicitado la cuenta
  - **Reservada**: La mesa está reservada para una fecha/hora específica
  - **Limpieza**: La mesa está siendo preparada para nuevos clientes

### 3. Detalles de mesa
- Vista detallada de información de cada mesa
- Historial de cambios de estado
- Registro de consumos asociados
- Capacidad para asignar cliente a la mesa

### 4. Integración con el sistema de puntos
- Registro de consumos en mesa vinculados al sistema de puntos
- Cálculo automático de puntos basados en el consumo

## Estructura de datos en Firestore

### Colección: `mesas`
```
{
  id: string,
  numero: number,
  capacidad: number,
  estado: string,  // 'disponible', 'ocupada', 'esperando_servicio', 'esperando_cuenta', 'reservada', 'limpieza'
  clienteActual: string,  // opcional, ID o nombre del cliente
  ultimaActualizacion: timestamp,
  creado: timestamp
}
```

### Colección: `historialMesas`
```
{
  id: string,
  mesaId: string,  // referencia a documento en colección 'mesas'
  numeroMesa: number,
  estadoAnterior: string,
  estadoNuevo: string,
  timestamp: timestamp,
  usuario: string  // ID o nombre del usuario que realizó el cambio
}
```

### Colección: `consumos`
```
{
  id: string,
  mesaId: string,  // referencia a documento en colección 'mesas'
  clienteId: string,  // referencia a documento en colección 'clientes'
  productos: [
    {
      nombre: string,
      precio: number,
      cantidad: number
    }
  ],
  total: number,
  puntosGanados: number,
  fecha: timestamp,
  mesero: string  // ID o nombre del mesero
}
```

## Componentes principales

### 1. `TrackingTable.js`
Componente principal que muestra la lista de todas las mesas y permite filtrarlas por estado.

### 2. `TableManagementScreen.js`
Pantalla para gestionar todas las mesas, con posibilidad de añadir nuevas mesas.

### 3. `TableDetailScreen.js`
Pantalla de detalle de una mesa específica, que muestra toda la información relacionada y permite cambiar su estado.

## Flujos de trabajo

### 1. Atención básica de mesa
1. Cliente llega al restaurante
2. Mesero cambia estado de mesa a "Ocupada"
3. Durante la visita, el estado puede cambiar a "Esperando servicio" si el cliente lo solicita
4. Al finalizar, el cliente pide la cuenta y el estado cambia a "Esperando cuenta"
5. Después del pago, el estado cambia a "Limpieza"
6. Tras la limpieza, el estado vuelve a "Disponible"

### 2. Registro de consumo
1. Mesero selecciona mesa ocupada
2. Ingresa los productos consumidos
3. El sistema calcula el total y los puntos ganados
4. Se registra el consumo asociado a la mesa y al cliente

### 3. Reserva de mesa
1. Administrador o mesero selecciona mesa disponible
2. Cambia su estado a "Reservada"
3. Opcionalmente, asocia un cliente a la reserva
4. En la hora de la reserva, cuando llega el cliente, se cambia a "Ocupada"

## Consideraciones de seguridad
- Solo usuarios con rol de mesero o administrador pueden modificar el estado de las mesas
- El historial guarda registro de todos los cambios realizados y quién los hizo
- Las operaciones críticas (como eliminar mesas) solo están disponibles para administradores

## Inicialización
Para inicializar las colecciones necesarias, se proporciona un script `trackingTableInit.js` que crea la estructura de datos y opcionalmente puede poblar la base de datos con ejemplos.
