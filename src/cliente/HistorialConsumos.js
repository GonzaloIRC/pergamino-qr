// src/cliente/HistorialConsumos.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { db } from '../../firebase/firebaseConfig';
import { 
  collection, 
  getDocs, 
  query,
  where,
  orderBy 
} from 'firebase/firestore';

const HistorialConsumos = ({ route, navigation }) => {
  const { clienteId } = route.params;
  const [cliente, setCliente] = useState(null);
  const [consumos, setConsumos] = useState([]);
  const [canjes, setCanjes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'consumos', 'canjes'

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarCliente(),
        cargarConsumos(),
        cargarCanjes()
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
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

  const cargarConsumos = async () => {
    try {
      const q = query(
        collection(db, 'consumos'),
        where('clienteId', '==', clienteId),
        orderBy('fecha', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const consumosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        tipo: 'consumo',
        ...doc.data()
      }));
      
      setConsumos(consumosData);
    } catch (error) {
      console.error('Error al cargar consumos:', error);
    }
  };

  const cargarCanjes = async () => {
    try {
      const q = query(
        collection(db, 'canjes'),
        where('clienteId', '==', clienteId),
        orderBy('fecha', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const canjesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        tipo: 'canje',
        ...doc.data()
      }));
      
      setCanjes(canjesData);
    } catch (error) {
      console.error('Error al cargar canjes:', error);
    }
  };

  const obtenerHistorialFiltrado = () => {
    let historial = [];
    
    switch (filtro) {
      case 'consumos':
        historial = [...consumos];
        break;
      case 'canjes':
        historial = [...canjes];
        break;
      default:
        historial = [...consumos, ...canjes];
        break;
    }

    // Ordenar por fecha descendente
    return historial.sort((a, b) => {
      const fechaA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
      const fechaB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
      return fechaB - fechaA;
    });
  };

  const calcularEstadisticas = () => {
    const totalConsumos = consumos.length;
    const totalCanjes = canjes.length;
    const montoTotal = consumos.reduce((sum, consumo) => sum + (consumo.monto || 0), 0);
    const puntosGanados = consumos.reduce((sum, consumo) => sum + (consumo.puntosGanados || 0), 0);
    const puntosCanjeados = canjes.reduce((sum, canje) => sum + (canje.puntosCanjeados || 0), 0);

    return {
      totalConsumos,
      totalCanjes,
      montoTotal,
      puntosGanados,
      puntosCanjeados,
      puntosActuales: cliente?.puntos || 0
    };
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const formatearFecha = (timestamp) => {
    if (!timestamp) return 'Sin fecha';
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
  };

  const renderItem = ({ item }) => {
    if (item.tipo === 'consumo') {
      return (
        <View style={[styles.itemCard, styles.consumoCard]}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTipo}>🛒 Consumo</Text>
            <Text style={styles.itemFecha}>{formatearFecha(item.fecha)}</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemMonto}>{formatearMoneda(item.monto || 0)}</Text>
            <Text style={styles.itemPuntos}>+{item.puntosGanados || 0} puntos</Text>
            {item.mesa && (
              <Text style={styles.itemDetalle}>Mesa: {item.mesa}</Text>
            )}
          </View>
        </View>
      );
    } else {
      return (
        <View style={[styles.itemCard, styles.canjeCard]}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTipo}>🎁 Canje</Text>
            <Text style={styles.itemFecha}>{formatearFecha(item.fecha)}</Text>
          </View>
          <View style={styles.itemContent}>
            <Text style={styles.itemPremio}>{item.premioNombre}</Text>
            <Text style={styles.itemPuntosUsados}>-{item.puntosCanjeados || 0} puntos</Text>
            <Text style={[styles.itemEstado, item.estado === 'entregado' ? styles.estadoEntregado : styles.estadoPendiente]}>
              {item.estado === 'entregado' ? 'Entregado' : 'Pendiente'}
            </Text>
          </View>
        </View>
      );
    }
  };

  const estadisticas = calcularEstadisticas();
  const historialFiltrado = obtenerHistorialFiltrado();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mi Historial</Text>
        {cliente && (
          <Text style={styles.nombreCliente}>{cliente.nombre}</Text>
        )}
      </View>

      {/* Estadísticas */}
      <View style={styles.estadisticasContainer}>
        <View style={styles.estadisticaCard}>
          <Text style={styles.estadisticaNumero}>{estadisticas.puntosActuales}</Text>
          <Text style={styles.estadisticaLabel}>Puntos Actuales</Text>
        </View>
        <View style={styles.estadisticaCard}>
          <Text style={styles.estadisticaNumero}>{estadisticas.totalConsumos}</Text>
          <Text style={styles.estadisticaLabel}>Consumos</Text>
        </View>
        <View style={styles.estadisticaCard}>
          <Text style={styles.estadisticaNumero}>{formatearMoneda(estadisticas.montoTotal)}</Text>
          <Text style={styles.estadisticaLabel}>Total Gastado</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'consumos', label: 'Consumos' },
          { key: 'canjes', label: 'Canjes' }
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filtroBoton,
              filtro === f.key && styles.filtroBotonActivo
            ]}
            onPress={() => setFiltro(f.key)}
          >
            <Text style={[
              styles.filtroTexto,
              filtro === f.key && styles.filtroTextoActivo
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de historial */}
      <FlatList
        data={historialFiltrado}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.tipo}-${item.id}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Cargando historial...' : 'No hay actividad registrada'}
            </Text>
          </View>
        )}
      />

      {/* Resumen adicional */}
      <View style={styles.resumenContainer}>
        <Text style={styles.resumenTitulo}>Resumen Total</Text>
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Puntos ganados:</Text>
          <Text style={styles.resumenValor}>+{estadisticas.puntosGanados}</Text>
        </View>
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Puntos canjeados:</Text>
          <Text style={styles.resumenValor}>-{estadisticas.puntosCanjeados}</Text>
        </View>
        <View style={[styles.resumenRow, styles.resumenTotal]}>
          <Text style={styles.resumenLabelTotal}>Puntos actuales:</Text>
          <Text style={styles.resumenValorTotal}>{estadisticas.puntosActuales}</Text>
        </View>
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
  nombreCliente: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  estadisticasContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  estadisticaCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  estadisticaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  estadisticaLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  filtrosContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 10,
    gap: 10,
  },
  filtroBoton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },
  filtroBotonActivo: {
    backgroundColor: '#8B4513',
  },
  filtroTexto: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filtroTextoActivo: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 15,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  consumoCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  canjeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTipo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  itemFecha: {
    fontSize: 12,
    color: '#999',
  },
  itemContent: {
    gap: 4,
  },
  itemMonto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  itemPuntos: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  itemPuntosUsados: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
  },
  itemDetalle: {
    fontSize: 12,
    color: '#666',
  },
  itemPremio: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B4513',
  },
  itemEstado: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  estadoEntregado: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  estadoPendiente: {
    backgroundColor: '#fff3cd',
    color: '#856404',
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
  resumenContainer: {
    backgroundColor: 'white',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },
  resumenTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  resumenTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 4,
  },
  resumenLabel: {
    fontSize: 14,
    color: '#666',
  },
  resumenLabelTotal: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  resumenValor: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  resumenValorTotal: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: 'bold',
  },
});

export default HistorialConsumos;
