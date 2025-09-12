import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './services/firebaseClient';

export default function Customers({ route, navigation }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  
  // Check if we received a DNI to search for from the route params
  useEffect(() => {
    if (route.params?.searchDni) {
      setSearchText(route.params.searchDni);
    }
  }, [route.params]);
  
  // Load customers from Firestore
  useEffect(() => {
    const clientesRef = collection(db, 'clientes');
    const q = query(clientesRef, orderBy('lastVisit', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientesList = [];
      snapshot.forEach((doc) => {
        clientesList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setCustomers(clientesList);
      setFilteredCustomers(clientesList);
      setLoading(false);
    }, (error) => {
      console.error("Error loading customers:", error);
      Alert.alert('Error', 'No se pudieron cargar los clientes.');
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Filter customers based on search text
  useEffect(() => {
    if (searchText) {
      const filtered = customers.filter((customer) => {
        const dni = customer.dni ? customer.dni.toLowerCase() : '';
        const nombre = customer.nombre ? customer.nombre.toLowerCase() : '';
        const searchLower = searchText.toLowerCase();
        return dni.includes(searchLower) || nombre.includes(searchLower);
      });
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchText, customers]);
  
  const handleEditCustomer = (customer) => {
    // In a real app, this would navigate to a customer edit screen
    Alert.alert(
      'Editar Cliente',
      `Editar información para cliente ${customer.dni}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Actualizar', 
          onPress: () => {
            updateDoc(doc(db, 'clientes', customer.id), {
              updatedAt: serverTimestamp()
            });
          }
        }
      ]
    );
  };
  
  const renderCustomerItem = ({ item }) => {
    // Format date if available
    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
      } catch (e) {
        return 'Fecha inválida';
      }
    };
    
    return (
      <TouchableOpacity
        style={styles.customerItem}
        onPress={() => handleEditCustomer(item)}
      >
        <View style={styles.customerInfo}>
          <Text style={styles.dni}>{item.dni || 'Sin DNI'}</Text>
          <Text style={styles.name}>{item.nombre || 'Cliente sin nombre'}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Puntos:</Text>
              <Text style={styles.statValue}>{item.puntos || 0}</Text>
            </View>
            
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Visitas:</Text>
              <Text style={styles.statValue}>{item.visits || 0}</Text>
            </View>
            
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Última visita:</Text>
              <Text style={styles.statValue}>{formatDate(item.lastVisit)}</Text>
            </View>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={24} color="#777" />
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por DNI o nombre..."
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#777" />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Cargando clientes...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>
            {filteredCustomers.length} {filteredCustomers.length === 1 ? 'cliente' : 'clientes'} encontrados
          </Text>
          
          <FlatList
            data={filteredCustomers}
            renderItem={renderCustomerItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No se encontraron clientes</Text>
                <Text style={styles.emptySubText}>Escanea un código APP:DNI:NONCE para registrar uno</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    margin: 10,
    paddingHorizontal: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  resultCount: {
    marginHorizontal: 15,
    marginVertical: 5,
    color: '#555',
    fontStyle: 'italic',
  },
  listContainer: {
    paddingBottom: 20,
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 15,
    borderRadius: 5,
    elevation: 1,
  },
  customerInfo: {
    flex: 1,
  },
  dni: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  statsContainer: {
    marginTop: 5,
  },
  stat: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
    marginRight: 5,
  },
  statValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
});
