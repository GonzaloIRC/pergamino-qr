import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Card, Button, IconButton, Divider, Dialog, Portal, TextInput } from 'react-native-paper';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { AuthContext } from '../context/AuthContext';

/**
 * Pantalla de detalle de cliente
 * 
 * - Muestra información detallada del cliente
 * - Historial de puntos
 * - Permite modificar estado (activo/inactivo)
 * - Permite añadir/restar puntos manualmente (solo admin)
 */
const CustomerDetailScreen = ({ route, navigation }) => {
  const { customerId } = route.params;
  const { userRole } = useContext(AuthContext);
  const isAdmin = userRole === 'admin';

  const [customer, setCustomer] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [pointsToAdd, setPointsToAdd] = useState('');
  const [pointsNote, setPointsNote] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomerData();
    fetchPointsHistory();
  }, [customerId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const customerDoc = await getDoc(doc(db, 'clientes', customerId));
      if (customerDoc.exists()) {
        setCustomer({
          id: customerDoc.id,
          ...customerDoc.data()
        });
      } else {
        setError('Cliente no encontrado');
      }
    } catch (err) {
      console.error('Error al obtener datos del cliente:', err);
      setError('Error al cargar los datos del cliente');
    } finally {
      setLoading(false);
    }
  };

  const fetchPointsHistory = async () => {
    setLoadingHistory(true);
    try {
      const historyQuery = query(
        collection(db, 'historialPuntos'),
        where('clienteId', '==', customerId),
        orderBy('fecha', 'desc')
      );
      
      const snapshot = await getDocs(historyQuery);
      setPointsHistory(
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    } catch (err) {
      console.error('Error al obtener historial de puntos:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!customer) return;
    
    const newStatus = customer.estado === 'activo' ? 'inactivo' : 'activo';
    
    try {
      await updateDoc(doc(db, 'clientes', customerId), {
        estado: newStatus
      });
      
      // Actualizar estado local
      setCustomer(prev => ({
        ...prev,
        estado: newStatus
      }));
      
      Alert.alert(
        'Estado actualizado',
        `El cliente ha sido ${newStatus === 'activo' ? 'activado' : 'desactivado'} correctamente.`
      );
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      Alert.alert(
        'Error',
        'No se pudo actualizar el estado del cliente.'
      );
    }
  };

  const handleAddPoints = async () => {
    if (!customer || !pointsToAdd) return;
    
    const points = parseInt(pointsToAdd);
    
    if (isNaN(points)) {
      Alert.alert('Error', 'Por favor ingrese un valor numérico válido');
      return;
    }
    
    try {
      // Actualizar puntos en el perfil del cliente
      const newPoints = (customer.puntos || 0) + points;
      await updateDoc(doc(db, 'clientes', customerId), {
        puntos: newPoints
      });
      
      // Registrar en el historial de puntos
      await addDoc(collection(db, 'historialPuntos'), {
        clienteId: customerId,
        puntos: points,
        tipo: points >= 0 ? 'suma' : 'resta',
        motivo: pointsNote || (points >= 0 ? 'Ajuste manual (suma)' : 'Ajuste manual (resta)'),
        fecha: serverTimestamp(),
        usuario: 'admin' // Idealmente, esto vendría del contexto de autenticación
      });
      
      // Actualizar datos locales
      setCustomer(prev => ({
        ...prev,
        puntos: newPoints
      }));
      
      // Refrescar historial
      fetchPointsHistory();
      
      // Limpiar campos y cerrar diálogo
      setPointsToAdd('');
      setPointsNote('');
      setDialogVisible(false);
      
      Alert.alert(
        'Puntos actualizados',
        `Se han ${points >= 0 ? 'añadido' : 'restado'} ${Math.abs(points)} puntos a la cuenta del cliente.`
      );
    } catch (err) {
      console.error('Error al actualizar puntos:', err);
      Alert.alert(
        'Error',
        'No se pudieron actualizar los puntos del cliente.'
      );
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando datos del cliente...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()} 
          style={styles.errorButton}
        >
          Volver
        </Button>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No se encontró información del cliente</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()} 
          style={styles.errorButton}
        >
          Volver
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24} 
          onPress={() => navigation.goBack()} 
        />
        <Text style={styles.title}>Detalle del Cliente</Text>
        <IconButton 
          icon="refresh" 
          size={24} 
          onPress={() => {
            fetchCustomerData();
            fetchPointsHistory();
          }} 
        />
      </View>
      
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>
              {customer.nombre || ''} {customer.apellido || ''}
            </Text>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: customer.estado === 'activo' ? '#4CAF50' : '#F44336' }
            ]} />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DNI/RUT:</Text>
            <Text style={styles.infoValue}>{customer.dni || 'No especificado'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{customer.email || 'No especificado'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de nacimiento:</Text>
            <Text style={styles.infoValue}>
              {customer.nacimiento || 'No especificada'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de registro:</Text>
            <Text style={styles.infoValue}>
              {customer.fechaRegistro ? new Date(customer.fechaRegistro).toLocaleDateString() : 'No especificada'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={[
              styles.infoValue, 
              { 
                color: customer.estado === 'activo' ? '#4CAF50' : '#F44336',
                fontWeight: 'bold'
              }
            ]}>
              {customer.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
          
          <Card style={styles.pointsCard}>
            <Card.Content>
              <Text style={styles.pointsTitle}>Puntos acumulados</Text>
              <Text style={styles.pointsValue}>{customer.puntos || 0}</Text>
            </Card.Content>
          </Card>
          
          {isAdmin && (
            <View style={styles.adminActions}>
              <Button 
                mode="outlined"
                onPress={() => setDialogVisible(true)}
                style={styles.adminButton}
                icon="pencil"
              >
                Ajustar puntos
              </Button>
              
              <Button 
                mode="outlined"
                onPress={handleToggleStatus}
                style={styles.adminButton}
                icon={customer.estado === 'activo' ? 'close-circle' : 'check-circle'}
                color={customer.estado === 'activo' ? '#F44336' : '#4CAF50'}
              >
                {customer.estado === 'activo' ? 'Desactivar' : 'Activar'}
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Historial de Puntos</Text>
        
        {loadingHistory ? (
          <ActivityIndicator size="small" color="#2196F3" style={styles.smallLoader} />
        ) : pointsHistory.length === 0 ? (
          <Text style={styles.emptyText}>No hay registros de puntos para este cliente</Text>
        ) : (
          pointsHistory.map((record) => (
            <Card key={record.id} style={styles.historyCard}>
              <Card.Content>
                <View style={styles.historyHeader}>
                  <Text style={[
                    styles.pointsChange,
                    { color: record.tipo === 'suma' ? '#4CAF50' : '#F44336' }
                  ]}>
                    {record.tipo === 'suma' ? '+' : '-'}{Math.abs(record.puntos || 0)}
                  </Text>
                  <Text style={styles.historyDate}>
                    {formatDate(record.fecha)}
                  </Text>
                </View>
                
                <Text style={styles.historyReason}>
                  {record.motivo || 'Sin motivo especificado'}
                </Text>
                
                {record.detalles && (
                  <Text style={styles.historyDetails}>
                    {record.detalles}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </View>
      
      {/* Diálogo para ajustar puntos */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Ajustar puntos</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Puntos (usa signo - para restar)"
              value={pointsToAdd}
              onChangeText={setPointsToAdd}
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            
            <TextInput
              label="Motivo (opcional)"
              value={pointsNote}
              onChangeText={setPointsNote}
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancelar</Button>
            <Button onPress={handleAddPoints}>Confirmar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
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
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileCard: {
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: '40%',
    fontSize: 16,
    color: '#757575',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
  },
  pointsCard: {
    marginTop: 16,
    backgroundColor: '#E3F2FD',
  },
  pointsTitle: {
    fontSize: 16,
    color: '#1976D2',
    textAlign: 'center',
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1976D2',
    textAlign: 'center',
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  adminButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  sectionContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  historyCard: {
    marginBottom: 12,
    borderRadius: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsChange: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyDate: {
    fontSize: 14,
    color: '#757575',
  },
  historyReason: {
    fontSize: 16,
    marginTop: 4,
  },
  historyDetails: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
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
    color: '#F44336',
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    padding: 16,
  },
  smallLoader: {
    margin: 16,
  },
  dialogInput: {
    marginBottom: 16,
  },
});

export default CustomerDetailScreen;
