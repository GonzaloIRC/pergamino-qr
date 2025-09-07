import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { processBenefitRedemption, processPointAccumulation } from '../../services/transactions';
import Scanner from '../../components/BarcodeScanner/Scanner';
import { parseQrPayload } from '../../utils/qr';

export default function ScannerScreen({ navigation }) {
  const { user } = useAuth();
  const [scanning, setScanning] = useState(true);
  
  const handleScan = async (scanResult) => {
    if (!scanResult?.data) return;
    setScanning(false);
    
    try {
      // Parse the QR code data
      const parsedQr = parseQrPayload(scanResult.data);
      
      // Handle different QR types
      switch(parsedQr.type) {
        case 'benefit':
          await handleBenefitRedemption(parsedQr.serialId);
          break;
        case 'customer':
          await handlePointAccumulation(parsedQr.dni, parsedQr.nonce);
          break;
        default:
          Alert.alert(
            'Código desconocido', 
            'El formato del código QR no es compatible con esta aplicación.',
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

  const closeScanner = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {scanning ? (
        <Scanner onScan={handleScan} onClose={closeScanner} />
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.title}>Procesando código</Text>
          <Text style={styles.subtitle}>Por favor espera...</Text>
          
          <TouchableOpacity style={styles.button} onPress={() => setScanning(true)}>
            <Text style={styles.buttonText}>Escanear otro código</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={closeScanner}>
            <Text style={styles.secondaryButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );}
  }
    
  return (
    <View style={styles.container}>
      {/* Use the new Scanner component */}
      <Scanner onScan={handleScan} onError={handleScanError} />
      
      {/* Instructions overlay */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>Escanea un código QR:</Text>
        <Text style={styles.instructionDetail}>• BNF:SER-XXXX para canjear beneficio</Text>
        <Text style={styles.instructionDetail}>• APP:DNI:CODIGO para registrar cliente</Text>
        
        {lastScannedCode && (
          <View style={styles.lastScannedContainer}>
            <Text style={styles.lastScannedTitle}>Último código escaneado:</Text>
            <Text style={styles.lastScannedText}>{lastScannedCode}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    width: '100%',
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  container: {
    flex: 1,
    backgroundColor: '#000',
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
