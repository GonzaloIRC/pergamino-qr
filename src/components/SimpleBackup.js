// src/components/SimpleBackup.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { db } from '../services/firebaseClient';
import { collection, getDocs } from 'firebase/firestore';

const SimpleBackup = () => {
  const [loading, setLoading] = useState(false);

  const crearBackupSimple = async () => {
    setLoading(true);
    try {
      // Solo respaldar clientes para simplicidad
      const clientesSnapshot = await getDocs(collection(db, 'clientes'));
      const clientes = clientesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const backupData = {
        fecha: new Date().toLocaleDateString(),
        clientes: clientes,
        total: clientes.length
      };

      const backupText = `Backup Pergamino App - ${backupData.fecha}\n\nTotal de clientes: ${backupData.total}\n\nDatos:\n${JSON.stringify(backupData, null, 2)}`;

      await Share.share({
        message: backupText,
        title: 'Backup Pergamino App'
      });

      Alert.alert('Backup Creado', `Se respaldaron ${clientes.length} clientes exitosamente.`);

    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el backup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backup Simple</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Creando backup...</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={crearBackupSimple}>
          <Text style={styles.buttonText}>Crear Backup de Clientes</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#8B4513',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});

export default SimpleBackup;
