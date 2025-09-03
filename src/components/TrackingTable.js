import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Badge, Button, IconButton } from 'react-native-paper';
import { collection, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

/**
 * TrackingTable - Componente para monitorear el estado de las mesas
 * 
 * Propiedades:
 * - onTableSelect: función a llamar cuando se selecciona una mesa
 */
const TrackingTable = ({ onTableSelect, refreshTrigger }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados posibles para una mesa
  const TABLE_STATES = {
    AVAILABLE: 'disponible',
    OCCUPIED: 'ocupada',
    WAITING_SERVICE: 'esperando_servicio',
    WAITING_BILL: 'esperando_cuenta',
    RESERVED: 'reservada',
    CLEANING: 'limpieza'
  };

  // Colores para los estados
  const STATE_COLORS = {
    [TABLE_STATES.AVAILABLE]: '#4CAF50', // Verde
    [TABLE_STATES.OCCUPIED]: '#2196F3',  // Azul
    [TABLE_STATES.WAITING_SERVICE]: '#FF9800', // Naranja
    [TABLE_STATES.WAITING_BILL]: '#FFC107', // Amarillo
    [TABLE_STATES.RESERVED]: '#9C27B0',  // Morado
    [TABLE_STATES.CLEANING]: '#607D8B'   // Gris azulado
  };

  useEffect(() => {
    fetchTables();
  }, [refreshTrigger]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const tablesQuery = query(
        collection(db, 'mesas'),
        orderBy('numero', 'asc')
      );
      
      const snapshot = await getDocs(tablesQuery);
      const tablesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTables(tablesList);
      setError(null);
    } catch (err) {
      console.error('Error al obtener las mesas:', err);
      setError('No se pudieron cargar las mesas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTableStatusChange = async (tableId, newStatus) => {
    try {
      await updateDoc(doc(db, 'mesas', tableId), {
        estado: newStatus,
        ultimaActualizacion: new Date()
      });
      
      // Actualizar estado local para reflejar el cambio sin tener que recargar
      setTables(prevTables => 
        prevTables.map(table => 
          table.id === tableId 
            ? {...table, estado: newStatus, ultimaActualizacion: new Date()} 
            : table
        )
      );
    } catch (err) {
      console.error('Error al actualizar el estado de la mesa:', err);
      setError('No se pudo actualizar el estado de la mesa.');
    }
  };

  const formatTimeSince = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const now = new Date();
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'justo ahora';
    if (diffMins < 60) return `${diffMins} min`;
    
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} h ${diffMins % 60} min`;
    
    return date.toLocaleDateString();
  };

  // Renderizado de cada elemento de mesa
  const renderTableItem = ({ item }) => {
    const statusColor = STATE_COLORS[item.estado] || '#757575';
    
    return (
      <Card 
        style={styles.tableCard}
        onPress={() => onTableSelect && onTableSelect(item)}
      >
        <Card.Content>
          <View style={styles.tableHeader}>
            <Text style={styles.tableNumber}>Mesa {item.numero}</Text>
            <Badge 
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              {item.estado.replace('_', ' ')}
            </Badge>
          </View>
          
          <View style={styles.tableInfo}>
            <Text>Capacidad: {item.capacidad} personas</Text>
            {item.clienteActual && (
              <Text>Cliente: {item.clienteActual}</Text>
            )}
            <Text>
              Actualizado: {formatTimeSince(item.ultimaActualizacion)}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            {item.estado !== TABLE_STATES.AVAILABLE && (
              <Button 
                mode="text"
                compact
                onPress={() => handleTableStatusChange(item.id, TABLE_STATES.AVAILABLE)}
              >
                Disponible
              </Button>
            )}
            
            {item.estado !== TABLE_STATES.OCCUPIED && (
              <Button 
                mode="text"
                compact
                onPress={() => handleTableStatusChange(item.id, TABLE_STATES.OCCUPIED)}
              >
                Ocupar
              </Button>
            )}
            
            {item.estado !== TABLE_STATES.WAITING_SERVICE && (
              <Button 
                mode="text"
                compact
                onPress={() => handleTableStatusChange(item.id, TABLE_STATES.WAITING_SERVICE)}
              >
                Llamar
              </Button>
            )}
            
            {item.estado !== TABLE_STATES.WAITING_BILL && (
              <Button 
                mode="text"
                compact
                onPress={() => handleTableStatusChange(item.id, TABLE_STATES.WAITING_BILL)}
              >
                Cuenta
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando mesas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchTables} style={styles.retryButton}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Control de Mesas</Text>
        <IconButton 
          icon="refresh" 
          onPress={fetchTables}
          size={24}
        />
      </View>
      
      {tables.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No hay mesas registradas</Text>
        </View>
      ) : (
        <FlatList
          data={tables}
          renderItem={renderTableItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  tableCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    color: 'white',
  },
  tableInfo: {
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
  },
});

export default TrackingTable;
