import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, ActivityIndicator, FAB } from 'react-native-paper';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseClient';
import TrackingTable from '../components/TrackingTable'; // Importando el componente placeholder
import { AuthContext } from '../context/AuthContext';

export default function TableManagementScreen({ navigation }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userRole } = useContext(AuthContext);
  
  // Cargar las mesas cuando el componente se monta
  useEffect(() => {
    loadTables();
    
    // Actualizar las mesas cuando la pantalla obtiene el foco
    const unsubscribe = navigation.addListener('focus', () => {
      loadTables();
    });

    return unsubscribe;
  }, [navigation]);

  // Función para cargar las mesas desde Firestore
  const loadTables = async () => {
    setLoading(true);
    try {
      const tablesCollection = collection(db, 'tables');
      const snapshot = await getDocs(tablesCollection);
      const tableList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar las mesas por número
      tableList.sort((a, b) => a.number - b.number);
      setTables(tableList);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      Alert.alert('Error', 'No se pudieron cargar las mesas');
    } finally {
      setLoading(false);
    }
  };

  // Manejar el tap en una mesa
  const handleTablePress = (table) => {
    navigation.navigate('TableDetail', { tableId: table.id });
  };

  // Ir a la pantalla de configuración de mesas (solo para administradores)
  const goToTableSetup = () => {
    navigation.navigate('TrackingTableSetup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Administración de Mesas</Text>
        <Button 
          mode="contained" 
          onPress={loadTables} 
          icon="refresh"
        >
          Actualizar
        </Button>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Cargando mesas...</Text>
        </View>
      ) : tables.length > 0 ? (
        <TrackingTable 
          tables={tables} 
          onTablePress={handleTablePress}
          role={userRole}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay mesas configuradas</Text>
          {userRole === 'admin' && (
            <Button 
              mode="contained" 
              onPress={goToTableSetup}
              style={styles.setupButton}
            >
              Configurar Mesas
            </Button>
          )}
        </View>
      )}

      {userRole === 'admin' && (
        <FAB
          style={styles.fab}
          icon="cog"
          onPress={goToTableSetup}
          label="Configurar"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    color: '#757575',
  },
  setupButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
