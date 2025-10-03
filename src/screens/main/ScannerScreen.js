import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Vibration } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { processBenefitRedemption, processPointAccumulation } from '../../services/transactions';
import { parseQrPayload } from '../../utils/qr';
import { useSettings } from '../../hooks/useSettings';

export default function ScannerScreen({ navigation }) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [torch, setTorch] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Cooldown para evitar escaneos duplicados
  const lastScans = useRef({});
  const cameraRef = useRef(null);
  
  // Solicitar permisos al montar
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Verificar si un código está en cooldown
  const isInCooldown = (key) => {
    const cooldownMs = settings?.SCAN_COOLDOWN_MS || 3000;
    const lastScan = lastScans.current[key];
    if (!lastScan) return false;
    
    const elapsed = Date.now() - lastScan;
    return elapsed < cooldownMs;
  };
  
  // Registrar un escaneo
  const recordScan = (key) => {
    lastScans.current[key] = Date.now();
  };
  
  // Manejar escaneo de código
  const handleScan = async (scanData) => {
    if (!scanData?.data || !scanning || processing) {
      return;
    }
    
    try {
      setProcessing(true);
      setScanning(false);
      
      console.log('Datos escaneados:', scanData.data);
      // Vibrar para indicar que se detectó un código
      Vibration.vibrate(100);
      
      // Parsear código QR
      const parsedQr = parseQrPayload(scanData.data);
      console.log('QR parseado:', JSON.stringify(parsedQr));
      
      // Handle different QR types
      switch(parsedQr.type) {
        case 'benefit':
          // Verificar cooldown para evitar duplicados
          if (isInCooldown(`benefit:${parsedQr.serialId}`)) {
            Alert.alert('Procesado recientemente', 'Por favor espere unos segundos antes de volver a escanear');
            setProcessing(false);
            setScanning(true);
            return;
          }
          
          await handleBenefitRedemption(parsedQr.serialId);
          
          // Registrar escaneo
          recordScan(`benefit:${parsedQr.serialId}`);
          break;
        case 'customer':
          // Verificar cooldown para evitar duplicados
          if (isInCooldown(`customer:${parsedQr.dni}`)) {
            Alert.alert('Procesado recientemente', 'Por favor espere unos segundos antes de volver a escanear');
            setProcessing(false);
            setScanning(true);
            return;
          }
          
          await handlePointAccumulation(parsedQr.dni, parsedQr.nonce);
          
          // Registrar escaneo
          recordScan(`customer:${parsedQr.dni}`);
          await handlePointAccumulation(parsedQr.dni, parsedQr.nonce);
          break;
        default:
          Alert.alert(
            'Código desconocido', 
            `El formato del código QR no es compatible: ${JSON.stringify(parsedQr)}`,
            [{ text: 'OK', onPress: () => setScanning(true) }]
          );
      }
    } catch (error) {
      handleScanError(error);
    }
  };

  const handleScanError = (error) => {
    console.error('Error procesando QR:', error);
    Alert.alert(
      'Error', 
      'Ocurrió un error al procesar el código QR.',
      [{ text: 'OK', onPress: () => setScanning(true) }]
    );
  };

  const handleBenefitRedemption = async (serialId) => {
    if (!user) {
      Alert.alert(
        'Error', 
        'Debes iniciar sesión para canjear beneficios.',
        [{ text: 'OK', onPress: () => setScanning(true) }]
      );
      return;
    }

    const result = await processBenefitRedemption(serialId, user.uid);
    
    if (result.success) {
      Alert.alert('¡Beneficio canjeado!', result.message || `El serial ${serialId} ha sido canjeado exitosamente.`, [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } else {
      Alert.alert('Error en el canje', result.message || 'No se pudo procesar el canje del beneficio.', [
        { text: 'Intentar de nuevo', onPress: () => setScanning(true) }
      ]);
    }
  };

  const handlePointAccumulation = async (dni, nonce) => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para registrar puntos.', [
        { text: 'OK', onPress: () => setScanning(true) }
      ]);
      return;
    }

    const result = await processPointAccumulation(dni, nonce, user.uid);
    
    if (result.success) {
      Alert.alert('Puntos acumulados', result.message || `Se han registrado puntos para el cliente con DNI: ${dni}.`, [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } else {
      Alert.alert('Error en la acumulación', result.message || 'No se pudieron registrar los puntos.', [
        { text: 'Intentar de nuevo', onPress: () => setScanning(true) }
      ]);
    }
  };

  // Manejar permisos de cámara
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.text}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off" size={64} color="red" />
        <Text style={styles.text}>No hay acceso a la cámara</Text>
        <Text style={styles.subtext}>Por favor, permita el acceso desde la configuración de su dispositivo.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scanning && !processing && (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          type={Camera.Constants.Type.back}
          flashMode={torch ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
          onBarCodeScanned={handleScan}
          barCodeScannerSettings={{
            barCodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
          </View>
        </Camera>
      )}
      
      {processing && (
        <View style={styles.processing}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.processingText}>Procesando...</Text>
        </View>
      )}
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setTorch(!torch)}
        >
          <Ionicons name={torch ? "flashlight" : "flashlight-outline"} size={24} color="white" />
          <Text style={styles.buttonText}>Linterna</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => setScanning(true)}
          disabled={processing}
        >
          <Ionicons name="scan" size={24} color="white" />
          <Text style={styles.buttonText}>Escanear</Text>
        </TouchableOpacity>
        
        {/* Aquí iría la UI para entrada manual si se implementa */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  buttonText: {
    color: '#fff',
    marginTop: 5,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  subtext: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  processing: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  }
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  secondaryButtonText: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructions: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    alignItems: 'center',
    zIndex: 10,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  instructionDetail: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  lastScannedContainer: {
    marginTop: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
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
  }
});
