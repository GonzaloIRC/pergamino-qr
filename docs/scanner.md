# Scanner Component

Esta documentación describe el componente reutilizable `QrCodeScanner` implementado para la aplicación Pergamino.

## Características

- Scanner de códigos QR unificado utilizando `expo-camera`
- Feedback háptico al escanear códigos
- Soporte para flash (linterna)
- Manejo adecuado de permisos de cámara
- Indicador visual para posicionar códigos
- Interfaz clara y sencilla

## Uso

El componente `QrCodeScanner` está diseñado para ser reutilizable en cualquier parte de la aplicación. Aquí hay un ejemplo básico de cómo usarlo:

```jsx
import React from 'react';
import { View } from 'react-native';
import QrCodeScanner from '../components/Scanner';

export default function ScanScreen() {
  const handleScan = ({ type, data }) => {
    console.log(`Código escaneado: ${data}`);
    // Procesar los datos escaneados
  };

  return (
    <View style={{ flex: 1 }}>
      <QrCodeScanner
        onScan={handleScan}
        showGalleryButton={false}
        onClose={() => navigation.goBack()}
      />
    </View>
  );
}
```

## Props

| Prop | Tipo | Requerido | Descripción |
|------|------|----------|-------------|
| `onScan` | function | Sí | Función callback que recibe el objeto `{ type, data }` cuando se escanea un código. |
| `showGalleryButton` | boolean | No | Controla si se muestra el botón para seleccionar una imagen de la galería. Por defecto es `false`. |
| `onClose` | function | No | Función callback para cerrar el scanner. Si se proporciona, se mostrará un botón de cierre. |

## Formato de datos

El componente está diseñado para escanear códigos QR que contienen datos JSON. El formato recomendado para los códigos QR en la aplicación Pergamino es:

```json
{
  "id": "string-uuid",
  "type": "batch|farm|process",
  "timestamp": "ISO-date-string",
  "data": {
    // Datos específicos según el tipo
  }
}
```

## Permisos

El componente maneja automáticamente la solicitud de permisos de cámara y muestra mensajes apropiados al usuario si los permisos no son concedidos.

## Implementación

- Utiliza `expo-camera` para acceder a la cámara
- Implementa feedback háptico con `expo-haptics`
- Proporciona una interfaz visual clara para guiar al usuario

## Mejoras futuras

- Añadir soporte para escanear desde imágenes de la galería
- Mejorar el procesamiento de formatos de códigos específicos para la aplicación
- Implementar un histórico de escaneos recientes
