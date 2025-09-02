// src/admin/Estadisticas.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { db } from '../services/firebaseClient';
import { 
  collection, 
  getDocs, 
  query,
  where,
  orderBy,
  limit 
} from 'firebase/firestore';

const Estadisticas = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    totalClientes: 0,
    totalConsumos: 0,
    montoTotalVentas: 0,
    puntosDistribuidos: 0,
    consumosHoy: 0,
    clientesActivos: 0,
    promedioConsumoPorCliente: 0,
    clienteMasFiel: null
  });
  const [clientesTop, setClientesTop] = useState([]);
  const [consumosRecientes, setConsumosRecientes] = useState([]);
  const [periodo, setPeriodo] = useState('todo'); // 'hoy', 'semana', 'mes', 'todo'

  useEffect(() => {
    cargarEstadisticas();
  }, [periodo]);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarEstadisticasGenerales(),
        cargarClientesTop(),
        cargarConsumosRecientes()
      ]);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const cargarEstadisticasGenerales = async () => {
    try {
      // Obtener todos los clientes
      const clientesSnapshot = await getDocs(collection(db, 'clientes'));
      const totalClientes = clientesSnapshot.size;
      
      let totalPuntos = 0;
      let clienteMasFiel = null;
      let maxPuntos = 0;
      
      clientesSnapshot.docs.forEach(doc => {
        const cliente = doc.data();
        const puntos = cliente.puntos || 0;
        totalPuntos += puntos;
        
        if (puntos > maxPuntos) {
          maxPuntos = puntos;
          clienteMasFiel = { ...cliente, id: doc.id };
        }
      });

      // Obtener consumos según el período
      const ahora = new Date();
      let fechaInicio;
      
      switch (periodo) {
        case 'hoy':
          fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
          break;
        case 'semana':
          fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'mes':
          fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
          break;
        default:
          fechaInicio = null;
      }

      let consumosQuery;
      if (fechaInicio) {
        consumosQuery = query(
          collection(db, 'consumos'),
          where('fecha', '>=', fechaInicio),
          orderBy('fecha', 'desc')
        );
      } else {
        consumosQuery = query(collection(db, 'consumos'), orderBy('fecha', 'desc'));
      }

      const consumosSnapshot = await getDocs(consumosQuery);
      const totalConsumos = consumosSnapshot.size;
      
      let montoTotal = 0;
      let puntosDistribuidos = 0;
      const clientesConConsumos = new Set();

      consumosSnapshot.docs.forEach(doc => {
        const consumo = doc.data();
        montoTotal += consumo.monto || 0;
        puntosDistribuidos += consumo.puntosGanados || 0;
        if (consumo.clienteId) {
          clientesConConsumos.add(consumo.clienteId);
        }
      });

      // Consumos de hoy específicamente
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
      const consumosHoyQuery = query(
        collection(db, 'consumos'),
        where('fecha', '>=', hoy)
      );
      const consumosHoySnapshot = await getDocs(consumosHoyQuery);

      const promedioConsumoPorCliente = totalClientes > 0 ? montoTotal / totalClientes : 0;

      setEstadisticas({
        totalClientes,
        totalConsumos,
        montoTotalVentas: montoTotal,
        puntosDistribuidos: totalPuntos,
        consumosHoy: consumosHoySnapshot.size,
        clientesActivos: clientesConConsumos.size,
        promedioConsumoPorCliente,
        clienteMasFiel
      });

    } catch (error) {
      console.error('Error al cargar estadísticas generales:', error);
    }
  };

  const cargarClientesTop = async () => {
    try {
      const clientesSnapshot = await getDocs(collection(db, 'clientes'));
      const clientes = clientesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ordenar por puntos de mayor a menor
      const clientesOrdenados = clientes
        .sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
        .slice(0, 5);

      setClientesTop(clientesOrdenados);
    } catch (error) {
      console.error('Error al cargar clientes top:', error);
    }
  };

  const cargarConsumosRecientes = async () => {
    try {
      const q = query(
        collection(db, 'consumos'),
        orderBy('fecha', 'desc'),
        limit(10)
      );
      const consumosSnapshot = await getDocs(q);
      const consumos = [];

      for (const consumoDoc of consumosSnapshot.docs) {
        const consumoData = consumoDoc.data();
        
        // Obtener información del cliente
        let nombreCliente = 'Cliente no encontrado';
        if (consumoData.clienteId) {
          try {
            const clienteSnapshot = await getDocs(
              query(collection(db, 'clientes'), where('id', '==', consumoData.clienteId))
            );
            if (!clienteSnapshot.empty) {
              nombreCliente = clienteSnapshot.docs[0].data().nombre;
            }
          } catch (error) {
            console.log('Error al obtener cliente:', error);
          }
        }

        consumos.push({
          id: consumoDoc.id,
          ...consumoData,
          nombreCliente
        });
      }

      setConsumosRecientes(consumos);
    } catch (error) {
      console.error('Error al cargar consumos recientes:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarEstadisticas();
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto);
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

  const getPeriodoLabel = () => {
    switch (periodo) {
      case 'hoy': return 'Hoy';
      case 'semana': return 'Última semana';
      case 'mes': return 'Este mes';
      default: return 'Todos los tiempos';
    }
  };

  const renderEstadisticaCard = (titulo, valor, icono = '📊', color = '#8B4513') => (
    <View style={[styles.estadisticaCard, { borderLeftColor: color }]}>
      <Text style={styles.estadisticaIcono}>{icono}</Text>
      <View style={styles.estadisticaContent}>
        <Text style={styles.estadisticaTitulo}>{titulo}</Text>
        <Text style={styles.estadisticaValor}>{valor}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.titulo}>Estadísticas</Text>
        <Text style={styles.subtitulo}>{getPeriodoLabel()}</Text>
      </View>

      {/* Selector de período */}
      <View style={styles.periodoSelector}>
        {['hoy', 'semana', 'mes', 'todo'].map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodoBoton,
              periodo === p && styles.periodoBotonActivo
            ]}
            onPress={() => setPeriodo(p)}
          >
            <Text style={[
              styles.periodoTexto,
              periodo === p && styles.periodoTextoActivo
            ]}>
              {p === 'hoy' ? 'Hoy' : 
               p === 'semana' ? 'Semana' : 
               p === 'mes' ? 'Mes' : 'Todo'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Estadísticas principales */}
      <View style={styles.estadisticasContainer}>
        {renderEstadisticaCard(
          'Total Clientes', 
          estadisticas.totalClientes.toString(), 
          '👥', 
          '#007AFF'
        )}
        
        {renderEstadisticaCard(
          'Total Consumos', 
          estadisticas.totalConsumos.toString(), 
          '🛒', 
          '#28a745'
        )}
        
        {renderEstadisticaCard(
          'Ventas Totales', 
          formatearMoneda(estadisticas.montoTotalVentas), 
          '💰', 
          '#ffc107'
        )}
        
        {renderEstadisticaCard(
          'Puntos Distribuidos', 
          estadisticas.puntosDistribuidos.toString(), 
          '⭐', 
          '#8B4513'
        )}
        
        {renderEstadisticaCard(
          'Consumos Hoy', 
          estadisticas.consumosHoy.toString(), 
          '📅', 
          '#dc3545'
        )}
        
        {renderEstadisticaCard(
          'Clientes Activos', 
          estadisticas.clientesActivos.toString(), 
          '🔥', 
          '#ff6b35'
        )}
      </View>

      {/* Cliente más fiel */}
      {estadisticas.clienteMasFiel && (
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>🏆 Cliente Más Fiel</Text>
          <View style={styles.clienteFielCard}>
            <Text style={styles.clienteFielNombre}>
              {estadisticas.clienteMasFiel.nombre}
            </Text>
            <Text style={styles.clienteFielPuntos}>
              {estadisticas.clienteMasFiel.puntos || 0} puntos
            </Text>
          </View>
        </View>
      )}

      {/* Top 5 clientes */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>🏅 Top 5 Clientes</Text>
        {clientesTop.map((cliente, index) => (
          <View key={cliente.id} style={styles.topClienteItem}>
            <View style={styles.topClienteRanking}>
              <Text style={styles.topClienteNumero}>{index + 1}</Text>
            </View>
            <View style={styles.topClienteInfo}>
              <Text style={styles.topClienteNombre}>{cliente.nombre}</Text>
              <Text style={styles.topClientePuntos}>{cliente.puntos || 0} puntos</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Consumos recientes */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>🕒 Consumos Recientes</Text>
        {consumosRecientes.map((consumo) => (
          <View key={consumo.id} style={styles.consumoRecienteItem}>
            <View style={styles.consumoRecienteInfo}>
              <Text style={styles.consumoRecienteCliente}>
                {consumo.nombreCliente}
              </Text>
              <Text style={styles.consumoRecienteFecha}>
                {formatearFecha(consumo.fecha)}
              </Text>
            </View>
            <View style={styles.consumoRecienteMonto}>
              <Text style={styles.consumoRecienteValor}>
                {formatearMoneda(consumo.monto || 0)}
              </Text>
              <Text style={styles.consumoRecientePuntos}>
                +{consumo.puntosGanados || 0} pts
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Promedio por cliente */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>📈 Métricas Adicionales</Text>
        {renderEstadisticaCard(
          'Promedio por Cliente', 
          formatearMoneda(estadisticas.promedioConsumoPorCliente), 
          '📊', 
          '#6f42c1'
        )}
      </View>
    </ScrollView>
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
  subtitulo: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  periodoSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 8,
    padding: 4,
    elevation: 2,
  },
  periodoBoton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodoBotonActivo: {
    backgroundColor: '#8B4513',
  },
  periodoTexto: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodoTextoActivo: {
    color: 'white',
    fontWeight: 'bold',
  },
  estadisticasContainer: {
    paddingHorizontal: 15,
  },
  estadisticaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  estadisticaIcono: {
    fontSize: 24,
    marginRight: 15,
  },
  estadisticaContent: {
    flex: 1,
  },
  estadisticaTitulo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  estadisticaValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seccion: {
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  clienteFielCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  clienteFielNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  clienteFielPuntos: {
    fontSize: 16,
    color: '#8B4513',
    fontWeight: '600',
  },
  topClienteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  topClienteRanking: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  topClienteNumero: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  topClienteInfo: {
    flex: 1,
  },
  topClienteNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  topClientePuntos: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  consumoRecienteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  consumoRecienteInfo: {
    flex: 1,
  },
  consumoRecienteCliente: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  consumoRecienteFecha: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  consumoRecienteMonto: {
    alignItems: 'flex-end',
  },
  consumoRecienteValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  consumoRecientePuntos: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 2,
  },
});

export default Estadisticas;
