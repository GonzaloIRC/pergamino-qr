// src/cliente/CanjeoPremios.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { db } from '../../firebase/firebaseConfig';
import { 
  collection, 
  getDocs, 
  query,
  where,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';

const CanjeoPremios = ({ route, navigation }) => {
  const { clienteId } = route.params;
  const [cliente, setCliente] = useState(null);
  const [premios, setPremios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [premioSeleccionado, setPremioSeleccionado] = useState(null);
  const [codigoVerificacion, setCodigoVerificacion] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarCliente(),
        cargarPremiosDisponibles()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const cargarCliente = async () => {
    try {
      const q = query(collection(db, 'clientes'), where('id', '==', clienteId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const clienteData = querySnapshot.docs[0].data();
        setCliente({ id: querySnapshot.docs[0].id, ...clienteData });
      }
    } catch (error) {
      console.error('Error al cargar cliente:', error);
    }
  };

  const cargarPremiosDisponibles = async () => {
    try {
      // Cargar campañas activas
      const q = query(
        collection(db, 'campañas'), 
        where('activa', '==', true)
      );
      const querySnapshot = await getDocs(q);
      
      const premiosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPremios(premiosData);
    } catch (error) {
      console.error('Error al cargar premios:', error);
    }
  };

  const iniciarCanje = (premio) => {
    if (!cliente) {
      Alert.alert('Error', 'No se pudo cargar la información del cliente');
      return;
    }

    const puntosCliente = cliente.puntos || 0;
    const puntosRequeridos = premio.puntosRequeridos || 0;

    if (puntosCliente < puntosRequeridos) {
      Alert.alert(
        'Puntos insuficientes',
        `Necesitas ${puntosRequeridos} puntos para este premio. Tienes ${puntosCliente} puntos.`
      );
      return;
    }

    setPremioSeleccionado(premio);
    setModalVisible(true);
  };

  const confirmarCanje = async () => {
    if (!premioSeleccionado || !cliente) return;

    // Validar código de verificación (simulado - en producción sería más robusto)
    if (codigoVerificacion !== '1234') {
      Alert.alert('Error', 'Código de verificación incorrecto');
      return;
    }

    try {
      const nuevosPuntos = (cliente.puntos || 0) - premioSeleccionado.puntosRequeridos;
      
      // Actualizar puntos del cliente
      const clienteRef = doc(db, 'clientes', cliente.id);
      await updateDoc(clienteRef, {
        puntos: nuevosPuntos
      });

      // Registrar el canje
      await addDoc(collection(db, 'canjes'), {
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        premioId: premioSeleccionado.id,
        premioNombre: premioSeleccionado.nombre,
        puntosCanjeados: premioSeleccionado.puntosRequeridos,
        fecha: serverTimestamp(),
        estado: 'pendiente' // pendiente, entregado, cancelado
      });

      Alert.alert(
        'Canje exitoso',
        `Has canjeado "${premioSeleccionado.premio}" por ${premioSeleccionado.puntosRequeridos} puntos. Te quedan ${nuevosPuntos} puntos.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              setPremioSeleccionado(null);
              setCodigoVerificacion('');
              cargarDatos(); // Recargar datos actualizados
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error al realizar canje:', error);
      Alert.alert('Error', 'No se pudo completar el canje');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const renderPremio = ({ item }) => {
    const puntosCliente = cliente?.puntos || 0;
    const puedeCanjesr = puntosCliente >= (item.puntosRequeridos || 0);

    return (
      <View style={styles.premioCard}>
        <View style={styles.premioInfo}>
          <Text style={styles.premioNombre}>{item.nombre}</Text>
          <Text style={styles.premioDescripcion}>{item.descripcion}</Text>
          <Text style={styles.premioPremio}>🎁 {item.premio}</Text>
          <Text style={styles.premioPuntos}>
            Requiere: {item.puntosRequeridos || 0} puntos
          </Text>
          
          {item.fechaFin && (
            <Text style={styles.premioVencimiento}>
              Válido hasta: {new Date(item.fechaFin).toLocaleDateString('es-ES')}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={[
            styles.botonCanje,
            !puedeCanjesr && styles.botonCanjeDeshabilitado
          ]}
          onPress={() => iniciarCanje(item)}
          disabled={!puedeCanjesr}
        >
          <Text style={[
            styles.textoBotonCanje,
            !puedeCanjesr && styles.textoBotonCanjeDeshabilitado
          ]}>
            {puedeCanjesr ? 'Canjear' : 'Insuficiente'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Canje de Premios</Text>
        {cliente && (
          <Text style={styles.puntosCliente}>
            Tus puntos: {cliente.puntos || 0} ⭐
          </Text>
        )}
      </View>

      <FlatList
        data={premios}
        renderItem={renderPremio}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Cargando premios...' : 'No hay premios disponibles'}
            </Text>
          </View>
        )}
      />

      {/* Modal de confirmación de canje */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {premioSeleccionado && (
              <>
                <Text style={styles.modalTitulo}>Confirmar Canje</Text>
                
                <View style={styles.resumenCanje}>
                  <Text style={styles.resumenTexto}>
                    Premio: {premioSeleccionado.premio}
                  </Text>
                  <Text style={styles.resumenTexto}>
                    Puntos a usar: {premioSeleccionado.puntosRequeridos}
                  </Text>
                  <Text style={styles.resumenTexto}>
                    Puntos restantes: {(cliente?.puntos || 0) - premioSeleccionado.puntosRequeridos}
                  </Text>
                </View>

                <Text style={styles.codigoLabel}>
                  Ingresa el código de verificación del mesero:
                </Text>
                <TextInput
                  style={styles.codigoInput}
                  value={codigoVerificacion}
                  onChangeText={setCodigoVerificacion}
                  placeholder="Código de verificación"
                  keyboardType="numeric"
                  secureTextEntry
                />

                <View style={styles.modalBotones}>
                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonCancelar]}
                    onPress={() => {
                      setModalVisible(false);
                      setPremioSeleccionado(null);
                      setCodigoVerificacion('');
                    }}
                  >
                    <Text style={styles.textoBotonModal}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalBoton, styles.botonConfirmar]}
                    onPress={confirmarCanje}
                  >
                    <Text style={styles.textoBotonModal}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  puntosCliente: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  premioCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  premioInfo: {
    flex: 1,
    marginRight: 15,
  },
  premioNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  premioDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  premioPremio: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '600',
    marginBottom: 4,
  },
  premioPuntos: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  premioVencimiento: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  botonCanje: {
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 90,
  },
  botonCanjeDeshabilitado: {
    backgroundColor: '#ccc',
  },
  textoBotonCanje: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  textoBotonCanjeDeshabilitado: {
    color: '#999',
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
    maxWidth: '90%',
    width: '90%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#8B4513',
  },
  resumenCanje: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  resumenTexto: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  codigoLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  codigoInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBotones: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBoton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: '#6c757d',
  },
  botonConfirmar: {
    backgroundColor: '#28a745',
  },
  textoBotonModal: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CanjeoPremios;
