// TrackingTable - Placeholder Component
// Esta es una implementación temporal para mantener la compatibilidad
// La implementación completa está en docs/reference/trackingtable/

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

/**
 * Componente placeholder para TrackingTable
 * La funcionalidad completa fue movida a docs/reference/trackingtable/
 */
export default function TrackingTable({ tables = [], onTablePress, role = 'waiter' }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Administración de Mesas</Text>
      <Text style={styles.disclaimer}>
        [Placeholder] La funcionalidad de tracking table está pendiente
      </Text>
      
      <FlatList
        data={tables}
        keyExtractor={(item) => item.id || item.tableNumber.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tableItem}
            onPress={() => onTablePress && onTablePress(item)}
          >
            <Text style={styles.tableNumber}>Mesa {item.tableNumber}</Text>
            <Text style={styles.tableInfo}>
              Capacidad: {item.capacity} | Estado: {item.status || 'disponible'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
    color: '#888',
  },
  tableItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  tableNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  }
});
