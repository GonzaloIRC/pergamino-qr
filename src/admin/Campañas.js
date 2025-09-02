// src/admin/Campañas.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import { db } from '../services/firebaseClient';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore';

const Campañas = ({ navigation }) => {
  const [campañas, setCampañas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editandoCampaña, setEditandoCampaña] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    puntosRequeridos: '',
    premio: '',
    fechaInicio: '',
    fechaFin: '',
    activa: true
  });

  useEffect(() => {
    cargarCampañas();
  }, []);

  const cargarCampañas = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'campañas'), orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);
      const campanasData = [];
      
      querySnapshot.forEach((doc) => {
        campanasData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setCampañas(campanasData);
    } catch (error) {
      console.error('Error al cargar campañas:', error);
      Alert.alert('Error', 'No se pudieron cargar las campañas');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (campaña = null) => {
    if (campaña) {
      setEditandoCampaña(campaña);
      setFormData({
        nombre: campaña.nombre,
        descripcion: campaña.descripcion,
        puntosRequeridos: campaña.puntosRequeridos.toString(),
        premio: campaña.premio,
        fechaInicio: campaña.fechaInicio,
        fechaFin: campaña.fechaFin,
        activa: campaña.activa
      });
    } else {
      setEditandoCampaña(null);
      setFormData({
        nombre: '',
        descripcion: '',
        puntosRequeridos: '',
        premio: '',
        fechaInicio: '',
        fechaFin: '',
        activa: true
      });
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setEditandoCampaña(null);
    setFormData({
      nombre: '',
      descripcion: '',
      puntosRequeridos: '',
      premio: '',
      fechaInicio: '',
      fechaFin: '',
      activa: true
    });
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return false;
    }
    if (!formData.descripcion.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return false;
    }
    if (!formData.puntosRequeridos || isNaN(formData.puntosRequeridos)) {
      Alert.alert('Error', 'Los puntos requeridos deben ser un número válido');
      return false;
    }
    if (!formData.premio.trim()) {
      Alert.alert('Error', 'El premio es obligatorio');
      return false;
    }
    return true;
  };

  const guardarCampaña = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const campaniaData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        puntosRequeridos: parseInt(formData.puntosRequeridos),
        premio: formData.premio,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        activa: formData.activa,
        fechaActualizacion: serverTimestamp()
      };

      if (editandoCampaña) {
        // Actualizar campaña existente
        await updateDoc(doc(db, 'campañas', editandoCampaña.id), campaniaData);
        Alert.alert('Éxito', 'Campaña actualizada correctamente');
      } else {
        // Crear nueva campaña
        campaniaData.fechaCreacion = serverTimestamp();
        await addDoc(collection(db, 'campañas'), campaniaData);
        Alert.alert('Éxito', 'Campaña creada correctamente');
      }

      cerrarModal();
      cargarCampañas();
    } catch (error) {
      console.error('Error al guardar campaña:', error);
      Alert.alert('Error', 'No se pudo guardar la campaña');
    } finally {
      setLoading(false);
    }
  };

  const eliminarCampaña = (campaña) => {
    Alert.alert(
      'Eliminar Campaña',
      `¿Estás seguro de que quieres eliminar "${campaña.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'campañas', campaña.id));
              Alert.alert('Éxito', 'Campaña eliminada correctamente');
              cargarCampañas();
            } catch (error) {
              console.error('Error al eliminar campaña:', error);
              Alert.alert('Error', 'No se pudo eliminar la campaña');
            }
          }
        }
      ]
    );
  };

  const toggleActivaCampaña = async (campaña) => {
    try {
      await updateDoc(doc(db, 'campañas', campaña.id), {
        activa: !campaña.activa,
        fechaActualizacion: serverTimestamp()
      });
      cargarCampañas();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado de la campaña');
    }
  };

  const renderCampaña = ({ item }) => (
    <View style={[styles.campaniaCard, !item.activa && styles.campaniaInactiva]}>
      <View style={styles.campaniaHeader}>
        <Text style={styles.campaniaNombre}>{item.nombre}</Text>
        <View style={styles.campaniaActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => abrirModal(item)}
          >
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, item.activa ? styles.deactivateButton : styles.activateButton]}
            onPress={() => toggleActivaCampaña(item)}
          >
            <Text style={styles.actionButtonText}>
              {item.activa ? 'Desactivar' : 'Activar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => eliminarCampaña(item)}
          >
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.campaniaDescripcion}>{item.descripcion}</Text>
      <View style={styles.campaniaDetails}>
        <Text style={styles.campaniaDetail}>
          Puntos requeridos: {item.puntosRequeridos}
        </Text>
        <Text style={styles.campaniaDetail}>Premio: {item.premio}</Text>
        {item.fechaInicio && (
          <Text style={styles.campaniaDetail}>Inicia: {item.fechaInicio}</Text>
        )}
        {item.fechaFin && (
          <Text style={styles.campaniaDetail}>Termina: {item.fechaFin}</Text>
        )}
        <Text style={[styles.campaniaEstado, item.activa ? styles.activa : styles.inactiva]}>
          {item.activa ? 'ACTIVA' : 'INACTIVA'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Campañas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => abrirModal()}
        >
          <Text style={styles.addButtonText}>Nueva Campaña</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={campañas}
        renderItem={renderCampaña}
        keyExtractor={(item) => item.id}
        style={styles.campaniasList}
        refreshing={loading}
        onRefresh={cargarCampañas}
        ListEmptyComponent={
          <Text style={styles.emptyCampañas}>No hay campañas creadas</Text>
        }
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Volver al Inicio</Text>
      </TouchableOpacity>

      {/* Modal para crear/editar campaña */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editandoCampaña ? 'Editar Campaña' : 'Nueva Campaña'}
              </Text>

              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
                placeholder="Nombre de la campaña"
              />

              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.descripcion}
                onChangeText={(text) => setFormData(prev => ({ ...prev, descripcion: text }))}
                placeholder="Descripción de la campaña"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Puntos Requeridos *</Text>
              <TextInput
                style={styles.input}
                value={formData.puntosRequeridos}
                onChangeText={(text) => setFormData(prev => ({ ...prev, puntosRequeridos: text }))}
                placeholder="Puntos necesarios para el premio"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Premio *</Text>
              <TextInput
                style={styles.input}
                value={formData.premio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, premio: text }))}
                placeholder="Premio a obtener"
              />

              <Text style={styles.label}>Fecha de Inicio</Text>
              <TextInput
                style={styles.input}
                value={formData.fechaInicio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fechaInicio: text }))}
                placeholder="DD/MM/AAAA"
              />

              <Text style={styles.label}>Fecha de Fin</Text>
              <TextInput
                style={styles.input}
                value={formData.fechaFin}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fechaFin: text }))}
                placeholder="DD/MM/AAAA"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={guardarCampaña}
                  disabled={loading}
                >
                  <Text style={styles.modalButtonText}>
                    {loading ? 'Guardando...' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={cerrarModal}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  campaniasList: {
    flex: 1,
    padding: 15,
  },
  campaniaCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  campaniaInactiva: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
  },
  campaniaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  campaniaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  campaniaActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  activateButton: {
    backgroundColor: '#28a745',
  },
  deactivateButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  campaniaDescripcion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  campaniaDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  campaniaDetail: {
    fontSize: 14,
    marginBottom: 5,
  },
  campaniaEstado: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
  activa: {
    color: '#28a745',
  },
  inactiva: {
    color: '#dc3545',
  },
  emptyCampañas: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
  backButton: {
    backgroundColor: '#666',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    padding: 15,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Campañas;
