import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebaseClient';

export default function AdminDashboard() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalClientes: 0,
    clientesActivos: 0,
    totalPuntos: 0,
    ultimosRegistros: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Obtener todos los clientes
      const clientesQuery = query(collection(db, 'clientes'));
      const clientesSnapshot = await getDocs(clientesQuery);
      const clientes = clientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calcular estadísticas
      const clientesActivos = clientes.filter(c => c.estado === 'activo').length;
      const totalPuntos = clientes.reduce((sum, c) => sum + (c.puntos || 0), 0);
      
      // Obtener últimos registros
      const ultimosClientesQuery = query(
        collection(db, 'clientes'), 
        orderBy('fechaRegistro', 'desc'), 
        limit(5)
      );
      const ultimosClientesSnapshot = await getDocs(ultimosClientesQuery);
      const ultimosClientes = ultimosClientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setStats({
        totalClientes: clientes.length,
        clientesActivos,
        totalPuntos,
        ultimosRegistros: ultimosClientes
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'Clientes',
      description: 'Gestionar clientes registrados y sus puntos',
      icon: 'account-group',
      navigateTo: 'CustomerList',
    },
    {
      title: 'Campañas',
      description: 'Crear y administrar campañas de fidelización de clientes',
      icon: 'bullhorn',
      navigateTo: 'Campaigns',
    },
    {
      title: 'Reportes',
      description: 'Estadísticas y reportes de consumo',
      icon: 'chart-bar',
      navigateTo: 'Reports',
    },
    {
      title: 'Configuración',
      description: 'Ajustes generales de la aplicación',
      icon: 'cog',
      navigateTo: 'Settings',
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Panel de Administración</Text>
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loaderText}>Cargando estadísticas...</Text>
        </View>
      ) : (
        <View style={styles.statsContainer}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title>Resumen de Clientes</Title>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalClientes}</Text>
                  <Text style={styles.statLabel}>Total clientes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.clientesActivos}</Text>
                  <Text style={styles.statLabel}>Activos</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalClientes - stats.clientesActivos}</Text>
                  <Text style={styles.statLabel}>Inactivos</Text>
                </View>
              </View>
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('CustomerList')}
              >
                Ver todos
              </Button>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('Register')}
              >
                Nuevo cliente
              </Button>
            </Card.Actions>
          </Card>
          
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title>Puntos en circulación</Title>
              <Text style={styles.pointsValue}>{stats.totalPuntos.toLocaleString()}</Text>
            </Card.Content>
          </Card>
          
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title>Últimos clientes registrados</Title>
              {stats.ultimosRegistros.length > 0 ? (
                stats.ultimosRegistros.map((cliente, index) => (
                  <View key={cliente.id} style={styles.clienteItem}>
                    <Text style={styles.clienteNombre}>
                      {cliente.nombre || ''} {cliente.apellido || ''}
                    </Text>
                    <Text style={styles.clienteFecha}>
                      {new Date(cliente.fechaRegistro).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No hay registros recientes</Text>
              )}
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('CustomerList')}
              >
                Ver todos
              </Button>
            </Card.Actions>
          </Card>
        </View>
      )}
      
      <Text style={styles.menuHeader}>Menú de Administración</Text>
      
      {menuItems.map((item, index) => (
        <Card 
          key={index} 
          style={styles.card}
          onPress={() => navigation.navigate(item.navigateTo)}
        >
          <Card.Content>
            <Title>{item.title}</Title>
            <Paragraph>{item.description}</Paragraph>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
  },
  clienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  clienteNombre: {
    fontSize: 16,
  },
  clienteFecha: {
    fontSize: 14,
    color: '#757575',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
  },
  menuHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  cardActions: {
    justifyContent: 'flex-end',
  }
});
