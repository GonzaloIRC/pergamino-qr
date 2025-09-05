// TrackingTableSetup - Placeholder Component
// Esta es una implementación temporal para mantener la compatibilidad
// La implementación completa está en docs/reference/trackingtable/

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';

/**
 * Componente placeholder para TrackingTableSetup
 * La funcionalidad completa fue movida a docs/reference/trackingtable/
 */
export default function TrackingTableSetup({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Configuración de Mesas</Text>
        
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>
            [Placeholder] La funcionalidad de configuración de mesas está pendiente de implementación
          </Text>
        </View>
        
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Regresar
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  noticeContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 20,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  noticeText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
  }
});
