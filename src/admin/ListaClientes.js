// src/admin/ListaClientes.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { db } from '../services/firebaseClient';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query,
  orderBy,
  where 
} from 'firebase/firestore';

const ListaClientes = ({ navigation }) => {
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [historialConsumos, setHistorialConsumos] = useState([]);

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    filtrarClientes();
  }, [busqueda, clientes]);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'clientes'), orderBy('fechaRegistro', 'desc'));
      const querySnapshot = await getDocs(q);
      const clientesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClientes(clientesData);
      setClientesFiltrados(clientesData);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      Alert.alert('Error', 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filtrarClientes = () => {
    if (!busqueda.trim()) {
      setClientesFiltrados(clientes);
      return;
    }

    const filtrados = clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.dni.includes(busqueda) ||
      cliente.telefono.includes(busqueda)
    );
    setClientesFiltrados(filtrados);
  };

  const cargarHistorialCliente = async (clienteId) => {
    try {
      const q = query(
        collection(db, 'consumos'), 
        where('clienteId', '==', clienteId),
        orderBy('fecha', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const historial = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistorialConsumos(historial);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setHistorialConsumos([]);
    }
  };

  const verDetalleCliente = async (cliente) => {
    setClienteSeleccionado(cliente);
    await cargarHistorialCliente(cliente.id);
    setModalVisible(true);
  };

  const eliminarCliente = (cliente) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de eliminar al cliente ${cliente.nombre}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => confirmarEliminacion(cliente.id)
        }
      ]
    );
  };

  const confirmarEliminacion = async (clienteId) => {
    try {
      await deleteDoc(doc(db, 'clientes', clienteId));
      Alert.alert('Éxito', 'Cliente eliminado correctamente');
      cargarClientes();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      Alert.alert('Error', 'No se pudo eliminar el cliente');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarClientes();
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderCliente = ({ item }) => (
    <View style={styles.clienteCard}>
      <View style={styles.clienteInfo}>
        <Text style={styles.clienteNombre}>{item.nombre}</Text>
        <Text style={styles.clienteDetalle}>DNI: {item.dni}</Text>
        <Text style={styles.clienteDetalle}>Teléfono: {item.telefono}</Text>
        <Text style={styles.clienteDetalle}>Puntos: {item.puntos || 0}</Text>
        <Text style={styles.clienteFecha}>
          Registrado: {formatearFecha(item.fechaRegistro)}
        </Text>
      </View>
      <View style={styles.clienteAcciones}>
        <TouchableOpacity 
          style={[styles.botonAccion, styles.botonVer]}
          onPress={() => verDetalleCliente(item)}
        >
          <Text style={styles.textoBoton}>Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.botonAccion, styles.botonEliminar]}
          onPress={() => eliminarCliente(item)}
        >
          <Text style={styles.textoBoton}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConsumo = ({ item }) => (
    <View style={styles.consumoItem}>
      <Text style={styles.consumoFecha}>{formatearFecha(item.fecha)}</Text>
      <Text style={styles.consumoDetalle}>Monto: ${item.monto}</Text>
      <Text style={styles.consumoDetalle}>Puntos ganados: {item.puntosGanados}</Text>
      {item.mesa && <Text style={styles.consumoDetalle}>Mesa: {item.mesa}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Lista de Clientes</Text>
        <Text style={styles.contador}>Total: {clientesFiltrados.length} clientes</Text>
      </View>

      <View style={styles.busquedaContainer}>
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar por nombre, DNI o teléfono..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <FlatList
        data={clientesFiltrados}
        renderItem={renderCliente}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Cargando clientes...' : 'No se encontraron clientes'}
            </Text>
          </View>
        )}
      />

      {/* Modal de detalle del cliente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {clienteSeleccionado && (
                <>
                  <Text style={styles.modalTitulo}>Detalle del Cliente</Text>
                  
                  <View style={styles.clienteDetalleCompleto}>
                    <Text style={styles.detalleLabel}>Nombre:</Text>
                    <Text style={styles.detalleValor}>{clienteSeleccionado.nombre}</Text>
                    
                    <Text style={styles.detalleLabel}>DNI:</Text>
                    <Text style={styles.detalleValor}>{clienteSeleccionado.dni}</Text>
                    
                    <Text style={styles.detalleLabel}>Teléfono:</Text>
                    <Text style={styles.detalleValor}>{clienteSeleccionado.telefono}</Text>
                    
                    <Text style={styles.detalleLabel}>Puntos Acumulados:</Text>
                    <Text style={styles.detalleValor}>{clienteSeleccionado.puntos || 0}</Text>
                    
                    <Text style={styles.detalleLabel}>Fecha de Registro:</Text>
                    <Text style={styles.detalleValor}>
                      {formatearFecha(clienteSeleccionado.fechaRegistro)}
                    </Text>
                  </View>

                  <Text style={styles.historialTitulo}>Historial de Consumos</Text>
                  
                  {historialConsumos.length > 0 ? (
                    <FlatList
                      data={historialConsumos}
                      renderItem={renderConsumo}
                      keyExtractor={(item) => item.id}
                      style={styles.historialLista}
                      nestedScrollEnabled={true}
                    />
                  ) : (
                    <Text style={styles.sinHistorial}>Sin consumos registrados</Text>
                  )}
                </>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.botonCerrarModal}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.textoBotonCerrar}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#8B4513',
    padding: 20,
    paddingTop: 40,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  contador: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  busquedaContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  busquedaInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  clienteCard: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  clienteDetalle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  clienteFecha: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  clienteAcciones: {
    flexDirection: 'column',
    gap: 8,
  },
  botonAccion: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  botonVer: {
    backgroundColor: '#007AFF',
  },
  botonEliminar: {
    backgroundColor: '#dc3545',
  },
  textoBoton: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#8B4513',
  },
  clienteDetalleCompleto: {
    marginBottom: 20,
  },
  detalleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  detalleValor: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  historialTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 20,
    marginBottom: 10,
  },
  historialLista: {
    maxHeight: 200,
  },
  consumoItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B4513',
  },
  consumoFecha: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  consumoDetalle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  sinHistorial: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
  botonCerrarModal: {
    backgroundColor: '#8B4513',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  textoBotonCerrar: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListaClientes;
