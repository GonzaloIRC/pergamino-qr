import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Card, Button, Title, Divider } from 'react-native-paper';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseClient';

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const [customerData, setCustomerData] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchCustomerData();
      fetchPointsHistory();
    }
  }, [user]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'clientes', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setCustomerData(docSnap.data());
      }
    } catch (error) {
      console.error('Error al obtener datos del cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPointsHistory = async () => {
    setLoadingHistory(true);
    try {
      const historyQuery = query(
        collection(db, 'historialPuntos'),
        where('clienteId', '==', user.uid),
        orderBy('fecha', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(historyQuery);
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPointsHistory(history);
    } catch (error) {
      console.error('Error al obtener historial de puntos:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {customerData?.nombre?.charAt(0) || ''}
              {customerData?.apellido?.charAt(0) || ''}
            </Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>
              {customerData?.nombre || ''} {customerData?.apellido || ''}
            </Text>
            <Text style={styles.emailText}>
              {customerData?.email || ''}
            </Text>
          </View>
        </View>
      </View>

      <Card style={styles.pointsCard}>
        <Card.Content>
          <Title style={styles.pointsTitle}>Mis Puntos</Title>
          <Text style={styles.pointsValue}>{customerData?.puntos || 0}</Text>
        </Card.Content>
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DNI/RUT:</Text>
              <Text style={styles.infoValue}>{customerData?.dni || 'No especificado'}</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{customerData?.email || 'No especificado'}</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de nacimiento:</Text>
              <Text style={styles.infoValue}>{customerData?.nacimiento || 'No especificada'}</Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de registro:</Text>
              <Text style={styles.infoValue}>
                {customerData?.fechaRegistro ? new Date(customerData.fechaRegistro).toLocaleDateString() : 'No especificada'}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial de Puntos</Text>
        {loadingHistory ? (
          <ActivityIndicator size="small" color="#2196F3" style={styles.smallLoader} />
        ) : pointsHistory.length > 0 ? (
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
              </Card.Content>
            </Card>
          ))
        ) : (
          <Text style={styles.emptyText}>No hay registros de puntos</Text>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Programa de Referidos</Text>
        <Card style={styles.referralsCard}>
          <Card.Content>
            <Text style={styles.referralText}>
              Invita a tus amigos y gana puntos por cada nuevo cliente que se registre con tu código
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button 
              mode="contained" 
              style={styles.referralButton}
              onPress={() => navigation.navigate('Referrals')}
            >
              Ver mis referidos
            </Button>
          </Card.Actions>
        </Card>
      </View>
      
      <Button 
        mode="contained" 
        onPress={fetchCustomerData}
        style={styles.refreshButton}
      >
        Actualizar datos
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  nameContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  pointsCard: {
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  pointsTitle: {
    textAlign: 'center',
    color: '#2196F3',
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 10,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoCard: {
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  infoLabel: {
    flex: 1,
    fontWeight: '500',
    color: '#757575',
  },
  infoValue: {
    flex: 2,
  },
  divider: {
    backgroundColor: '#e0e0e0',
  },
  historyCard: {
    marginBottom: 10,
    borderRadius: 10,
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
    marginTop: 5,
    fontSize: 14,
  },
  smallLoader: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    padding: 20,
  },
  refreshButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
  },
  referralsCard: {
    borderRadius: 10,
    marginBottom: 15,
  },
  referralText: {
    fontSize: 16,
    lineHeight: 24,
  },
  referralButton: {
    borderRadius: 20,
    marginTop: 10,
  }
});
