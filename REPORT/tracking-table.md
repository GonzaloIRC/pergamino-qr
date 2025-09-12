# Tabla de Seguimiento para Escaneos de Códigos QR

## Introducción

La tabla de seguimiento (tracking table) es un componente fundamental para monitorear y analizar el uso de códigos QR en la aplicación Pergamino. Esta tabla registra todos los escaneos realizados, proporcionando datos valiosos sobre el comportamiento de los usuarios, la efectividad de las promociones, y ayudando a identificar posibles problemas o abusos.

## Estructura de Datos

La tabla de seguimiento tiene la siguiente estructura en Firestore:

```
tracking/{trackingId}
  - codeId: string (ID del código QR escaneado)
  - type: string (tipo de código: 'cliente', 'mesa', 'promocion', etc.)
  - userId: string (ID del usuario que escanea, null si es anónimo)
  - userRole: string (rol del usuario: 'admin', 'mesero', 'cliente', etc.)
  - timestamp: timestamp (momento del escaneo)
  - location: geopoint (ubicación del escaneo, opcional)
  - device: string (info del dispositivo, opcional)
  - status: string ('success', 'error', etc.)
  - action: string (acción realizada: 'view', 'redeem', etc.)
  - metadata: map (datos adicionales específicos del tipo de código)
```

## Tipos de Códigos Soportados

La tabla de seguimiento actualmente soporta los siguientes tipos de códigos QR:

1. **Código de Cliente** (`type: 'cliente'`)
   - Formato: JSON con `clienteId`
   - Uso: Identificación de clientes en el restaurante

2. **Código de Mesa** (`type: 'mesa'`)
   - Formato: `MESA:numero:restaurante` o JSON legado con `mesa` y `restaurante`
   - Uso: Identificación de mesas para registros de clientes

3. **Código de Beneficio** (`type: 'beneficio'`)
   - Formato: `BNF:serial`
   - Uso: Canje de promociones y beneficios

4. **Código de Aplicación** (`type: 'app'`)
   - Formato: `APP:dni:nonce`
   - Uso: Identificación rápida por DNI/RUT

## Implementación

La implementación se realiza a través de los siguientes componentes:

1. **`trackingTableInit.js`**: Inicializa la tabla y proporciona funciones para registrar escaneos.
2. **`Scanner.js`**: Componente unificado para escanear códigos QR usando expo-camera.
3. **`qrService.js`**: Servicio central para procesar los resultados de escaneo.
4. **`collections.js`**: Centraliza los nombres de colecciones para evitar errores.

## Funciones Principales

### `trackScan(scanData)`

Registra un nuevo evento de escaneo en la tabla tracking.

```javascript
const trackResult = await trackScan({
  codeId: 'MESA:12:Pergamino',
  type: 'mesa',
  userId: auth.currentUser?.uid,
  userRole: 'cliente',
  location: { latitude: -33.448890, longitude: -70.669265 },
  device: Platform.OS,
  action: 'view',
  metadata: { mesa: '12', restaurante: 'Pergamino' }
});
```

### `getCodeScanHistory(codeId)`

Obtiene el historial de escaneos para un código específico.

```javascript
const history = await getCodeScanHistory('MESA:12:Pergamino');
```

### `getScanStats(options)`

Obtiene estadísticas de escaneos filtradas por tipo y período.

```javascript
const stats = await getScanStats({
  type: 'mesa',
  startDate: new Date('2025-07-01'),
  endDate: new Date('2025-07-31')
});
```

## Análisis de Datos

Los datos recopilados en la tabla de seguimiento pueden analizarse para:

1. **Patrones de Uso**: Identificar los momentos de mayor actividad.
2. **Eficacia de Promociones**: Evaluar qué promociones generan mayor interacción.
3. **Comportamiento de Usuarios**: Analizar cómo los diferentes tipos de usuarios interactúan con los códigos.
4. **Detección de Abusos**: Identificar patrones sospechosos de uso repetitivo.

## Reglas de Seguridad

Se recomienda implementar las siguientes reglas de seguridad en Firestore:

```
match /tracking/{trackingId} {
  allow create: if request.auth != null;
  allow read: if request.auth != null && (
    request.auth.token.admin == true || 
    request.auth.uid == resource.data.userId
  );
}
```

## Consideraciones de Privacidad

La tabla de seguimiento almacena información sensible como ubicación y patrones de comportamiento. Es importante:

1. **Informar a los Usuarios**: Notificar claramente sobre los datos recopilados.
2. **Limitar el Acceso**: Restringir el acceso a estos datos solo a personal autorizado.
3. **Establecer Políticas de Retención**: Definir cuánto tiempo se conservarán estos datos.

## Próximos Pasos

1. **Implementar Visualización**: Desarrollar un dashboard para visualizar estadísticas de escaneos.
2. **Exportación de Datos**: Permitir la exportación de datos para análisis externos.
3. **Alertas Automatizadas**: Configurar alertas para patrones inusuales o sospechosos.
4. **Integración con Analytics**: Conectar con Firebase Analytics para análisis más avanzados.
