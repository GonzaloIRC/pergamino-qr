# Configuración de credenciales Firebase

## Para usar el seed con Firebase real:

1. Descarga el archivo de credenciales de servicio desde Firebase Console
2. Guárdalo en una ubicación segura (ej: C:\firebase\service-account.json)
3. Configura la variable de entorno:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\ruta\a\tu\service-account.json"
```

4. Ejecuta el seed:
```powershell
node scripts/seedBeneficioDemo.js
```

## Para usar con emulador (alternativa):

1. Modifica .env:
```
EXPO_PUBLIC_USE_EMULATORS=true
```

2. Instala Firebase Tools:
```powershell
npm install -g firebase-tools
```

3. Inicia el emulador:
```powershell
firebase emulators:start --only firestore
```

4. Ejecuta el seed:
```powershell
node scripts/seedBeneficioDemo.js
```
