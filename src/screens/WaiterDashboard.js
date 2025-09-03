import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import Scanner from '../components/BarcodeScanner/Scanner';
import { useNavigation } from '@react-navigation/native';

export default function WaiterDashboard() {
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
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    cardDescription: {
      color: '#757575',
    },
    scannerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      zIndex: 1000,
    },
  });
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Panel de Mesero</Text>
      
      <Card style={styles.card} onPress={() => setOpen(true)}>
        <Card.Content>
          <Text style={styles.cardTitle}>Escanear QR</Text>
          <Text style={styles.cardDescription}>
            Escanea el código QR de un cliente para registrar su visita o consumo
          </Text>
        </Card.Content>
      </Card>
      
      <Card style={styles.card} onPress={() => navigation.navigate('TableManagement')}>
        <Card.Content>
          <Text style={styles.cardTitle}>Gestión de Mesas</Text>
          <Text style={styles.cardDescription}>
            Visualiza y administra el estado de las mesas del restaurante
          </Text>
        </Card.Content>
      </Card>
      
      {open && (
        <View style={styles.scannerContainer}>
          <Scanner
            onClose={() => setOpen(false)}
            onScan={(payload) => {
              setOpen(false);
              Alert.alert('Lectura', JSON.stringify(payload.data));
              // TODO: guardar visita/puntos
            }}
          />
        </View>
      )}
    </View>
  );
}
