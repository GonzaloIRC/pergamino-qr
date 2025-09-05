import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, Dialog, Portal, Provider, ActivityIndicator, Divider } from 'react-native-paper';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebaseClient';
import { AuthContext } from '../context/AuthContext';

export default function TableDetailScreen({ route, navigation }) {
  const { tableId } = route.params;
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionDialogVisible, setActionDialogVisible] = useState(false);
  const [actionType, setActionType] = useState(null); // 'occupy', 'free', 'reserve', 'clean'
  const { user, userRole } = useContext(AuthContext);

  // Cargar los detalles de la mesa
  useEffect(() => {
    loadTableDetails();
  }, [tableId]);

  const loadTableDetails = async () => {
    try {
      setLoading(true);
      const tableRef = doc(db, 'tables', tableId);
      const tableDoc = await getDoc(tableRef);
      
      if (tableDoc.exists()) {
        setTable({ id: tableDoc.id, ...tableDoc.data() });
      } else {
        Alert.alert('Error', 'Mesa no encontrada');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error al cargar detalles de la mesa:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles de la mesa');
    } finally {
      setLoading(false);
    }
  };

  // Iniciar diálogo para cambiar el estado de la mesa
  const showActionDialog = (action) => {
    setActionType(action);
    setActionDialogVisible(true);
  };

  // Cambiar el estado de la mesa
  const updateTableStatus = async () => {
    if (!table || !actionType) return;

    try {
      const tableRef = doc(db, 'tables', tableId);
      const updateData = { lastUpdated: new Date().toISOString() };
      
      // Diferentes acciones según el tipo de acción
      switch (actionType) {
        case 'occupy':
          updateData.status = 'occupied';
          updateData.occupiedAt = new Date().toISOString();
          updateData.occupiedBy = user.uid;
          break;
        case 'free':
          updateData.status = 'available';
          // Registrar el historial de uso de la mesa
          if (table.status === 'occupied' && table.occupiedAt) {
            const startTime = new Date(table.occupiedAt);
            const endTime = new Date();
            const durationMs = endTime - startTime;
            const durationMinutes = Math.floor(durationMs / 60000);
            
            await addDoc(collection(db, 'tableHistory'), {
              tableId: table.id,
              tableNumber: table.number,
              startTime: table.occupiedAt,
              endTime: endTime.toISOString(),
              duration: durationMinutes,
              waiterId: table.occupiedBy || 'unknown',
              createdAt: new Date().toISOString()
            });
          }
          delete updateData.occupiedAt;
          delete updateData.occupiedBy;
          break;
        case 'reserve':
          updateData.status = 'reserved';
          updateData.reservedAt = new Date().toISOString();
          break;
        case 'clean':
          updateData.status = 'cleaning';
          break;
        default:
          return;
      }
      
      await updateDoc(tableRef, updateData);
      setActionDialogVisible(false);
      loadTableDetails(); // Recargar los detalles actualizados
    } catch (error) {
      console.error('Error al actualizar el estado de la mesa:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado de la mesa');
    }
  };

  // Calcular el tiempo ocupada si la mesa está ocupada
  const calculateOccupiedTime = () => {
    if (!table || !table.occupiedAt || table.status !== 'occupied') return '';
    
    const start = new Date(table.occupiedAt);
    const now = new Date();
    const diffMs = now - start;
    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Determinar qué acciones están disponibles según el estado actual
  const getAvailableActions = () => {
    if (!table) return [];
    
    const actions = [];
    switch (table.status) {
      case 'available':
        actions.push(
          { label: 'Ocupar Mesa', icon: 'account-multiple', action: 'occupy' },
          { label: 'Reservar Mesa', icon: 'calendar-clock', action: 'reserve' }
        );
        break;
      case 'occupied':
        actions.push(
          { label: 'Liberar Mesa', icon: 'check', action: 'free' }
        );
        break;
      case 'reserved':
        actions.push(
          { label: 'Ocupar Mesa', icon: 'account-multiple', action: 'occupy' },
          { label: 'Liberar Reserva', icon: 'calendar-remove', action: 'free' }
        );
        break;
      case 'cleaning':
        actions.push(
          { label: 'Marcar como Disponible', icon: 'check', action: 'free' }
        );
        break;
    }
    
    return actions;
  };

  // Obtener el color según el estado
  const getStatusColor = () => {
    if (!table) return '#9E9E9E';
    
    switch(table.status) {
      case 'occupied': return '#F44336'; // Rojo
      case 'available': return '#4CAF50'; // Verde
      case 'reserved': return '#FFC107'; // Amarillo
      case 'cleaning': return '#2196F3'; // Azul
      default: return '#9E9E9E'; // Gris
    }
  };

  // Obtener el texto del estado
  const getStatusText = () => {
    if (!table) return 'Desconocido';
    
    switch(table.status) {
      case 'occupied': return 'Ocupada';
      case 'available': return 'Disponible';
      case 'reserved': return 'Reservada';
      case 'cleaning': return 'En Limpieza';
      default: return 'Desconocido';
    }
  };

  const actions = getAvailableActions();

  return (
    <Provider>
      <ScrollView style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Cargando detalles...</Text>
          </View>
        ) : table ? (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.title}>Mesa {table.number}</Title>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Estado: </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                    <Text style={styles.statusText}>{getStatusText()}</Text>
                  </View>
                </View>

                <Divider style={styles.divider} />
                
                <View style={styles.infoSection}>
                  <Paragraph style={styles.infoLabel}>Capacidad:</Paragraph>
                  <Paragraph style={styles.infoValue}>{table.capacity} personas</Paragraph>
                </View>
                
                {table.status === 'occupied' && (
                  <>
                    <View style={styles.infoSection}>
                      <Paragraph style={styles.infoLabel}>Tiempo ocupada:</Paragraph>
                      <Paragraph style={styles.infoValue}>{calculateOccupiedTime()}</Paragraph>
                    </View>
                    <View style={styles.infoSection}>
                      <Paragraph style={styles.infoLabel}>Ocupada desde:</Paragraph>
                      <Paragraph style={styles.infoValue}>
                        {new Date(table.occupiedAt).toLocaleString()}
                      </Paragraph>
                    </View>
                  </>
                )}
                
                {table.status === 'reserved' && (
                  <View style={styles.infoSection}>
                    <Paragraph style={styles.infoLabel}>Reservada desde:</Paragraph>
                    <Paragraph style={styles.infoValue}>
                      {new Date(table.reservedAt).toLocaleString()}
                    </Paragraph>
                  </View>
                )}
              </Card.Content>
            </Card>

            <View style={styles.actionsContainer}>
              <Text style={styles.sectionTitle}>Acciones disponibles:</Text>
              
              {actions.length > 0 ? (
                actions.map((action, index) => (
                  <Button
                    key={index}
                    mode="contained"
                    icon={action.icon}
                    onPress={() => showActionDialog(action.action)}
                    style={styles.actionButton}
                  >
                    {action.label}
                  </Button>
                ))
              ) : (
                <Text style={styles.noActionsText}>No hay acciones disponibles</Text>
              )}
            </View>
          </>
        ) : (
          <Text style={styles.errorText}>No se encontró la mesa</Text>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={actionDialogVisible} onDismiss={() => setActionDialogVisible(false)}>
          <Dialog.Title>Confirmar acción</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              {actionType === 'occupy' && '¿Está seguro que desea marcar esta mesa como ocupada?'}
              {actionType === 'free' && '¿Está seguro que desea liberar esta mesa?'}
              {actionType === 'reserve' && '¿Está seguro que desea reservar esta mesa?'}
              {actionType === 'clean' && '¿Está seguro que desea marcar esta mesa para limpieza?'}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setActionDialogVisible(false)}>Cancelar</Button>
            <Button onPress={updateTableStatus}>Confirmar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 50,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
  },
  actionsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  noActionsText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 16,
  },
});
