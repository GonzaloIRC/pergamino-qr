import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function AdminDashboard() {
  const navigation = useNavigation();

  const menuItems = [
    {
      title: 'Gestión de Mesas',
      description: 'Visualizar y gestionar el estado de todas las mesas del restaurante',
      icon: 'table-chair',
      navigateTo: 'TableManagement',
    },
    {
      title: 'Configuración TrackingTable',
      description: 'Inicializar y configurar el sistema de seguimiento de mesas',
      icon: 'cog-outline',
      navigateTo: 'TrackingTableSetup',
    },
    {
      title: 'Campañas',
      description: 'Crear y administrar campañas de fidelización de clientes',
      icon: 'bullhorn',
      navigateTo: 'Campaigns',
    },
    {
      title: 'Clientes',
      description: 'Base de datos de clientes registrados',
      icon: 'account-group',
      navigateTo: 'Customers',
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
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
});
