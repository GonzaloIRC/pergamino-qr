# Scripts de Seeding para Pergamino App

Este directorio contiene scripts útiles para generar datos de prueba en la aplicación Pergamino.

## Requisitos previos

1. Asegúrate de tener Node.js instalado (versión 20.x recomendada)
2. Instala las dependencias del proyecto con `npm install`

## Scripts disponibles

### Crear un usuario administrador

```powershell
# En Windows PowerShell, con emuladores
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
$env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
node scripts/createAdminUser.js

# En Unix (Linux/Mac), con emuladores
FIRESTORE_EMULATOR_HOST="127.0.0.1:8080" FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099" node scripts/createAdminUser.js
```

Este script crea un usuario administrador con credenciales:
- Email: admin@test.com
- Password: Admin123!

### Listar usuarios administradores

```powershell
# En Windows PowerShell, con emuladores
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
$env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
node scripts/listAdmins.js

# En Unix (Linux/Mac), con emuladores
FIRESTORE_EMULATOR_HOST="127.0.0.1:8080" FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099" node scripts/listAdmins.js
```

### Crear un cliente demo

```powershell
# En Windows PowerShell, con emuladores
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
$env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
node scripts/seedCustomer.js

# En Unix (Linux/Mac), con emuladores
FIRESTORE_EMULATOR_HOST="127.0.0.1:8080" FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099" node scripts/seedCustomer.js
```

Este script crea un usuario cliente con credenciales:
- Email: cliente@test.com
- Password: Cliente123!
- DNI: 12345678
- Nombre: Cliente Demo

### Importar clientes desde un archivo CSV

```powershell
# En Windows PowerShell, con emuladores
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
$env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
node scripts/importCustomers.js scripts/clientes_ejemplo.csv

# En Unix (Linux/Mac), con emuladores
FIRESTORE_EMULATOR_HOST="127.0.0.1:8080" FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099" node scripts/importCustomers.js scripts/clientes_ejemplo.csv
```

Este script importa clientes desde un archivo CSV. El archivo debe tener las siguientes columnas:
- dni (obligatorio)
- nombre (opcional)
- telefono (opcional)

Se proporciona un archivo de ejemplo `clientes_ejemplo.csv` que puedes usar como plantilla.

## Notas importantes

- Para usar estos scripts, primero asegúrate de que los emuladores de Firebase estén corriendo con `npm run emulators:start`
- Estos scripts utilizan las funciones compartidas del módulo `shared-firebase`
- Para usar estos scripts con Firebase en la nube (producción), omite las variables de entorno `FIRESTORE_EMULATOR_HOST` y `FIREBASE_AUTH_EMULATOR_HOST`