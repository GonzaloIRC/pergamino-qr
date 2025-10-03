# Shared Firebase Functions for Pergamino App

Este módulo contiene funciones compartidas de Firebase que pueden ser utilizadas tanto por la aplicación móvil como por el panel de administración web.

## Instalación

Desde la raíz del proyecto, ejecuta:

```bash
cd packages/shared-firebase
npm install
```

## Uso

### En la aplicación móvil

```javascript
import { createCustomerWithDNI, getCustomerByDNI } from '../../packages/shared-firebase';

// Para crear un cliente con DNI
try {
  const result = await createCustomerWithDNI({
    dni: '12345678',
    displayName: 'Nombre Cliente',
    phone: '+123456789'
  });
  console.log('Cliente creado:', result);
} catch (error) {
  if (error.message === 'dni-already-taken') {
    console.error('Este DNI ya está registrado');
  } else {
    console.error('Error al crear cliente:', error);
  }
}

// Para obtener un cliente por DNI
const cliente = await getCustomerByDNI('12345678');
console.log('Cliente:', cliente);
```

### En el panel de administración web

```typescript
import { reassignDNIByAdmin } from '../../../packages/shared-firebase';

// Para reasignar un DNI (solo administradores)
try {
  const result = await reassignDNIByAdmin('12345678', 'nuevoUID', 'adminUID');
  console.log('DNI reasignado correctamente:', result);
} catch (error) {
  console.error('Error al reasignar DNI:', error.message);
}
```

## Funciones disponibles

### `createCustomerWithDNI`

Crea un cliente con un DNI específico. Utiliza transacciones de Firestore para garantizar la integridad de los datos.

### `reassignDNIByAdmin`

Permite a un administrador reasignar un DNI a un usuario diferente. Verifica permisos de administrador.

### `getCustomerByDNI`

Obtiene los datos de un cliente por su DNI.

## Seguridad

Estas funciones trabajan en conjunto con las reglas de seguridad de Firestore configuradas. Asegúrate de que las reglas de seguridad estén correctamente implementadas para evitar accesos no autorizados.