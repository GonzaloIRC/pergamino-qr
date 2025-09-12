// src/components/Scanner.js
import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function Scanner({ onScan, onError }) {
  const [flashOn, setFlashOn] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [perm, requestPermission] = useCameraPermissions();
  
  // Debounce mechanism with useRef
  const scanDebounce = useRef(false);
  const lastScanTime = useRef(0);
  const DEBOUNCE_MS = 2000; // 2 seconds cooldown between scans
  
  // Request camera permissions on component mount
  React.useEffect(() => {
    if (!perm || perm.status !== 'granted') {
      requestPermission();
    }
  }, [perm]);

  const handleBarCodeScanned = useCallback(async ({ data }) => {
    const now = Date.now();
    
    // Skip if: 1) Currently processing a scan, 2) Within debounce period, or 3) Debounce flag active
    if (processing || (now - lastScanTime.current < DEBOUNCE_MS) || scanDebounce.current) {
      return;
    }

    try {
      // Set debounce flag and update timestamp
      scanDebounce.current = true;
      lastScanTime.current = now;
      setProcessing(true);
      
      // Call the parent handler with the QR data
      await onScan(data);
      
    } catch (error) {
      if (onError) onError(error);
      console.error('Error scanning QR code:', error);
    } finally {
      // Reset processing state
      setProcessing(false);
      
      // Reset debounce flag after the cooldown period
      setTimeout(() => {
        scanDebounce.current = false;
      }, DEBOUNCE_MS);
    }
  }, [processing, onScan, onError]);

  // Show camera permission request if not granted
  if (!perm) {
    return (
      <View style={styles.container}>
        <Text>Solicitando permisos de cámara...</Text>
      </View>
    );
  }
  
  if (!perm.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Necesitamos acceso a la cámara para escanear códigos QR
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>
            Permitir Acceso
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={processing ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        enableTorch={flashOn}
      />

      {/* Scan overlay and indicators */}
      <View style={styles.overlay}>
        <View style={styles.scanArea}>
          {processing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={styles.processingText}>Procesando...</Text>
            </View>
          )}
        </View>
        
        {/* Controls at the bottom */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFlashOn(!flashOn)}
          >
            <Ionicons 
              name={flashOn ? "flash" : "flash-off"} 
              size={28} 
              color="white" 
            />
            <Text style={styles.controlText}>
              {flashOn ? 'Flash ON' : 'Flash OFF'}
            </Text>
          </TouchableOpacity>
        </View>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 10,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    marginHorizontal: 20,
    width: 80,
  },
  controlText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
  },
  permissionText: {
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    padding: 20,
  },
  permissionButton: {
    backgroundColor: '#4630EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
