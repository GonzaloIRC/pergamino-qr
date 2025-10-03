import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseClient';

export default function CustomersScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ dni: '', nombre: '', email: '', telefono: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Cargar clientes
  const loadCustomers = async (searchTerm = '') => {
    setLoading(true);
    try {
      let customersRef = collection(db, 'Clientes');
      let customersQuery;
      
      if (searchTerm) {
        // Búsqueda por DNI
        customersQuery = query(customersRef, where('dni', '==', searchTerm));
      } else {
        customersQuery = query(customersRef);
      }
      
      const querySnapshot = await getDocs(customersQuery);
      const customersList = [];
      
      querySnapshot.forEach((doc) => {
        customersList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setCustomers(customersList);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadCustomers();
  }, []);

  // Manejar búsqueda
  const handleSearch = () => {
    if (searchQuery.trim()) {
      loadCustomers(searchQuery.trim());
    } else {
      loadCustomers();
    }
  };

  // Agregar nuevo cliente
  const handleAddCustomer = async () => {
    // Validar campos requeridos
    if (!newCustomer.dni || !newCustomer.nombre) {
      Alert.alert('Error', 'DNI y Nombre son campos obligatorios');
      return;
    }
    
    setLoading(true);
    try {
      // Verificar si ya existe un cliente con ese DNI
      const dniCheck = query(collection(db, 'Clientes'), where('dni', '==', newCustomer.dni));
      const dniSnapshot = await getDocs(dniCheck);
      
      if (!dniSnapshot.empty) {
        Alert.alert('Error', 'Ya existe un cliente con ese DNI');
        setLoading(false);
        return;
      }
      
      // Crear nuevo cliente
      await addDoc(collection(db, 'Clientes'), {
        ...newCustomer,
        creado: new Date(),
      });
      
      // Limpiar formulario
      setNewCustomer({ dni: '', nombre: '', email: '', telefono: '' });
      setShowAddForm(false);
      
      // Recargar lista
      loadCustomers();
      
      Alert.alert('Éxito', 'Cliente registrado correctamente');
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      Alert.alert('Error', 'No se pudo registrar el cliente');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar item de cliente
  const renderCustomerItem = ({ item }) => (
    <View style={styles.customerItem}>
      <View>
        <Text style={styles.customerName}>{item.nombre}</Text>
        <Text style={styles.customerInfo}>DNI: {item.dni}</Text>
        {item.email && <Text style={styles.customerInfo}>{item.email}</Text>}
        {item.telefono && <Text style={styles.customerInfo}>Tel: {item.telefono}</Text>}
      </View>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('Scanner')}
      >
        <Ionicons name="qr-code-outline" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por DNI..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Botón para agregar cliente */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddForm(!showAddForm)}
      >
        <Ionicons name={showAddForm ? "remove" : "add"} size={24} color="white" />
        <Text style={styles.addButtonText}>
          {showAddForm ? "Cancelar" : "Nuevo Cliente"}
        </Text>
      </TouchableOpacity>
      
      {/* Formulario para agregar cliente */}
      {showAddForm && (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="DNI *"
            value={newCustomer.dni}
            onChangeText={(text) => setNewCustomer({...newCustomer, dni: text})}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre *"
            value={newCustomer.nombre}
            onChangeText={(text) => setNewCustomer({...newCustomer, nombre: text})}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={newCustomer.email}
            onChangeText={(text) => setNewCustomer({...newCustomer, email: text})}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={newCustomer.telefono}
            onChangeText={(text) => setNewCustomer({...newCustomer, telefono: text})}
            keyboardType="phone-pad"
          />
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleAddCustomer}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Lista de clientes */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={customers}
          renderItem={renderCustomerItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>No se encontraron clientes</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    width: 50,
    height: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  customerItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  actionButton: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});