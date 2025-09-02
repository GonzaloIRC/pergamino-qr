// src/components/NotificationCenter.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { db } from '../services/firebaseClient';
import { 
  collection, 
  getDocs, 
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp 
} from 'firebase/firestore';

const NotificationCenter = ({ visible, onClose, userRole = 'admin' }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      cargarNotificaciones();
    }
  }, [visible, userRole]);

  const cargarNotificaciones = async () => {
    setLoading(true);
    try {
      // Generar notificaciones automáticas basadas en datos
      const notificacionesGeneradas = await generarNotificacionesAutomaticas();
      
      // Aquí también podrías cargar notificaciones guardadas de Firebase
      // const q = query(collection(db, 'notificaciones'), where('role', '==', userRole), orderBy('fecha', 'desc'));
      // const querySnapshot = await getDocs(q);
      
      setNotificaciones(notificacionesGeneradas);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const generarNotificacionesAutomaticas = async () => {
    const notificaciones = [];
    const hoy = new Date();

    try {
      // Verificar clientes sin consumos recientes
      const clientesSnapshot = await getDocs(collection(db, 'clientes'));
      const consumosSnapshot = await getDocs(collection(db, 'consumos'));
      
      const consumosMap = new Map();
      consumosSnapshot.docs.forEach(doc => {
        const consumo = doc.data();
        if (consumo.clienteId) {
          const fechaConsumo = consumo.fecha?.toDate ? consumo.fecha.toDate() : new Date(consumo.fecha);
          if (!consumosMap.has(consumo.clienteId) || fechaConsumo > consumosMap.get(consumo.clienteId)) {
            consumosMap.set(consumo.clienteId, fechaConsumo);
          }
        }
      });

      let clientesInactivos = 0;
      clientesSnapshot.docs.forEach(doc => {
        const cliente = doc.data();
        const ultimoConsumo = consumosMap.get(doc.id);
        
        if (ultimoConsumo) {
          const diasSinConsumo = Math.floor((hoy - ultimoConsumo) / (1000 * 60 * 60 * 24));
          if (diasSinConsumo > 30) {
            clientesInactivos++;
          }
        }
      });

      if (clientesInactivos > 0) {
        notificaciones.push({
          id: 'clientes_inactivos',
          tipo: 'warning',
          titulo: 'Clientes Inactivos',
          mensaje: `${clientesInactivos} clientes no han consumido en los últimos 30 días`,
          fecha: hoy,
          prioridad: 'media',
          accion: 'ver_clientes_inactivos'
        });
      }

      // Verificar campañas próximas a vencer
      const campañasSnapshot = await getDocs(query(collection(db, 'campañas'), where('activa', '==', true)));
      campañasSnapshot.docs.forEach(doc => {
        const campaña = doc.data();
        if (campaña.fechaFin) {
          const fechaFin = new Date(campaña.fechaFin);
          const diasRestantes = Math.floor((fechaFin - hoy) / (1000 * 60 * 60 * 24));
          
          if (diasRestantes <= 7 && diasRestantes > 0) {
            notificaciones.push({
              id: `campaña_${doc.id}`,
              tipo: 'info',
              titulo: 'Campaña por Vencer',
              mensaje: `"${campaña.nombre}" termina en ${diasRestantes} días`,
              fecha: hoy,
              prioridad: 'alta',
              accion: 'ver_campañas'
            });
          }
        }
      });

      // Verificar crecimiento de clientes
      const fechaSemanaAnterior = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
      const clientesNuevos = clientesSnapshot.docs.filter(doc => {
        const cliente = doc.data();
        const fechaRegistro = cliente.fechaRegistro?.toDate ? cliente.fechaRegistro.toDate() : new Date(cliente.fechaRegistro);
        return fechaRegistro >= fechaSemanaAnterior;
      }).length;

      if (clientesNuevos > 5) {
        notificaciones.push({
          id: 'crecimiento_clientes',
          tipo: 'success',
          titulo: '¡Excelente Crecimiento!',
          mensaje: `${clientesNuevos} nuevos clientes esta semana`,
          fecha: hoy,
          prioridad: 'baja',
          accion: 'ver_estadisticas'
        });
      }

      // Verificar consumos del día
      const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const consumosHoy = consumosSnapshot.docs.filter(doc => {
        const consumo = doc.data();
        const fechaConsumo = consumo.fecha?.toDate ? consumo.fecha.toDate() : new Date(consumo.fecha);
        return fechaConsumo >= inicioHoy;
      });

      if (consumosHoy.length === 0 && hoy.getHours() > 12) {
        notificaciones.push({
          id: 'sin_consumos_hoy',
          tipo: 'warning',
          titulo: 'Sin Consumos Hoy',
          mensaje: 'No se han registrado consumos en el día',
          fecha: hoy,
          prioridad: 'media',
          accion: 'ver_mesero'
        });
      }

      // Verificar puntos altos acumulados
      const clientesConMuchosPuntos = clientesSnapshot.docs.filter(doc => {
        const cliente = doc.data();
        return (cliente.puntos || 0) > 100;
      });

      if (clientesConMuchosPuntos.length > 0) {
        notificaciones.push({
          id: 'clientes_puntos_altos',
          tipo: 'info',
          titulo: 'Clientes con Muchos Puntos',
          mensaje: `${clientesConMuchosPuntos.length} clientes tienen más de 100 puntos`,
          fecha: hoy,
          prioridad: 'baja',
          accion: 'promocionar_canjes'
        });
      }

    } catch (error) {
      console.error('Error al generar notificaciones:', error);
    }

    return notificaciones.sort((a, b) => {
      const prioridadOrder = { 'alta': 3, 'media': 2, 'baja': 1 };
      return prioridadOrder[b.prioridad] - prioridadOrder[a.prioridad];
    });
  };

  const manejarAccionNotificacion = (notificacion) => {
    onClose(); // Cerrar el modal primero
    
    setTimeout(() => {
      switch (notificacion.accion) {
        case 'ver_clientes_inactivos':
          Alert.alert(
            'Clientes Inactivos',
            'Ve a la sección "Ver Clientes" para revisar quiénes no han visitado recientemente y considera enviarles una promoción.',
            [{ text: 'Entendido' }]
          );
          break;
          
        case 'ver_campañas':
          Alert.alert(
            'Gestionar Campañas',
            'Ve a "Gestionar Campañas" para extender la fecha o crear una nueva campaña.',
            [{ text: 'Entendido' }]
          );
          break;
          
        case 'ver_estadisticas':
          Alert.alert(
            '¡Felicitaciones!',
            'Ve a "Estadísticas" para ver el crecimiento detallado de tu negocio.',
            [{ text: 'Ver Estadísticas' }]
          );
          break;
          
        case 'ver_mesero':
          Alert.alert(
            'Revisar Operaciones',
            'Asegúrate de que los meseros estén registrando correctamente los consumos.',
            [{ text: 'Entendido' }]
          );
          break;
          
        case 'promocionar_canjes':
          Alert.alert(
            'Oportunidad de Canjes',
            'Considera promocionar los canjes de premios entre tus clientes más fieles.',
            [{ text: 'Buena Idea' }]
          );
          break;
          
        default:
          Alert.alert('Información', notificacion.mensaje);
      }
    }, 300);
  };

  const obtenerIconoPorTipo = (tipo) => {
    switch (tipo) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const obtenerColorPorTipo = (tipo) => {
    switch (tipo) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      case 'info': return '#007AFF';
      default: return '#6c757d';
    }
  };

  const obtenerColorPorPrioridad = (prioridad) => {
    switch (prioridad) {
      case 'alta': return '#dc3545';
      case 'media': return '#ffc107';
      case 'baja': return '#28a745';
      default: return '#6c757d';
    }
  };

  const renderNotificacion = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificacionCard, { borderLeftColor: obtenerColorPorTipo(item.tipo) }]}
      onPress={() => manejarAccionNotificacion(item)}
    >
      <View style={styles.notificacionHeader}>
        <View style={styles.iconoTitulo}>
          <Text style={styles.icono}>{obtenerIconoPorTipo(item.tipo)}</Text>
          <Text style={styles.titulo}>{item.titulo}</Text>
        </View>
        <View style={[styles.prioridadBadge, { backgroundColor: obtenerColorPorPrioridad(item.prioridad) }]}>
          <Text style={styles.prioridadTexto}>{item.prioridad.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.mensaje}>{item.mensaje}</Text>
      <Text style={styles.fecha}>
        {item.fecha.toLocaleDateString('es-ES')} - {item.fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </Text>
      {item.accion && (
        <Text style={styles.accionTexto}>Toca para más información</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitulo}>Centro de Notificaciones</Text>
            <TouchableOpacity
              style={styles.cerrarBoton}
              onPress={onClose}
            >
              <Text style={styles.cerrarTexto}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={notificaciones}
            renderItem={renderNotificacion}
            keyExtractor={(item) => item.id}
            style={styles.lista}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcono}>🔔</Text>
                <Text style={styles.emptyTexto}>
                  {loading ? 'Cargando notificaciones...' : 'No hay notificaciones nuevas'}
                </Text>
              </View>
            )}
            refreshing={loading}
            onRefresh={cargarNotificaciones}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#8B4513',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cerrarBoton: {
    padding: 5,
  },
  cerrarTexto: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  lista: {
    maxHeight: 400,
  },
  notificacionCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconoTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icono: {
    fontSize: 20,
    marginRight: 10,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  prioridadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  prioridadTexto: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  mensaje: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  fecha: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  accionTexto: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcono: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTexto: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default NotificationCenter;
