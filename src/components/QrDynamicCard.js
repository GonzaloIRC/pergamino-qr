import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSettings } from '../hooks/useSettings';

// Función para generar un nonce aleatorio
function nonce() {
  return Math.random().toString(36).slice(2, 8);
}

export default function QrDynamicCard({ dni }) {
  const [value, setValue] = useState(null);
  const timer = useRef(null);
  const { settings, loading } = useSettings();
  
  // Función para renovar el código QR
  const refresh = () => setValue(`APP:${dni}:${nonce()}`);

  // Configurar el temporizador para renovar el QR automáticamente
  useEffect(() => {
    if (!dni || loading) return;
    
    const TTL = settings.QR_TTL_SECONDS || 30;
    
    // Generar QR inicial
    refresh();
    
    // Configurar temporizador para renovación
    timer.current = setInterval(refresh, TTL * 1000);
    
    // Limpiar temporizador al desmontar
    return () => clearInterval(timer.current);
  }, [dni, settings.QR_TTL_SECONDS, loading]);

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <View style={{ alignItems: 'center', padding: 16, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 16 }}>Cargando configuración...</Text>
      </View>
    );
  }
  
  // Si no hay DNI, mostrar mensaje
  if (!dni) return <Text>Completa tu DNI para generar QR.</Text>;

  const TTL = settings.QR_TTL_SECONDS || 30;
  
  return (
    <View style={{ alignItems: 'center', padding: 16 }}>
      <QRCode value={value || ''} size={220} />
      <Text style={{ marginTop: 8 }}>Se renueva cada {TTL}s</Text>
    </View>
  );
}
