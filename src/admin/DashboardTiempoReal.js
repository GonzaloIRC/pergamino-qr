// src/admin/DashboardTiempoReal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { db } from '../services/firebaseClient';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const DashboardTiempoReal = ({ navigation }) => {
  const [data, setData] = useState({
    ventasHoy: 0,
    clientesHoy: 0,
    puntosOtorgadosHoy: 0,
    consumosRecientes: [],
    topClientes: [],
    estadoGeneral: {}
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarDashboard();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarDashboard = async () => {
    try {
      const hoy = new Date();
      const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      
      // Cargar datos en paralelo
      const [
        clientesSnapshot,
        consumosSnapshot,
        canjesSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'clientes')),
        getDocs(collection(db, 'consumos')),
        getDocs(collection(db, 'canjes'))
      ]);

      const clientes = clientesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const consumos = consumosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const canjes = canjesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calcular métricas del día
      const consumosHoy = consumos.filter(consumo => {
        const fechaConsumo = consumo.fecha?.toDate ? 
          consumo.fecha.toDate() : 
          new Date(consumo.fecha);
        return fechaConsumo >= inicioHoy;
      });

      const clientesHoy = clientes.filter(cliente => {
        const fechaRegistro = cliente.fechaRegistro?.toDate ? 
          cliente.fechaRegistro.toDate() : 
          new Date(cliente.fechaRegistro);
        return fechaRegistro >= inicioHoy;
      });

      const ventasHoy = consumosHoy.reduce((sum, consumo) => sum + (consumo.monto || 0), 0);
      const puntosHoy = consumosHoy.reduce((sum, consumo) => sum + (consumo.puntosOtorgados || 0), 0);

      // Top clientes por puntos
      const topClientes = clientes
        .sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
        .slice(0, 5);

      // Consumos más recientes
      const consumosRecientes = consumos
        .sort((a, b) => {
          const fechaA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
          const fechaB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
          return fechaB - fechaA;
        })
        .slice(0, 5);

      // Estado general
      const estadoGeneral = {
        totalClientes: clientes.length,
        totalConsumos: consumos.length,
        totalCanjes: canjes.length,
        promedioCompra: consumos.length > 0 ? 
          consumos.reduce((sum, c) => sum + (c.monto || 0), 0) / consumos.length : 0,
        clientesActivos: clientes.filter(c => (c.puntos || 0) > 0).length,
        puntosCirculacion: clientes.reduce((sum, c) => sum + (c.puntos || 0), 0)
      };

      setData({
        ventasHoy,
        clientesHoy: clientesHoy.length,
        puntosOtorgadosHoy: puntosHoy,
        consumosRecientes,
        topClientes,
        estadoGeneral
      });

    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDashboard();
    setRefreshing(false);
  };

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(cantidad);
  };

  const obtenerSaludoSegunHora = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{obtenerSaludoSegunHora()}</Text>
        <Text style={styles.title}>Dashboard en Tiempo Real</Text>
        <Text style={styles.subtitle}>
          Última actualización: {new Date().toLocaleTimeString('es-ES')}
        </Text>
      </View>

      {/* Métricas del día */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Hoy</Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { borderLeftColor: '#28a745' }]}>
            <Text style={styles.metricValue}>{formatearMoneda(data.ventasHoy)}</Text>
            <Text style={styles.metricLabel}>Ventas</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: '#007AFF' }]}>
            <Text style={styles.metricValue}>{data.clientesHoy}</Text>
            <Text style={styles.metricLabel}>Nuevos Clientes</Text>
          </View>
          <View style={[styles.metricCard, { borderLeftColor: '#ff6b35' }]}>
            <Text style={styles.metricValue}>{data.puntosOtorgadosHoy}</Text>
            <Text style={styles.metricLabel}>Puntos Otorgados</Text>
          </View>
        </View>
      </View>

      {/* Estado General */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏪 Estado General</Text>
        <View style={styles.estadoGrid}>
          <View style={styles.estadoItem}>
            <Text style={styles.estadoValue}>{data.estadoGeneral.totalClientes}</Text>
            <Text style={styles.estadoLabel}>Total Clientes</Text>
          </View>
          <View style={styles.estadoItem}>
            <Text style={styles.estadoValue}>{data.estadoGeneral.clientesActivos}</Text>
            <Text style={styles.estadoLabel}>Activos</Text>
          </View>
          <View style={styles.estadoItem}>
            <Text style={styles.estadoValue}>{formatearMoneda(data.estadoGeneral.promedioCompra)}</Text>
            <Text style={styles.estadoLabel}>Promedio Compra</Text>
          </View>
          <View style={styles.estadoItem}>
            <Text style={styles.estadoValue}>{data.estadoGeneral.puntosCirculacion}</Text>
            <Text style={styles.estadoLabel}>Puntos en Circulación</Text>
          </View>
        </View>
      </View>

      {/* Top Clientes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏆 Top Clientes</Text>
        {data.topClientes.map((cliente, index) => (
          <View key={cliente.id} style={styles.clienteItem}>
            <View style={styles.clienteRank}>
              <Text style={styles.rankNumber}>{index + 1}</Text>
            </View>
            <View style={styles.clienteInfo}>
              <Text style={styles.clienteNombre}>{cliente.nombre}</Text>
              <Text style={styles.clienteEmail}>{cliente.email}</Text>
            </View>
            <View style={styles.clientePuntos}>
              <Text style={styles.puntosValue}>{cliente.puntos || 0}</Text>
              <Text style={styles.puntosLabel}>puntos</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Actividad Reciente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕒 Actividad Reciente</Text>
        {data.consumosRecientes.map((consumo, index) => (
          <View key={index} style={styles.actividadItem}>
            <View style={styles.actividadDot} />
            <View style={styles.actividadContent}>
              <Text style={styles.actividadTexto}>
                Consumo de {formatearMoneda(consumo.monto || 0)}
              </Text>
              <Text style={styles.actividadFecha}>
                {consumo.fecha?.toDate ? 
                  consumo.fecha.toDate().toLocaleString('es-ES') : 
                  new Date(consumo.fecha).toLocaleString('es-ES')
                }
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Indicadores de Salud */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Indicadores de Salud</Text>
        <View style={styles.indicadoresGrid}>
          <View style={[styles.indicadorCard, { 
            backgroundColor: data.ventasHoy > 50 ? '#d4edda' : '#fff3cd' 
          }]}>
            <Text style={styles.indicadorEmoji}>
              {data.ventasHoy > 50 ? '🟢' : '🟡'}
            </Text>
            <Text style={styles.indicadorTexto}>
              Ventas del día {data.ventasHoy > 50 ? 'excelentes' : 'normales'}
            </Text>
          </View>
          
          <View style={[styles.indicadorCard, { 
            backgroundColor: data.estadoGeneral.clientesActivos > data.estadoGeneral.totalClientes * 0.5 ? '#d4edda' : '#f8d7da' 
          }]}>
            <Text style={styles.indicadorEmoji}>
              {data.estadoGeneral.clientesActivos > data.estadoGeneral.totalClientes * 0.5 ? '🟢' : '🔴'}
            </Text>
            <Text style={styles.indicadorTexto}>
              Engagement de clientes {data.estadoGeneral.clientesActivos > data.estadoGeneral.totalClientes * 0.5 ? 'alto' : 'bajo'}
            </Text>
          </View>
        </View>
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
    padding: 25,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 18,
    color: 'white',
    opacity: 0.9,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  section: {
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 5,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  estadoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  estadoItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  estadoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  estadoLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  clienteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  clienteRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clienteEmail: {
    fontSize: 12,
    color: '#666',
  },
  clientePuntos: {
    alignItems: 'center',
  },
  puntosValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  puntosLabel: {
    fontSize: 10,
    color: '#666',
  },
  actividadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  actividadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B4513',
    marginRight: 15,
  },
  actividadContent: {
    flex: 1,
  },
  actividadTexto: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  actividadFecha: {
    fontSize: 12,
    color: '#666',
  },
  indicadoresGrid: {
    gap: 10,
  },
  indicadorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  indicadorEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  indicadorTexto: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});

export default DashboardTiempoReal;
