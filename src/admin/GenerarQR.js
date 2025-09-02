// src/admin/GenerarQR.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const GenerarQR = ({ navigation }) => {
  const [numeroMesa, setNumeroMesa] = useState('');
  const [qrGenerado, setQrGenerado] = useState(null);

  const generarQR = () => {
    if (!numeroMesa.trim()) {
      Alert.alert('Error', 'Ingresa el número de mesa');
      return;
    }

    const qrData = {
      restaurante: 'Pergamino',
      mesa: numeroMesa,
      fechaCreacion: new Date().toISOString()
    };

    setQrGenerado(JSON.stringify(qrData));
  };

  const limpiarQR = () => {
    setQrGenerado(null);
    setNumeroMesa('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Generar QR de Mesa</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Número de Mesa</Text>
        <TextInput
          style={styles.input}
          value={numeroMesa}
          onChangeText={setNumeroMesa}
          placeholder="Ej: 1, 2, 3..."
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.generateButton}
          onPress={generarQR}
        >
          <Text style={styles.buttonText}>Generar QR</Text>
        </TouchableOpacity>

        {qrGenerado && (
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>QR Mesa {numeroMesa}</Text>
            <View style={styles.qrWrapper}>
              <QRCode
                value={qrGenerado}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </View>
            <Text style={styles.instructions}>
              Los clientes deben escanear este código para registrarse en la mesa {numeroMesa}
            </Text>
            
            <TouchableOpacity
              style={styles.clearButton}
              onPress={limpiarQR}
            >
              <Text style={styles.buttonText}>Generar Otro QR</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#8B4513',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    backgroundColor: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructions: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  clearButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: '#666',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GenerarQR;
