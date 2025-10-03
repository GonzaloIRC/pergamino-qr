import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Button, Title, Paragraph, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Scanner from '../components/BarcodeScanner/Scanner';

export default function WaiterDashboard() {
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);

  // Funciones
  const handleScannerOpen = () => {
    setOpen(true);
  };

  const handleScannerClose = () => {
    setOpen(false);
  };

  const handleBarcodeScan = (payload) => {
    setOpen(false);
    Alert.alert('Código Escaneado', JSON.stringify(payload));
    // TODO: Procesar el código escaneado
  };

  // Renderizar el dashboard o el escáner
  if (open) {
    return (
      <View style={styles.container}>
        <Scanner
          onClose={handleScannerClose}
          onBarcode={handleBarcodeScan}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Panel de Mesero</Text>
      
      <View style={styles.cardsContainer}>
        {/* Card para escanear QR */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Escanear QR</Title>
            <Paragraph>Escanea códigos QR para registrar visitas o validar promociones</Paragraph>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={handleScannerOpen}>
              Abrir Escáner
            </Button>
          </Card.Actions>
        </Card>
        
        {/* Card para servicio al cliente */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Atención al Cliente</Title>
            <Paragraph>Consulta información de clientes y sus beneficios</Paragraph>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={() => Alert.alert('Próximamente', 'Esta funcionalidad estará disponible pronto')}>
              Consultar
            </Button>
          </Card.Actions>
        </Card>
      </View>
      
      {/* Guía rápida para meseros */}
      <Surface style={styles.helpSection}>
        <Title>Guía Rápida</Title>
        <Paragraph>
          • Para registrar una visita de cliente, escanea su código QR personal{'\n'}
          • Para marcar una mesa como ocupada, ve a la sección de Mesas{'\n'}
          • Recuerda marcar las mesas como "En limpieza" cuando los clientes se retiran{'\n'}
          • Una vez limpia la mesa, márcala como "Disponible"
        </Paragraph>
      </Surface>
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
    marginBottom: 16,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  helpSection: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
});
