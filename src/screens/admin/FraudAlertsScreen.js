import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Chip, Button, Modal, Portal, ActivityIndicator } from 'react-native-paper';
import { db } from '../../services/firebaseClient';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function FraudAlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const alertsQuery = query(
        collection(db, 'ActividadSospechosa'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(alertsQuery);
      const alertsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));

      setAlerts(alertsList);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const showModal = (alert) => {
    setSelectedAlert(alert);
    setVisible(true);
  };

  const hideModal = () => {
    setVisible(false);
    setSelectedAlert(null);
  };

  const renderAlertTypeChip = (type) => {
    let color;
    switch(type) {
      case 'rate_limit':
        color = '#f44336'; // rojo
        break;
      case 'geo_anomaly':
        color = '#ff9800'; // naranja
        break;
      case 'out_of_hours':
        color = '#2196f3'; // azul
        break;
      case 'multiple_devices':
        color = '#9c27b0'; // morado
        break;
      default:
        color = '#757575'; // gris
    }

    return (
      <Chip 
        mode="outlined" 
        style={[styles.chip, { borderColor: color }]} 
        textStyle={{ color }}
      >
        {type}
      </Chip>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => showModal(item)}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title numberOfLines={1} style={styles.title}>
              Usuario: {item.userId?.substring(0, 8) || 'Desconocido'}
            </Title>
            {renderAlertTypeChip(item.type)}
          </View>
          <Paragraph numberOfLines={2}>{item.details}</Paragraph>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleString()}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Cargando alertas de fraude...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alertas de Actividad Sospechosa</Text>
        <Button 
          mode="contained" 
          onPress={loadAlerts}
          icon="refresh"
          style={styles.refreshButton}
        >
          Actualizar
        </Button>
      </View>

      {alerts.length > 0 ? (
        <FlatList
          data={alerts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay alertas de fraude</Text>
        </View>
      )}

      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={styles.modalContent}
        >
          {selectedAlert && (
            <>
              <Title style={styles.modalTitle}>Detalles de Alerta</Title>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Tipo:</Text>
                <Text style={styles.modalValue}>{selectedAlert.type}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Usuario:</Text>
                <Text style={styles.modalValue}>{selectedAlert.userId}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Fecha:</Text>
                <Text style={styles.modalValue}>
                  {selectedAlert.timestamp.toLocaleString()}
                </Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Detalles:</Text>
                <Text style={styles.modalValue}>{selectedAlert.details}</Text>
              </View>

              {selectedAlert.transaction && (
                <>
                  <Title style={styles.sectionTitle}>Datos de Transacción</Title>
                  <View style={styles.transactionContainer}>
                    <Text>
                      <Text style={styles.bold}>Tipo: </Text>
                      {selectedAlert.transaction.type}
                    </Text>
                    {selectedAlert.transaction.payload && (
                      <Text>
                        <Text style={styles.bold}>Payload: </Text>
                        {JSON.stringify(selectedAlert.transaction.payload)}
                      </Text>
                    )}
                    {selectedAlert.transaction.location && (
                      <Text>
                        <Text style={styles.bold}>Ubicación: </Text>
                        Lat: {selectedAlert.transaction.location.latitude.toFixed(6)}, 
                        Lng: {selectedAlert.transaction.location.longitude.toFixed(6)}
                      </Text>
                    )}
                  </View>
                </>
              )}

              <Button 
                mode="contained"
                onPress={hideModal}
                style={styles.modalButton}
              >
                Cerrar
              </Button>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButton: {
    height: 40,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    flex: 1,
  },
  chip: {
    height: 28,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
  },
  modalRow: {
    marginBottom: 12,
  },
  modalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 14,
  },
  modalButton: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  transactionContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  bold: {
    fontWeight: 'bold',
  }
});
