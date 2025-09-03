import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card, Button, Searchbar, Chip, Menu, Divider } from 'react-native-paper';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

/**
 * Pantalla de listado de clientes
 * 
 * - Muestra todos los clientes registrados
 * - Permite buscar por nombre o DNI/RUT
 * - Filtra por estado (activo, inactivo)
 * - Ordena por diferentes campos
 */
const CustomerListScreen = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('todos');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [filter, sortBy, sortOrder]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Construir la consulta base
      let customersQuery = collection(db, 'clientes');
      
      // Aplicar filtros si es necesario
      if (filter !== 'todos') {
        customersQuery = query(customersQuery, where('estado', '==', filter));
      }
      
      // Aplicar ordenamiento
      customersQuery = query(
        customersQuery, 
        orderBy(sortBy, sortOrder)
      );
      
      // Ejecutar la consulta
      const snapshot = await getDocs(customersQuery);
      const customersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCustomers(customersList);
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchQuery.toLowerCase();
    
    // Si hay búsqueda, filtrar por nombre, apellido, dni o email
    if (searchQuery) {
      return (
        (customer.nombre?.toLowerCase().includes(searchLower) || '') ||
        (customer.apellido?.toLowerCase().includes(searchLower) || '') ||
        (customer.dni?.toLowerCase().includes(searchLower) || '') ||
        (customer.email?.toLowerCase().includes(searchLower) || '')
      );
    }
    
    return true;
  });

  const renderCustomerItem = ({ item }) => (
    <Card 
      style={styles.customerCard}
      onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.customerName}>
              {item.nombre || ''} {item.apellido || ''}
            </Text>
            <Text style={styles.customerDetails}>
              DNI/RUT: {item.dni || 'No especificado'}
            </Text>
          </View>
          <Chip 
            mode="outlined"
            style={[
              styles.statusChip,
              { borderColor: item.estado === 'activo' ? '#4CAF50' : '#F44336' }
            ]}
            textStyle={{ 
              color: item.estado === 'activo' ? '#4CAF50' : '#F44336',
              fontWeight: 'bold'
            }}
          >
            {item.estado === 'activo' ? 'Activo' : 'Inactivo'}
          </Chip>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.customerEmail}>
            {item.email || 'Sin correo'}
          </Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Puntos:</Text>
            <Text style={styles.pointsValue}>{item.puntos || 0}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Buscar por nombre o DNI/RUT"
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      
      <View style={styles.filtersContainer}>
        <View style={styles.filterChips}>
          <Chip 
            selected={filter === 'todos'} 
            onPress={() => setFilter('todos')}
            style={styles.filterChip}
          >
            Todos
          </Chip>
          <Chip 
            selected={filter === 'activo'} 
            onPress={() => setFilter('activo')}
            style={styles.filterChip}
          >
            Activos
          </Chip>
          <Chip 
            selected={filter === 'inactivo'} 
            onPress={() => setFilter('inactivo')}
            style={styles.filterChip}
          >
            Inactivos
          </Chip>
        </View>
        
        <Menu
          visible={showSortMenu}
          onDismiss={() => setShowSortMenu(false)}
          anchor={
            <Button 
              mode="text" 
              onPress={() => setShowSortMenu(true)}
              icon="sort"
              compact
            >
              Ordenar
            </Button>
          }
        >
          <Menu.Item 
            title="Nombre (A-Z)" 
            onPress={() => {
              setSortBy('nombre');
              setSortOrder('asc');
              setShowSortMenu(false);
            }} 
          />
          <Menu.Item 
            title="Nombre (Z-A)" 
            onPress={() => {
              setSortBy('nombre');
              setSortOrder('desc');
              setShowSortMenu(false);
            }}
          />
          <Divider />
          <Menu.Item 
            title="Puntos (Mayor a menor)" 
            onPress={() => {
              setSortBy('puntos');
              setSortOrder('desc');
              setShowSortMenu(false);
            }}
          />
          <Menu.Item 
            title="Puntos (Menor a mayor)" 
            onPress={() => {
              setSortBy('puntos');
              setSortOrder('asc');
              setShowSortMenu(false);
            }}
          />
          <Divider />
          <Menu.Item 
            title="Fecha registro (Recientes)" 
            onPress={() => {
              setSortBy('fechaRegistro');
              setSortOrder('desc');
              setShowSortMenu(false);
            }}
          />
          <Menu.Item 
            title="Fecha registro (Antiguos)" 
            onPress={() => {
              setSortBy('fechaRegistro');
              setSortOrder('asc');
              setShowSortMenu(false);
            }}
          />
        </Menu>
      </View>

      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loaderText}>Cargando clientes...</Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {filteredCustomers.length} {filteredCustomers.length === 1 ? 'cliente' : 'clientes'} encontrados
              </Text>
              <Button 
                icon="plus" 
                mode="contained" 
                onPress={() => navigation.navigate('Register')}
                style={styles.addButton}
              >
                Nuevo cliente
              </Button>
            </View>
            
            <FlatList
              data={filteredCustomers}
              renderItem={renderCustomerItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No se encontraron clientes con los filtros aplicados
                  </Text>
                  <Button 
                    mode="outlined" 
                    onPress={() => {
                      setSearchQuery('');
                      setFilter('todos');
                      fetchCustomers();
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </View>
              }
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  customerCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerDetails: {
    fontSize: 14,
    color: '#757575',
  },
  statusChip: {
    height: 28,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerEmail: {
    fontSize: 14,
    color: '#424242',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#757575',
  },
  addButton: {
    borderRadius: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  emptyContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default CustomerListScreen;
