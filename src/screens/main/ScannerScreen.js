import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { processBenefitRedemption, processPointAccumulation } from '../../services/transactions';

export default function ScannerScreen({ navigation }) {
  const { currentUser } = useAuth();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const scanCooldown = useRef(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    // Debounce mechanism to prevent multiple scans
    if (scanCooldown.current || processing) return;
    
    scanCooldown.current = true;
    setScanned(true);
    setProcessing(true);
    
    try {
      // Parse QR code data
      if (data.startsWith('BNF:')) {
        // Benefit redemption flow
        const serialId = data.substring(4); // Remove 'BNF:' prefix
        await handleBenefitRedemption(serialId);
      } else if (data.startsWith('APP:')) {
        // Point accumulation flow
        const parts = data.substring(4).split(':'); // Remove 'APP:' prefix
        if (parts.length === 2) {
          const [dni, nonce] = parts;
          await handlePointAccumulation(dni, nonce);
        } else {
          Alert.alert('Formato Inválido', 'QR de acumulación con formato incorrecto.');
        }
      } else {
        Alert.alert('QR Desconocido', 'Este código QR no es compatible con la aplicación.');
      }
    } catch (error) {
      console.error('Error procesando QR:', error);
      Alert.alert('Error', 'Ocurrió un error al procesar el código QR.');
    } finally {
      setProcessing(false);
      // Reset cooldown after 1.5 seconds
      setTimeout(() => {
        scanCooldown.current = false;
        setScanned(false);
      }, 1500);
    }
  };

  const handleBenefitRedemption = async (serialId) => {
    if (!currentUser) {
      Alert.alert('Error', 'Debes iniciar sesión para canjear beneficios.');
      return;
    }

    const result = await processBenefitRedemption(serialId, currentUser.uid);
    
    if (result.success) {
      Alert.alert('¡Éxito!', result.message, [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const handlePointAccumulation = async (dni, nonce) => {
    if (!currentUser) {
      Alert.alert('Error', 'Debes iniciar sesión para registrar puntos.');
      return;
    }

    const result = await processPointAccumulation(dni, nonce, currentUser.uid);
    
    if (result.success) {
      Alert.alert('¡Éxito!', result.message, [
        { text: 'Ver Cliente', onPress: () => navigation.navigate('Customers', { searchDni: dni }) },
        { text: 'OK', style: 'cancel' }
      ]);
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const toggleFlashMode = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.torch
        ? Camera.Constants.FlashMode.off
        : Camera.Constants.FlashMode.torch
    );
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        flashMode={flashMode}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            {processing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.processingText}>Procesando...</Text>
              </View>
            )}
          </View>
          
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>Escanea un código QR:</Text>
            <Text style={styles.instructionDetail}>• BNF:SER-XXXX para canjear beneficio</Text>
            <Text style={styles.instructionDetail}>• APP:DNI:CODIGO para registrar cliente</Text>
          </View>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlashMode}>
            <Ionicons 
              name={flashMode === Camera.Constants.FlashMode.torch ? "flash" : "flash-off"} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
          
          {scanned && (
            <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
              <Text style={styles.scanAgainText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </Camera>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  instructions: {
    position: 'absolute',
    bottom: 120,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionDetail: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 5,
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  scanAgainButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
