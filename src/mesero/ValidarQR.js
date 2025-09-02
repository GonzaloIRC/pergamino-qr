// src/mesero/ValidarQR.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { db } from '../services/firebaseClient';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';

const ValidarQR = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [clientesEnMesa, setClientesEnMesa] = useState([]);
  const [mesaActual, setMesaActual] = useState(null);

  const buscarClientesEnMesa = async (numeroMesa) => {
    try {
      const q = query(
        collection(db, 'clientes'),
        where('mesa', '==', numeroMesa),
        where('estado', '==', 'activo')
      );
      
      const querySnapshot = await getDocs(q);
      const clientes = [];
      
      querySnapshot.forEach((doc) => {
        clientes.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return clientes;
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      return [];
    }
  };

  const buscarClientePorId = async (clienteId) => {
    try {
      const clienteRef = doc(db, 'clientes', clienteId);
      const clienteSnap = await getDoc(clienteRef);
      
      if (clienteSnap.exists()) {
        return {
          id: clienteSnap.id,
          ...clienteSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      return null;
    }
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    
    try {
      const qrData = JSON.parse(data);
      
      // Verificar si es un QR de cliente personal
      if (qrData.clienteId && qrData.dni && qrData.restaurante === 'Pergamino' && qrData.tipo === 'cliente') {
        const cliente = await buscarClientePorId(qrData.clienteId);
        
        if (cliente && cliente.dni === qrData.dni) {
          // Actualizar última visita del cliente
          await updateDoc(doc(db, 'clientes', cliente.id), {
            ultimaVisita: new Date().toISOString(),
            totalVisitas: (cliente.totalVisitas || 0) + 1
          });

          // Registrar movimiento de tipo 'visita'
          const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
          const movimientosRef = collection(db, 'clientes', cliente.id, 'movimientos');
          await addDoc(movimientosRef, {
            tipo: 'visita',
            descripcion: 'Cliente ingresó al local',
            fecha: serverTimestamp(),
          });

          Alert.alert(
            'Cliente Identificado',
            `¡Hola ${cliente.nombre}!\nPuntos actuales: ${cliente.puntos || 0}`,
            [
              {
                text: 'Registrar Consumo',
                onPress: () => navigation.navigate('RegistrarConsumo', { 
                  cliente: cliente,
                  clienteId: cliente.id
                })
              },
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => setScanned(false)
              }
            ]
          );
        } else {
          Alert.alert('Error', 'Cliente no encontrado o QR inválido');
          setScanned(false);
        }
      } 
      // Mantener compatibilidad con QR de mesa (legacy)
      else if (qrData.mesa && qrData.restaurante === 'Pergamino') {
        const clientes = await buscarClientesEnMesa(qrData.mesa);
        
        if (clientes.length > 0) {
          setMesaActual(qrData.mesa);
          setClientesEnMesa(clientes);
        } else {
          Alert.alert(
            'Mesa Sin Clientes',
            `No se encontraron clientes registrados en la mesa ${qrData.mesa}`,
            [{ text: 'OK', onPress: () => setScanned(false) }]
          );
        }
      } else {
        Alert.alert('Error', 'QR no válido para Pergamino');
        setScanned(false);
      }
    } catch (error) {
      Alert.alert('Error', 'QR no válido');
      setScanned(false);
    }
  };

  const seleccionarCliente = (cliente) => {
    Alert.alert(
      'Cliente Seleccionado',
      `¿Registrar consumo para ${cliente.nombre}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Continuar',
          onPress: () => navigation.navigate('RegistrarConsumo', { 
            cliente: cliente,
            mesa: mesaActual 
          })
        }
      ]
    );
  };

  const renderCliente = ({ item }) => (
    <TouchableOpacity
      style={styles.clienteCard}
      onPress={() => seleccionarCliente(item)}
    >
      <Text style={styles.clienteNombre}>{item.nombre}</Text>
      <Text style={styles.clienteTelefono}>{item.telefono}</Text>
      <Text style={styles.clientePuntos}>Puntos: {item.puntos || 0}</Text>
    </TouchableOpacity>
  );

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Sin acceso a la cámara</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Permitir Cámara</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (clientesEnMesa.length > 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Clientes en Mesa {mesaActual}</Text>
        <FlatList
          data={clientesEnMesa}
          renderItem={renderCliente}
          keyExtractor={(item) => item.id}
          style={styles.clientesList}
        />
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => {
            setClientesEnMesa([]);
            setMesaActual(null);
            setScanned(false);
          }}
        >
          <Text style={styles.buttonText}>Escanear Otra Mesa</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escanear QR del Cliente</Text>
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.scanner}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
          </View>
        </CameraView>
      </View>
      
      {scanned && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setScanned(false)}
        >
          <Text style={styles.buttonText}>Escanear de Nuevo</Text>
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        style={[styles.button, styles.backButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Volver al Inicio</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scannerContainer: {
    width: 300,
    height: 300,
    marginBottom: 30,
    position: 'relative',
  },
  scanner: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#00ff00',
    backgroundColor: 'transparent',
  },
  clientesList: {
    flex: 1,
    width: '100%',
  },
  clienteCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  clienteNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clienteTelefono: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  clientePuntos: {
    fontSize: 14,
    color: '#8B4513',
    marginTop: 2,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    minWidth: 200,
  },
  backButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ValidarQR;
