import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { db } from '../../services/firebaseClient';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function HistoryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Crear una consulta para obtener los últimos 100 registros de historial
    const q = query(
      collection(db, 'Historial'),
      orderBy('ts', 'desc'),
      limit(100)
    );

    // Suscribirse a cambios en tiempo real
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(data);
      setLoading(false);
    }, (error) => {
      console.error("Error al obtener historial:", error);
      setLoading(false);
    });

    // Cancelar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  // Función para formatear la fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  // Renderizar cada ítem del historial
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.tipo}>{item.tipo}</Text>
      <View style={styles.details}>
        {item.serial && <Text>Serial: {item.serial}</Text>}
        {item.dni && <Text>DNI: {item.dni}</Text>}
        {item.nonce && <Text>Nonce: {item.nonce}</Text>}
        <Text>Fecha: {formatDate(item.ts)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Transacciones</Text>
      {loading ? (
        <Text>Cargando historial...</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No hay registros de historial</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  tipo: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  details: {
    marginLeft: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  }
});
