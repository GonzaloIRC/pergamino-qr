import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Dialog, Portal, TextInput, IconButton } from 'react-native-paper';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import TrackingTable from '../components/TrackingTable';

/**
 * TableManagementScreen - Pantalla para la gestión de mesas
 * 
 * Características:
 * - Ver todas las mesas y sus estados actuales
 * - Añadir nuevas mesas
 * - Actualizar estado de las mesas
 * - Ver detalles de una mesa
 */
const TableManagementScreen = ({ navigation }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newTable, setNewTable] = useState({
    numero: '',
    capacidad: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddTable = async () => {
    if (!newTable.numero || !newTable.capacidad) {
      setError('Por favor, complete todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'mesas'), {
        numero: parseInt(newTable.numero, 10),
        capacidad: parseInt(newTable.capacidad, 10),
        estado: 'disponible',
        ultimaActualizacion: serverTimestamp(),
        creado: serverTimestamp()
      });
      
      // Limpiar formulario y cerrar diálogo
      setNewTable({ numero: '', capacidad: '' });
      setDialogVisible(false);
      setError(null);
      
      // Refrescar la lista de mesas
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error al añadir mesa:', err);
      setError('No se pudo añadir la mesa. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (table) => {
    navigation.navigate('TableDetail', { tableId: table.id });
  };

  return (
    <View style={styles.container}>
      <TrackingTable 
        onTableSelect={handleTableSelect}
        refreshTrigger={refreshTrigger}
      />
      
      <Button 
        mode="contained"
        icon="plus"
        style={styles.fabButton}
        onPress={() => setDialogVisible(true)}
      >
        Nueva Mesa
      </Button>
      
      {/* Diálogo para añadir nueva mesa */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>Añadir Nueva Mesa</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Número de Mesa *"
              value={newTable.numero}
              onChangeText={(text) => setNewTable(prev => ({ ...prev, numero: text }))}
              keyboardType="number-pad"
              style={styles.input}
            />
            
            <TextInput
              label="Capacidad (personas) *"
              value={newTable.capacidad}
              onChangeText={(text) => setNewTable(prev => ({ ...prev, capacidad: text }))}
              keyboardType="number-pad"
              style={styles.input}
            />
            
            {error && <Text style={styles.errorText}>{error}</Text>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button 
              onPress={handleAddTable} 
              loading={loading}
              disabled={loading}
            >
              Añadir
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  fabButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 28,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#f44336',
    marginTop: 8,
  },
});

export default TableManagementScreen;
