import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Vibration } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function Scanner({ onClose, onBarcode }) {
  const [permission, requestPermission] = useCameraPermissions();
  const lastReadRef = useRef(0);
  const [enabled, setEnabled] = useState(true);
  const [hasScanned, setHasScanned] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [debugMode, setDebugMode] = useState(false);

  // Log cuando el componente se monta para verificar
  useEffect(() => {
    console.log('EnhancedScanner montado, esperando códigos QR...');
    console.log('Tipos soportados: qr, code128, code39, code93, datamatrix, ean13, ean8, pdf417');
    
    // Si hay algún error con la cámara, lo registramos
    const unhandledError = (error) => {
      console.error('Error no manejado en Scanner:', error);
      Alert.alert('Error en la cámara', `Ha ocurrido un error: ${error.message}`);
    };
    
    // Agregar listener para errores
    const subscription = process.on('unhandledRejection', unhandledError);
    
    return () => {
      console.log('EnhancedScanner desmontado');
      // Eliminar listener para errores
      subscription?.remove();
    };
  }, []);

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Cargando cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Permiso de cámara</Text>
        <Text style={styles.subtitle}>Necesitamos acceso a la cámara para escanear códigos QR</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Conceder permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose}>
          <Text>Cerrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScan = (result) => {
    try {
      console.log('Código detectado:', result.data, 'tipo:', result.type);
      console.log('Corner points:', JSON.stringify(result.cornerPoints || []));
      
      const now = Date.now();
      // Reducimos el throttle a 300ms para mayor sensibilidad
      if (!enabled || now - lastReadRef.current < 300) return;
      
      // Guardamos el resultado para debugging
      setLastResult(result);
      lastReadRef.current = now;
      setHasScanned(true);
      
      // Vibración para feedback táctil
      Vibration.vibrate(200);
      
      // Notificar al usuario que se detectó un código
      if (debugMode) {
        Alert.alert('Código detectado (Debug)', 
          `Valor: ${result.data}\nTipo: ${result.type}\nPuntos: ${JSON.stringify(result.cornerPoints || [])}`, 
          [{ text: 'OK', onPress: () => setHasScanned(false) }]
        );
      }
      
      // Llamar al callback con los datos
      onBarcode?.({
        data: result.data, 
        type: result.type, 
        cornerPoints: result.cornerPoints,
        bounds: result.bounds,
        ts: new Date().toISOString(),
        device: 'android'
      });
    } catch (error) {
      console.error('Error al procesar el escaneo:', error);
      Alert.alert('Error', `Error al procesar el código: ${error.message}`);
      setHasScanned(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          // Ampliamos los tipos de códigos que puede leer
          barcodeTypes: ['qr', 'code128', 'code39', 'code93', 'datamatrix', 'ean13', 'ean8', 'pdf417']
        }}
        onBarcodeScanned={!hasScanned && enabled ? handleScan : undefined}
      />
      {/* Marco visual para enfocar el código */}
      <View style={styles.scanFrame}>
        <View style={styles.scanCorner1} />
        <View style={styles.scanCorner2} />
        <View style={styles.scanCorner3} />
        <View style={styles.scanCorner4} />
      </View>
      
      {/* Mensaje de instrucción */}
      <Text style={styles.scanHint}>
        {hasScanned ? '¡Código detectado!' : 'Coloca el código QR dentro del marco'}
      </Text>
      
      {/* Último resultado (solo en modo debug) */}
      {debugMode && lastResult && (
        <View style={styles.lastScannedContainer}>
          <Text style={styles.lastScannedTitle}>Último escaneo:</Text>
          <Text style={styles.lastScannedText}>Tipo: {lastResult.type || 'N/A'}</Text>
          <Text style={styles.lastScannedText}>Valor: {lastResult.data || 'N/A'}</Text>
        </View>
      )}
      
      {/* Controles */}
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={[styles.btn, styles.btnGhost]} 
          onPress={() => setEnabled(e => !e)}
        >
          <Text>{enabled ? 'Pausar' : 'Reanudar'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btn]} 
          onPress={onClose}
        >
          <Text style={styles.btnText}>Cerrar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btn, debugMode ? styles.btnActive : styles.btnGhost]} 
          onPress={() => setDebugMode(d => !d)}
        >
          <Text style={debugMode ? styles.btnText : {}}>Debug</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  btn: { backgroundColor: '#111', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, minWidth: 80, alignItems: 'center' },
  btnGhost: { backgroundColor: '#fff' },
  btnActive: { backgroundColor: '#4CAF50' },
  btnText: { color: '#fff', fontWeight: '700' },
  overlay: {
    position: 'absolute', bottom: 24, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'
  },
  scanFrame: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    right: '15%',
    height: '40%',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
    borderRadius: 10
  },
  scanCorner1: { position: 'absolute', top: 0, left: 0, width: 20, height: 20, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#fff', borderTopLeftRadius: 10 },
  scanCorner2: { position: 'absolute', top: 0, right: 0, width: 20, height: 20, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#fff', borderTopRightRadius: 10 },
  scanCorner3: { position: 'absolute', bottom: 0, left: 0, width: 20, height: 20, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#fff', borderBottomLeftRadius: 10 },
  scanCorner4: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#fff', borderBottomRightRadius: 10 },
  scanHint: {
    position: 'absolute',
    top: '75%',
    width: '100%',
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10
  },
  lastScannedContainer: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 5,
    alignItems: 'flex-start'
  },
  lastScannedTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  lastScannedText: {
    color: '#0f0',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 3
  }
});