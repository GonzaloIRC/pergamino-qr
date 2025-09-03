import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card, Title, Paragraph, ActivityIndicator } from 'react-native-paper';
import { initTrackingTables } from '../firebase/trackingTableInit';

/**
 * Pantalla de inicialización para el módulo TrackingTable
 * Permite configurar las colecciones y datos necesarios para el sistema de tracking de mesas
 */
export default function TrackingTableSetup({ navigation }) {
  const [loading, setLoading] = React.useState(false);

  const handleInitData = async (resetData = false) => {
    setLoading(true);
    try {
      const result = await initTrackingTables(resetData);
      
      if (result.success) {
        Alert.alert(
          'Inicialización exitosa',
          'Los datos de TrackingTable se han inicializado correctamente.',
          [{ text: 'OK', onPress: () => navigation.navigate('TableManagement') }]
        );
      } else {
        Alert.alert(
          'Error',
          `No se pudieron inicializar los datos: ${result.error}`
        );
      }
    } catch (error) {
      console.error('Error en inicialización:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error durante la inicialización. Consulta la consola para más detalles.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Configuración TrackingTable</Text>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Inicialización de datos</Title>
          <Paragraph>
            Esta herramienta configurará las colecciones necesarias para el sistema de tracking 
            de mesas en Firestore. Se crearán las colecciones 'mesas', 'historialMesas' y se 
            vincularán con el resto del sistema.
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button 
            mode="contained"
            onPress={() => handleInitData(false)}
            disabled={loading}
          >
            Inicializar estructura
          </Button>
        </Card.Actions>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Datos de ejemplo</Title>
          <Paragraph>
            Crea ejemplos de mesas con diferentes estados para probar el funcionamiento del sistema.
            Esta opción creará 5 mesas de ejemplo con diferentes estados y capacidades.
          </Paragraph>
          <Text style={styles.warning}>
            Advertencia: Si ya existen datos, esta acción agregará nuevas mesas de ejemplo.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button 
            mode="contained"
            onPress={() => handleInitData(true)}
            disabled={loading}
            color="#FF9800"
          >
            Crear datos de ejemplo
          </Button>
        </Card.Actions>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Ir a gestión de mesas</Title>
          <Paragraph>
            Accede directamente al módulo de gestión de mesas si ya has completado la inicialización.
          </Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button 
            mode="outlined"
            onPress={() => navigation.navigate('TableManagement')}
            disabled={loading}
          >
            Ir a Gestión de Mesas
          </Button>
        </Card.Actions>
      </Card>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Inicializando datos...</Text>
        </View>
      )}
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
  warning: {
    color: '#f44336',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2196F3',
  },
});
