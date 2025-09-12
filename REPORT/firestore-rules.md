# Reglas de Seguridad para Firestore

Este documento describe las reglas de seguridad recomendadas para la base de datos Firestore del proyecto Pergamino.

## Configuración General

Las reglas deben aplicarse en el archivo `firestore.rules` del proyecto Firebase. La estructura básica es:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para cada colección
  }
}
```

## Reglas por Colección

### Tracking

La colección de tracking contiene información sensible sobre los escaneos y debe estar protegida:

```
match /tracking/{trackingId} {
  // Sólo usuarios autenticados pueden crear registros
  allow create: if request.auth != null;
  
  // Sólo administradores o el propio usuario pueden leer sus registros
  allow read: if request.auth != null && (
    request.auth.token.admin == true || 
    request.auth.uid == resource.data.userId
  );
  
  // Sólo administradores pueden modificar o eliminar
  allow update, delete: if request.auth != null && 
    request.auth.token.admin == true;
}
```

### Historial

La colección de historial registra las transacciones de canje y acumulación:

```
match /Historial/{docId} {
  // Sólo usuarios autenticados pueden leer o crear
  allow create: if request.auth != null;
  
  // Lectura para administradores y usuarios relacionados al registro
  allow read: if request.auth != null && (
    request.auth.token.admin == true ||
    request.auth.token.waiter == true ||
    request.auth.uid == resource.data.userId
  );
  
  // Sin modificación ni eliminación
  allow update, delete: if false;
}
```

### BeneficioSeriales

Los seriales de beneficios necesitan reglas específicas:

```
match /BeneficioSeriales/{serialId} {
  // Lectura para usuarios autenticados (verificar estado)
  allow read: if request.auth != null;
  
  // Actualización sólo para meseros y administradores, con validación de estado
  allow update: if request.auth != null && 
    (request.auth.token.waiter == true || request.auth.token.admin == true) &&
    (resource.data.estado == 'activo' && request.resource.data.estado == 'usado');
    
  // Creación sólo para administradores
  allow create: if request.auth != null && request.auth.token.admin == true;
  
  // Eliminación sólo para administradores
  allow delete: if request.auth != null && request.auth.token.admin == true;
}
```

### Clientes

La colección de clientes contiene información personal:

```
match /Clientes/{dni} {
  // Lectura para usuarios autenticados
  allow read: if request.auth != null;
  
  // Creación y actualización para meseros y administradores
  allow create, update: if request.auth != null && 
    (request.auth.token.waiter == true || request.auth.token.admin == true);
    
  // Eliminación sólo para administradores
  allow delete: if request.auth != null && request.auth.token.admin == true;
}
```

## Funciones Auxiliares

Es útil definir funciones para validaciones comunes:

```
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}

function isWaiter() {
  return request.auth != null && 
    (request.auth.token.waiter == true || request.auth.token.admin == true);
}

function isAuthenticated() {
  return request.auth != null;
}
```

## Implementación

Para aplicar estas reglas:

1. Copiar las reglas al archivo `firestore.rules`
2. Desplegar usando Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Consideraciones

- Revisar periódicamente las reglas para asegurar que sigan cumpliendo los requisitos de seguridad
- Utilizar claims personalizados en los tokens JWT para los roles (admin, waiter)
- Implementar validaciones adicionales en el código del cliente para mejorar la experiencia de usuario
