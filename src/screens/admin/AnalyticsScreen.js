import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { db } from '../../services/firebaseClient';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';

export default function AnalyticsScreen() {
  const [stats, setStats] = useState({
    totalClientes: 0,
    clientesActivos: 0,
    canjesUltimaSemana: 0,
    acumulacionesUltimaSemana: 0,
    promedioPuntos: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Calcular fechas para el rango seleccionado
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }
      
      const startTimestamp = Timestamp.fromDate(startDate);
      
      // Contar clientes totales
      const clientesQuery = query(collection(db, 'Clientes'));
      const clientesSnap = await getDocs(clientesQuery);
      const totalClientes = clientesSnap.size;
      
      // Contar clientes activos (con actividad en el rango)
      const historialQuery = query(
        collection(db, 'Historial'),
        where('ts', '>=', startTimestamp),
        orderBy('ts', 'desc')
      );
      const historialSnap = await getDocs(historialQuery);
      
      // Obtener DNIs únicos
      const uniqueDnis = new Set();
      let canjesCount = 0;
      let acumulacionesCount = 0;
      
      historialSnap.forEach(doc => {
        const data = doc.data();
        if (data.dni) uniqueDnis.add(data.dni);
        
        if (data.tipo === 'canje') canjesCount++;
        if (data.tipo === 'acumulacion') acumulacionesCount++;
      });
      
      // Actualizar estadísticas
      setStats({
        totalClientes,
        clientesActivos: uniqueDnis.size,
        canjesUltimaSemana: canjesCount,
        acumulacionesUltimaSemana: acumulacionesCount,
        // Esto es un placeholder, necesitaríamos más datos para un ARPU real
        promedioPuntos: totalClientes > 0 ? Math.round(canjesCount * 100 / totalClientes) / 100 : 0
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRangeText = () => {
    switch (timeRange) {
      case 'week': return 'última semana';
      case 'month': return 'último mes';
      case 'year': return 'último año';
      default: return 'última semana';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Panel de Analytics</Text>
      
      <View style={styles.rangeSelectorContainer}>
        <TouchableOpacity
          style={[styles.rangeButton, timeRange === 'week' && styles.rangeButtonActive]}
          onPress={() => setTimeRange('week')}
        >
          <Text style={[styles.rangeButtonText, timeRange === 'week' && styles.rangeButtonTextActive]}>Semana</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rangeButton, timeRange === 'month' && styles.rangeButtonActive]}
          onPress={() => setTimeRange('month')}
        >
          <Text style={[styles.rangeButtonText, timeRange === 'month' && styles.rangeButtonTextActive]}>Mes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rangeButton, timeRange === 'year' && styles.rangeButtonActive]}
          onPress={() => setTimeRange('year')}
        >
          <Text style={[styles.rangeButtonText, timeRange === 'year' && styles.rangeButtonTextActive]}>Año</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      ) : (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalClientes}</Text>
            <Text style={styles.statLabel}>Clientes Totales</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.clientesActivos}</Text>
            <Text style={styles.statLabel}>Clientes Activos ({getRangeText()})</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.canjesUltimaSemana}</Text>
            <Text style={styles.statLabel}>Canjes ({getRangeText()})</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.acumulacionesUltimaSemana}</Text>
            <Text style={styles.statLabel}>Acumulaciones ({getRangeText()})</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.promedioPuntos}</Text>
            <Text style={styles.statLabel}>Canjes por Cliente</Text>
          </View>
        </View>
      )}
      
      <View style={styles.exportContainer}>
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>Exportar CSV</Text>
        </TouchableOpacity>
        <Text style={styles.exportNote}>
          Esta función exportará los datos de clientes y transacciones en formato CSV.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 20,
  },
  rangeSelectorContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#4630EB',
  },
  rangeButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  rangeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    width: '48%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4630EB',
  },
  statLabel: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
  exportContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
  },
  exportButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  exportNote: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  }
});
