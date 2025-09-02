// src/admin/ExportarDatos.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  ScrollView,
} from 'react-native';
import { db } from '../services/firebaseClient';
import { 
  collection, 
  getDocs, 
  query,
  orderBy,
  where 
} from 'firebase/firestore';

const ExportarDatos = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const exportarClientes = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'clientes'), orderBy('fechaRegistro', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let csvContent = "Nombre,DNI,Teléfono,Email,Puntos,Fecha Registro,Total Visitas\n";
      
      querySnapshot.docs.forEach(doc => {
        const cliente = doc.data();
        const fechaRegistro = cliente.fechaRegistro?.toDate ? 
          cliente.fechaRegistro.toDate().toLocaleDateString('es-ES') : 
          'Sin fecha';
        
        csvContent += `"${cliente.nombre || ''}","${cliente.dni || ''}","${cliente.telefono || ''}","${cliente.email || ''}",${cliente.puntos || 0},"${fechaRegistro}",${cliente.totalVisitas || 0}\n`;
      });

      await compartirArchivo(csvContent, 'clientes', 'Lista completa de clientes registrados');
    } catch (error) {
      console.error('Error al exportar clientes:', error);
      Alert.alert('Error', 'No se pudieron exportar los datos de clientes');
    } finally {
      setLoading(false);
    }
  };

  const exportarConsumos = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'consumos'), orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let csvContent = "Cliente ID,Monto,Puntos Ganados,Fecha,Mesa\n";
      
      querySnapshot.docs.forEach(doc => {
        const consumo = doc.data();
        const fecha = consumo.fecha?.toDate ? 
          consumo.fecha.toDate().toLocaleString('es-ES') : 
          'Sin fecha';
        
        csvContent += `"${consumo.clienteId || ''}",${consumo.monto || 0},${consumo.puntosGanados || 0},"${fecha}","${consumo.mesa || ''}"\n`;
      });

      await compartirArchivo(csvContent, 'consumos', 'Historial completo de consumos');
    } catch (error) {
      console.error('Error al exportar consumos:', error);
      Alert.alert('Error', 'No se pudieron exportar los datos de consumos');
    } finally {
      setLoading(false);
    }
  };

  const exportarCampañas = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'campañas'), orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let csvContent = "Nombre,Descripción,Puntos Requeridos,Premio,Fecha Inicio,Fecha Fin,Activa\n";
      
      querySnapshot.docs.forEach(doc => {
        const campaña = doc.data();
        
        csvContent += `"${campaña.nombre || ''}","${campaña.descripcion || ''}",${campaña.puntosRequeridos || 0},"${campaña.premio || ''}","${campaña.fechaInicio || ''}","${campaña.fechaFin || ''}",${campaña.activa ? 'Sí' : 'No'}\n`;
      });

      await compartirArchivo(csvContent, 'campañas', 'Lista de campañas de fidelización');
    } catch (error) {
      console.error('Error al exportar campañas:', error);
      Alert.alert('Error', 'No se pudieron exportar los datos de campañas');
    } finally {
      setLoading(false);
    }
  };

  const exportarCanjes = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'canjes'), orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let csvContent = "Cliente ID,Cliente Nombre,Premio,Puntos Canjeados,Fecha,Estado\n";
      
      querySnapshot.docs.forEach(doc => {
        const canje = doc.data();
        const fecha = canje.fecha?.toDate ? 
          canje.fecha.toDate().toLocaleString('es-ES') : 
          'Sin fecha';
        
        csvContent += `"${canje.clienteId || ''}","${canje.clienteNombre || ''}","${canje.premioNombre || ''}",${canje.puntosCanjeados || 0},"${fecha}","${canje.estado || ''}"\n`;
      });

      await compartirArchivo(csvContent, 'canjes', 'Historial de canjes de premios');
    } catch (error) {
      console.error('Error al exportar canjes:', error);
      Alert.alert('Error', 'No se pudieron exportar los datos de canjes');
    } finally {
      setLoading(false);
    }
  };

  const exportarResumenCompleto = async () => {
    setLoading(true);
    try {
      // Obtener datos de todas las colecciones
      const [clientesSnap, consumosSnap, campañasSnap, canjesSnap] = await Promise.all([
        getDocs(query(collection(db, 'clientes'), orderBy('fechaRegistro', 'desc'))),
        getDocs(query(collection(db, 'consumos'), orderBy('fecha', 'desc'))),
        getDocs(query(collection(db, 'campañas'), orderBy('fechaCreacion', 'desc'))),
        getDocs(query(collection(db, 'canjes'), orderBy('fecha', 'desc')))
      ]);

      // Calcular estadísticas
      const totalClientes = clientesSnap.size;
      const totalConsumos = consumosSnap.size;
      const totalCampañas = campañasSnap.size;
      const totalCanjes = canjesSnap.size;

      let montoTotal = 0;
      let puntosDistribuidos = 0;
      consumosSnap.docs.forEach(doc => {
        const consumo = doc.data();
        montoTotal += consumo.monto || 0;
        puntosDistribuidos += consumo.puntosGanados || 0;
      });

      let puntosCanjeados = 0;
      canjesSnap.docs.forEach(doc => {
        const canje = doc.data();
        puntosCanjeados += canje.puntosCanjeados || 0;
      });

      // Crear resumen
      let resumenContent = `RESUMEN GENERAL - PERGAMINO APP\n`;
      resumenContent += `Fecha de exportación: ${new Date().toLocaleString('es-ES')}\n\n`;
      resumenContent += `ESTADÍSTICAS GENERALES:\n`;
      resumenContent += `Total de clientes: ${totalClientes}\n`;
      resumenContent += `Total de consumos: ${totalConsumos}\n`;
      resumenContent += `Total de campañas: ${totalCampañas}\n`;
      resumenContent += `Total de canjes: ${totalCanjes}\n`;
      resumenContent += `Monto total de ventas: $${montoTotal.toLocaleString()}\n`;
      resumenContent += `Puntos distribuidos: ${puntosDistribuidos}\n`;
      resumenContent += `Puntos canjeados: ${puntosCanjeados}\n`;
      resumenContent += `Puntos en circulación: ${puntosDistribuidos - puntosCanjeados}\n\n`;

      // Top 5 clientes
      const clientesConPuntos = clientesSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
        .slice(0, 5);

      resumenContent += `TOP 5 CLIENTES:\n`;
      clientesConPuntos.forEach((cliente, index) => {
        resumenContent += `${index + 1}. ${cliente.nombre} - ${cliente.puntos || 0} puntos\n`;
      });

      await compartirArchivo(resumenContent, 'resumen_completo', 'Resumen completo de la aplicación', 'txt');
    } catch (error) {
      console.error('Error al exportar resumen:', error);
      Alert.alert('Error', 'No se pudo exportar el resumen completo');
    } finally {
      setLoading(false);
    }
  };

  const compartirArchivo = async (contenido, nombreBase, descripcion, extension = 'csv') => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const nombreArchivo = `pergamino_${nombreBase}_${timestamp}.${extension}`;
      
      await Share.share({
        message: contenido,
        title: `${descripcion} - ${nombreArchivo}`,
      });
    } catch (error) {
      console.error('Error al compartir archivo:', error);
      Alert.alert('Error', 'No se pudo compartir el archivo');
    }
  };

  const exportarPorPeriodo = (periodo) => {
    Alert.alert(
      'Exportar por Período',
      `¿Qué datos quieres exportar para ${periodo}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Consumos', onPress: () => exportarConsumosPorPeriodo(periodo) },
        { text: 'Canjes', onPress: () => exportarCanjesPorPeriodo(periodo) }
      ]
    );
  };

  const exportarConsumosPorPeriodo = async (periodo) => {
    setLoading(true);
    try {
      const ahora = new Date();
      let fechaInicio;

      switch (periodo) {
        case 'Hoy':
          fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
          break;
        case 'Esta Semana':
          fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'Este Mes':
          fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
          break;
      }

      const q = query(
        collection(db, 'consumos'),
        where('fecha', '>=', fechaInicio),
        orderBy('fecha', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      let csvContent = "Cliente ID,Monto,Puntos Ganados,Fecha,Mesa\n";
      
      querySnapshot.docs.forEach(doc => {
        const consumo = doc.data();
        const fecha = consumo.fecha?.toDate ? 
          consumo.fecha.toDate().toLocaleString('es-ES') : 
          'Sin fecha';
        
        csvContent += `"${consumo.clienteId || ''}",${consumo.monto || 0},${consumo.puntosGanados || 0},"${fecha}","${consumo.mesa || ''}"\n`;
      });

      await compartirArchivo(csvContent, `consumos_${periodo.toLowerCase().replace(' ', '_')}`, `Consumos de ${periodo}`);
    } catch (error) {
      console.error('Error al exportar consumos por período:', error);
      Alert.alert('Error', 'No se pudieron exportar los consumos');
    } finally {
      setLoading(false);
    }
  };

  const exportarCanjesPorPeriodo = async (periodo) => {
    setLoading(true);
    try {
      const ahora = new Date();
      let fechaInicio;

      switch (periodo) {
        case 'Hoy':
          fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
          break;
        case 'Esta Semana':
          fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'Este Mes':
          fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
          break;
      }

      const q = query(
        collection(db, 'canjes'),
        where('fecha', '>=', fechaInicio),
        orderBy('fecha', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      let csvContent = "Cliente ID,Cliente Nombre,Premio,Puntos Canjeados,Fecha,Estado\n";
      
      querySnapshot.docs.forEach(doc => {
        const canje = doc.data();
        const fecha = canje.fecha?.toDate ? 
          canje.fecha.toDate().toLocaleString('es-ES') : 
          'Sin fecha';
        
        csvContent += `"${canje.clienteId || ''}","${canje.clienteNombre || ''}","${canje.premioNombre || ''}",${canje.puntosCanjeados || 0},"${fecha}","${canje.estado || ''}"\n`;
      });

      await compartirArchivo(csvContent, `canjes_${periodo.toLowerCase().replace(' ', '_')}`, `Canjes de ${periodo}`);
    } catch (error) {
      console.error('Error al exportar canjes por período:', error);
      Alert.alert('Error', 'No se pudieron exportar los canjes');
    } finally {
      setLoading(false);
    }
  };

  const renderBotonExportar = (titulo, descripcion, onPress, icono = '📊', color = '#8B4513') => (
    <TouchableOpacity
      style={[styles.exportButton, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.buttonContent}>
        <Text style={styles.buttonIcon}>{icono}</Text>
        <View style={styles.buttonText}>
          <Text style={styles.buttonTitle}>{titulo}</Text>
          <Text style={styles.buttonDescription}>{descripcion}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Exportar Datos</Text>
        <Text style={styles.subtitulo}>Descarga información en formato CSV</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>🗃️ Datos Principales</Text>
          
          {renderBotonExportar(
            'Exportar Clientes',
            'Lista completa de clientes con sus datos y puntos',
            exportarClientes,
            '👥',
            '#007AFF'
          )}

          {renderBotonExportar(
            'Exportar Consumos',
            'Historial completo de todas las transacciones',
            exportarConsumos,
            '🛒',
            '#28a745'
          )}

          {renderBotonExportar(
            'Exportar Campañas',
            'Lista de todas las campañas de fidelización',
            exportarCampañas,
            '🎯',
            '#8B4513'
          )}

          {renderBotonExportar(
            'Exportar Canjes',
            'Historial de todos los canjes de premios',
            exportarCanjes,
            '🎁',
            '#ff6b35'
          )}
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>📅 Exportar por Período</Text>
          
          {['Hoy', 'Esta Semana', 'Este Mes'].map((periodo) => (
            <TouchableOpacity
              key={periodo}
              style={styles.periodoButton}
              onPress={() => exportarPorPeriodo(periodo)}
              disabled={loading}
            >
              <Text style={styles.periodoButtonText}>{periodo}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>📋 Reportes Especiales</Text>
          
          {renderBotonExportar(
            'Resumen Completo',
            'Reporte general con estadísticas y top clientes',
            exportarResumenCompleto,
            '📊',
            '#6f42c1'
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Preparando exportación...</Text>
          </View>
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
  content: {
    padding: 15,
  },
  seccion: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  exportButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  buttonText: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#666',
  },
  periodoButton: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  periodoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  loadingContainer: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  loadingText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
  },
});

export default ExportarDatos;
