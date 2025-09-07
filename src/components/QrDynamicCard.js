import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

// TTL en segundos para renovar el código QR
const TTL = Number(process.env.EXPO_PUBLIC_QR_TTL_SECONDS || 30);

// Función para generar un nonce aleatorio
function nonce() {
  return Math.random().toString(36).slice(2, 8);
}

export default function QrDynamicCard({ dni }) {
  const [value, setValue] = useState(null);
  const timer = useRef(null);
  
  // Función para renovar el código QR
  const refresh = () => setValue(`APP:${dni}:${nonce()}`);

  // Configurar el temporizador para renovar el QR automáticamente
  useEffect(() => {
    if (!dni) return;
    
    // Generar QR inicial
    refresh();
    
    // Configurar temporizador para renovación
    timer.current = setInterval(refresh, TTL * 1000);
    
    // Limpiar temporizador al desmontar
    return () => clearInterval(timer.current);
  }, [dni]);

  // Si no hay DNI, mostrar mensaje
  if (!dni) return <Text>Completa tu DNI para generar QR.</Text>;

  return (
    <View style={{ alignItems: 'center', padding: 16 }}>
      <QRCode value={value || ''} size={220} />
      <Text style={{ marginTop: 8 }}>Se renueva cada {TTL}s</Text>
    </View>
  );
}
