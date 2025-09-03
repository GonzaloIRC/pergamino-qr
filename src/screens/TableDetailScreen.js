import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Button, List, Divider, Chip, IconButton } from 'react-native-paper';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useNavigation, useRoute } from '@react-navigation/native';

/**
 * TableDetailScreen - Pantalla para ver y gestionar detalles de una mesa específica
 * 
 * Características:
 * - Ver información detallada de la mesa
 * - Ver historial de cambios de estado
 * - Ver consumos asociados a la mesa
 * - Cambiar estado de la mesa
 */
const TableDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { tableId } = route.params;
  
  const [table, setTable] = useState(null);
  const [history, setHistory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

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
    fetchTableData();
  }, [tableId]);

  const fetchTableData = async () => {
    setLoading(true);
    try {
      // Obtener datos de la mesa
      const tableSnapshot = await getDoc(doc(db, 'mesas', tableId));
      if (tableSnapshot.exists()) {
        setTable({
          id: tableSnapshot.id,
          ...tableSnapshot.data()
        });
      } else {
        throw new Error('La mesa no existe');
      }
      
      // Obtener historial de cambios de estado
      const historyQuery = query(
        collection(db, 'historialMesas'),
        where('mesaId', '==', tableId),
        orderBy('timestamp', 'desc')
      );
      
      const historySnapshot = await getDocs(historyQuery);
      setHistory(
        historySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
      
      // Obtener órdenes/consumos asociados a la mesa
      const ordersQuery = query(
        collection(db, 'consumos'),
        where('mesaId', '==', tableId),
        orderBy('fecha', 'desc')
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      setOrders(
        ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar datos de la mesa:', err);
      setError('No se pudieron cargar los datos de la mesa.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!table) return;
    
    try {
      const tableRef = doc(db, 'mesas', tableId);
      const previousStatus = table.estado;
      
      // Actualizar estado de la mesa
      await updateDoc(tableRef, {
        estado: newStatus,
        ultimaActualizacion: serverTimestamp()
      });
      
      // Registrar cambio en el historial
      await addDoc(collection(db, 'historialMesas'), {
        mesaId: tableId,
        numeroMesa: table.numero,
        estadoAnterior: previousStatus,
        estadoNuevo: newStatus,
        timestamp: serverTimestamp(),
        usuario: 'usuario_actual' // Idealmente, esto vendría del contexto de autenticación
      });
      
      // Actualizar datos locales
      setTable(prev => ({
        ...prev,
        estado: newStatus,
        ultimaActualizacion: new Date()
      }));
      
      // Refrescar historial
      fetchTableData();
      
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError('No se pudo actualizar el estado de la mesa.');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando datos de la mesa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchTableData} style={styles.retryButton}>
          Reintentar
        </Button>
      </View>
    );
  }

  if (!table) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>La mesa no existe</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()} 
          style={styles.retryButton}
        >
          Volver
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          onPress={() => navigation.goBack()}
          size={24}
        />
        <Text style={styles.title}>Mesa {table.numero}</Text>
        <IconButton 
          icon="refresh" 
          onPress={fetchTableData}
          size={24}
        />
      </View>
      
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <Text style={styles.statusLabel}>Estado actual:</Text>
            <Chip 
              style={[styles.statusChip, { backgroundColor: STATE_COLORS[table.estado] || '#757575' }]}
              textStyle={styles.statusChipText}
            >
              {table.estado.replace('_', ' ')}
            </Chip>
          </View>
          
          <Text style={styles.lastUpdated}>
            Última actualización: {formatTimestamp(table.ultimaActualizacion)}
          </Text>
        </Card.Content>
      </Card>
      
      <View style={styles.tabsContainer}>
        <Button 
          mode={activeTab === 'info' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('info')}
          style={styles.tabButton}
        >
          Información
        </Button>
        <Button 
          mode={activeTab === 'history' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('history')}
          style={styles.tabButton}
        >
          Historial
        </Button>
        <Button 
          mode={activeTab === 'orders' ? 'contained' : 'outlined'}
          onPress={() => setActiveTab('orders')}
          style={styles.tabButton}
        >
          Consumos
        </Button>
      </View>
      
      <ScrollView style={styles.content}>
        {activeTab === 'info' && (
          <View>
            <Card style={styles.infoCard}>
              <Card.Content>
                <List.Item
                  title="Número de mesa"
                  description={table.numero}
                  left={props => <List.Icon {...props} icon="table-chair" />}
                />
                <Divider />
                <List.Item
                  title="Capacidad"
                  description={`${table.capacidad} personas`}
                  left={props => <List.Icon {...props} icon="account-group" />}
                />
                <Divider />
                {table.clienteActual && (
                  <>
                    <List.Item
                      title="Cliente actual"
                      description={table.clienteActual}
                      left={props => <List.Icon {...props} icon="account" />}
                    />
                    <Divider />
                  </>
                )}
                <List.Item
                  title="Fecha de creación"
                  description={formatTimestamp(table.creado)}
                  left={props => <List.Icon {...props} icon="calendar" />}
                />
              </Card.Content>
            </Card>
            
            <Text style={styles.sectionTitle}>Cambiar estado</Text>
            
            <View style={styles.actionButtons}>
              <Button 
                mode="outlined"
                icon="check"
                style={[styles.actionButton, { borderColor: STATE_COLORS[TABLE_STATES.AVAILABLE] }]}
                labelStyle={{ color: STATE_COLORS[TABLE_STATES.AVAILABLE] }}
                onPress={() => handleStatusChange(TABLE_STATES.AVAILABLE)}
                disabled={table.estado === TABLE_STATES.AVAILABLE}
              >
                Disponible
              </Button>
              
              <Button 
                mode="outlined"
                icon="account-multiple"
                style={[styles.actionButton, { borderColor: STATE_COLORS[TABLE_STATES.OCCUPIED] }]}
                labelStyle={{ color: STATE_COLORS[TABLE_STATES.OCCUPIED] }}
                onPress={() => handleStatusChange(TABLE_STATES.OCCUPIED)}
                disabled={table.estado === TABLE_STATES.OCCUPIED}
              >
                Ocupada
              </Button>
              
              <Button 
                mode="outlined"
                icon="bell-ring"
                style={[styles.actionButton, { borderColor: STATE_COLORS[TABLE_STATES.WAITING_SERVICE] }]}
                labelStyle={{ color: STATE_COLORS[TABLE_STATES.WAITING_SERVICE] }}
                onPress={() => handleStatusChange(TABLE_STATES.WAITING_SERVICE)}
                disabled={table.estado === TABLE_STATES.WAITING_SERVICE}
              >
                Servicio
              </Button>
              
              <Button 
                mode="outlined"
                icon="cash-register"
                style={[styles.actionButton, { borderColor: STATE_COLORS[TABLE_STATES.WAITING_BILL] }]}
                labelStyle={{ color: STATE_COLORS[TABLE_STATES.WAITING_BILL] }}
                onPress={() => handleStatusChange(TABLE_STATES.WAITING_BILL)}
                disabled={table.estado === TABLE_STATES.WAITING_BILL}
              >
                Cuenta
              </Button>
              
              <Button 
                mode="outlined"
                icon="calendar-clock"
                style={[styles.actionButton, { borderColor: STATE_COLORS[TABLE_STATES.RESERVED] }]}
                labelStyle={{ color: STATE_COLORS[TABLE_STATES.RESERVED] }}
                onPress={() => handleStatusChange(TABLE_STATES.RESERVED)}
                disabled={table.estado === TABLE_STATES.RESERVED}
              >
                Reservada
              </Button>
              
              <Button 
                mode="outlined"
                icon="broom"
                style={[styles.actionButton, { borderColor: STATE_COLORS[TABLE_STATES.CLEANING] }]}
                labelStyle={{ color: STATE_COLORS[TABLE_STATES.CLEANING] }}
                onPress={() => handleStatusChange(TABLE_STATES.CLEANING)}
                disabled={table.estado === TABLE_STATES.CLEANING}
              >
                Limpieza
              </Button>
            </View>
          </View>
        )}
        
        {activeTab === 'history' && (
          <View>
            <Text style={styles.sectionTitle}>Historial de estados</Text>
            
            {history.length === 0 ? (
              <Text style={styles.emptyText}>No hay registros de cambios de estado</Text>
            ) : (
              history.map(item => (
                <Card key={item.id} style={styles.historyCard}>
                  <Card.Content>
                    <View style={styles.historyItem}>
                      <View style={styles.statusTransition}>
                        <Chip 
                          style={[
                            styles.miniChip, 
                            { backgroundColor: STATE_COLORS[item.estadoAnterior] || '#757575' }
                          ]}
                          textStyle={styles.miniChipText}
                        >
                          {item.estadoAnterior.replace('_', ' ')}
                        </Chip>
                        <Icon name="arrow-right" size={18} style={styles.arrowIcon} />
                        <Chip 
                          style={[
                            styles.miniChip, 
                            { backgroundColor: STATE_COLORS[item.estadoNuevo] || '#757575' }
                          ]}
                          textStyle={styles.miniChipText}
                        >
                          {item.estadoNuevo.replace('_', ' ')}
                        </Chip>
                      </View>
                      <Text style={styles.historyTimestamp}>
                        {formatTimestamp(item.timestamp)}
                      </Text>
                      <Text style={styles.historyUser}>
                        Por: {item.usuario || 'Usuario desconocido'}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </View>
        )}
        
        {activeTab === 'orders' && (
          <View>
            <Text style={styles.sectionTitle}>Consumos registrados</Text>
            
            {orders.length === 0 ? (
              <Text style={styles.emptyText}>No hay consumos registrados para esta mesa</Text>
            ) : (
              orders.map(order => (
                <Card key={order.id} style={styles.orderCard}>
                  <Card.Content>
                    <Text style={styles.orderDate}>
                      {formatTimestamp(order.fecha)}
                    </Text>
                    <Text style={styles.orderTotal}>
                      Total: ${order.total?.toLocaleString() || '0'}
                    </Text>
                    
                    <Divider style={styles.divider} />
                    
                    <Text style={styles.productsTitle}>Productos:</Text>
                    {order.productos?.map((producto, index) => (
                      <Text key={index} style={styles.productItem}>
                        • {producto.cantidad || 1} x {producto.nombre} (${producto.precio?.toLocaleString() || '0'})
                      </Text>
                    ))}
                    
                    <View style={styles.orderFooter}>
                      <Text>Mesero: {order.mesero || 'No registrado'}</Text>
                      <Text>Puntos ganados: {order.puntosGanados || 0}</Text>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Componente auxiliar para el icono
const Icon = ({ name, size, style }) => {
  // Aquí podrías usar un sistema de iconos como react-native-vector-icons
  // Para mantener simple este ejemplo, usaremos un texto
  return (
    <Text style={[{ fontSize: size || 24 }, style]}>→</Text>
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 8,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusCard: {
    margin: 16,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusChip: {
    paddingHorizontal: 8,
  },
  statusChipText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#757575',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    width: '48%',
    marginBottom: 8,
  },
  historyCard: {
    marginBottom: 8,
  },
  historyItem: {
    padding: 4,
  },
  statusTransition: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  miniChip: {
    height: 24,
    paddingHorizontal: 4,
  },
  miniChipText: {
    color: '#ffffff',
    fontSize: 12,
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  historyTimestamp: {
    fontSize: 14,
    color: '#757575',
  },
  historyUser: {
    fontSize: 14,
    color: '#757575',
  },
  orderCard: {
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productItem: {
    fontSize: 14,
    marginBottom: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
    textAlign: 'center',
    marginTop: 16,
  },
});

export default TableDetailScreen;
