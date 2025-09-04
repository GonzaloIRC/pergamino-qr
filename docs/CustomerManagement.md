# Documentación: Sistema de Gestión de Clientes

## Descripción
El sistema de gestión de clientes proporciona una solución completa para administrar los perfiles de clientes y su programa de fidelización mediante puntos. Permite a los administradores y meseros visualizar, buscar y gestionar clientes, mientras que los clientes pueden ver su propio perfil y historial de puntos.

## Características principales

### 1. Gestión de perfiles de cliente
- Registro completo de clientes con validación
- Búsqueda y filtrado de clientes
- Activación/desactivación de cuentas
- Visualización de datos personales

### 2. Sistema de puntos
- Visualización de puntos acumulados por cliente
- Historial detallado de cambios de puntos
- Adición manual de puntos por administradores
- Cálculo automático basado en consumo (1 punto por cada $1000)

### 3. Dashboards específicos por rol
- **Admin**: Vista completa con estadísticas y gestión
- **Mesero**: Acceso a clientes para verificación y asignación de puntos
- **Cliente**: Visualización de perfil propio y seguimiento de puntos

## Estructura de datos en Firestore

### Colección: `clientes`
```
{
  id: string,
  uid: string,          // ID de Firebase Auth
  nombre: string,
  apellido: string,
  dni: string,          // DNI o RUT, único por cliente
  email: string,
  nacimiento: string,   // Fecha de nacimiento
  fechaRegistro: string, // ISO date
  puntos: number,       // Puntos acumulados
  estado: string,       // 'activo' o 'inactivo'
  role: string          // 'cliente'
}
```

### Colección: `historialPuntos`
```
{
  id: string,
  clienteId: string,    // Referencia al ID del cliente
  puntos: number,       // Cantidad de puntos (positivo para suma, negativo para resta)
  tipo: string,         // 'suma' o 'resta'
  motivo: string,       // Descripción del motivo (ej: "Consumo", "Canje de premio")
  fecha: timestamp,
  usuario: string       // ID o nombre del usuario que realizó la operación
}
```

### Colección: `roles`
```
{
  id: string,           // Mismo que el UID de Firebase Auth
  role: string          // 'admin', 'waiter' o 'cliente'
}
```

## Componentes principales

### 1. `CustomerListScreen.js`
Pantalla que muestra la lista de todos los clientes con opciones de búsqueda, filtrado y ordenamiento.

### 2. `CustomerDetailScreen.js`
Pantalla de detalle que muestra toda la información de un cliente específico, su historial de puntos y opciones de gestión (solo para admin/mesero).

### 3. `CustomerDashboard.js`
Dashboard personalizado para los clientes donde pueden ver su información personal y seguimiento de puntos.

## Flujos de trabajo

### 1. Registro de nuevo cliente
1. Usuario accede a la pantalla de registro
2. Completa datos personales y credenciales
3. El sistema valida que el DNI/RUT no esté duplicado
4. Se crea la cuenta en Firebase Auth
5. Se registra el rol "cliente" en Firestore
6. Se almacenan los datos completos en la colección "clientes"

### 2. Adición manual de puntos
1. Admin accede al detalle de un cliente
2. Selecciona "Ajustar puntos"
3. Ingresa la cantidad (positiva para sumar, negativa para restar)
4. Opcionalmente añade un motivo
5. El sistema actualiza los puntos del cliente
6. Se registra la operación en el historial de puntos

### 3. Visualización de perfil (cliente)
1. Cliente inicia sesión
2. Accede a su dashboard personalizado
3. Visualiza su información personal y puntos acumulados
4. Puede consultar su historial de puntos

## Consideraciones de seguridad
- Solo usuarios autenticados pueden acceder al sistema
- Los clientes solo pueden ver su propio perfil
- La modificación de puntos está restringida a roles admin y mesero
- Las operaciones críticas (como desactivar cuentas) solo están disponibles para administradores

## Integración con otros sistemas
- **Sistema de Autenticación**: Utiliza Firebase Auth para gestión de usuarios y roles
- **Sistema de Campañas**: Las campañas pueden acceder a la información de puntos para determinar elegibilidad
- **Sistema de Análisis**: Puede utilizar los datos de clientes y puntos para generar informes y estadísticas
