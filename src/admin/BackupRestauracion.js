// src/admin/BackupRestauracion.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import { db } from '../services/firebaseClient';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  setDoc,
  deleteDoc,
  writeBatch 
} from 'firebase/firestore';

const BackupRestauracion = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [operacion, setOperacion] = useState('');

  const crearBackupCompleto = async () => {
    setLoading(true);
    setOperacion('Creando backup completo...');
    
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {}
      };

      // Respaldar todas las colecciones
      const colecciones = ['clientes', 'consumos', 'campañas', 'mesas', 'canjes'];
      
      for (const nombreColeccion of colecciones) {
        setOperacion(`Respaldando ${nombreColeccion}...`);
        const snapshot = await getDocs(collection(db, nombreColeccion));
        backup.data[nombreColeccion] = [];
        
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          
          // Convertir timestamps a strings para JSON
          const processedData = processTimestamps(data);
          
          backup.data[nombreColeccion].push({
            id: doc.id,
            data: processedData
          });
        });
      }

      // Crear backup como texto para compartir
      const backupText = JSON.stringify(backup, null, 2);
      
      // Usar Share API nativo para compartir el backup
      await Share.share({
        message: backupText,
        title: `Backup Pergamino App - ${new Date().toLocaleDateString()}`,
      });

      Alert.alert(
        'Backup Completado',
        `Se ha creado un backup completo con ${backup.data.clientes?.length || 0} clientes, ${backup.data.consumos?.length || 0} consumos y ${backup.data.campañas?.length || 0} campañas.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error al crear backup:', error);
      Alert.alert(
        'Error en Backup',
        'No se pudo crear el backup. Verifica tu conexión e intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setOperacion('');
    }
  };

  const processTimestamps = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const processed = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && value.toDate) {
        // Es un Timestamp de Firebase
        processed[key] = {
          _timestamp: true,
          value: value.toDate().toISOString()
        };
      } else if (value instanceof Date) {
        // Es un objeto Date
        processed[key] = {
          _date: true,
          value: value.toISOString()
        };
      } else if (Array.isArray(value)) {
        processed[key] = value.map(item => processTimestamps(item));
      } else if (value && typeof value === 'object') {
        processed[key] = processTimestamps(value);
      } else {
        processed[key] = value;
      }
    }
    
    return processed;
  };

  const restoreTimestamps = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const restored = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && value._timestamp) {
        // Restaurar Timestamp de Firebase
        restored[key] = new Date(value.value);
      } else if (value && typeof value === 'object' && value._date) {
        // Restaurar Date
        restored[key] = new Date(value.value);
      } else if (Array.isArray(value)) {
        restored[key] = value.map(item => restoreTimestamps(item));
      } else if (value && typeof value === 'object') {
        restored[key] = restoreTimestamps(value);
      } else {
        restored[key] = value;
      }
    }
    
    return restored;
  };

  const crearBackupClientes = async () => {
    setLoading(true);
    setOperacion('Respaldando clientes...');
    
    try {
      const snapshot = await getDocs(collection(db, 'clientes'));
      const clientes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...processTimestamps(doc.data())
      }));

      const backup = {
        tipo: 'clientes',
        timestamp: new Date().toISOString(),
        cantidad: clientes.length,
        datos: clientes
      };

      const backupText = JSON.stringify(backup, null, 2);
      
      await Share.share({
        message: backupText,
        title: `Backup Clientes - ${new Date().toLocaleDateString()}`,
      });

      Alert.alert(
        'Backup de Clientes Completado',
        `Se respaldaron ${clientes.length} clientes exitosamente.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error al respaldar clientes:', error);
      Alert.alert('Error', 'No se pudo crear el backup de clientes.');
    } finally {
      setLoading(false);
      setOperacion('');
    }
  };

  const limpiarDatosPrueba = async () => {
    Alert.alert(
      'Confirmar Limpieza',
      '⚠️ ADVERTENCIA: Esta acción eliminará TODOS los datos de prueba. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, Limpiar', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setOperacion('Limpiando datos de prueba...');
            
            try {
              const batch = writeBatch(db);
              
              // Limpiar clientes de prueba
              const clientesSnapshot = await getDocs(collection(db, 'clientes'));
              clientesSnapshot.docs.forEach(doc => {
                const cliente = doc.data();
                if (cliente.nombre?.toLowerCase().includes('test') || 
                    cliente.nombre?.toLowerCase().includes('prueba') ||
                    cliente.email?.includes('test') ||
                    cliente.telefono?.startsWith('000')) {
                  batch.delete(doc.ref);
                }
              });

              // Limpiar consumos de prueba
              const consumosSnapshot = await getDocs(collection(db, 'consumos'));
              consumosSnapshot.docs.forEach(doc => {
                const consumo = doc.data();
                if (consumo.monto && consumo.monto < 10) { // Montos muy bajos probablemente sean prueba
                  batch.delete(doc.ref);
                }
              });

              await batch.commit();

              Alert.alert(
                'Limpieza Completada',
                'Se han eliminado los datos de prueba exitosamente.',
                [{ text: 'OK' }]
              );

            } catch (error) {
              console.error('Error al limpiar datos:', error);
              Alert.alert('Error', 'No se pudieron limpiar los datos de prueba.');
            } finally {
              setLoading(false);
              setOperacion('');
            }
          }
        }
      ]
    );
  };

  const exportarEstadisticas = async () => {
    setLoading(true);
    setOperacion('Generando estadísticas...');
    
    try {
      const clientesSnapshot = await getDocs(collection(db, 'clientes'));
      const consumosSnapshot = await getDocs(collection(db, 'consumos'));
      const canjesSnapshot = await getDocs(collection(db, 'canjes'));

      const clientes = clientesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const consumos = consumosSnapshot.docs.map(doc => doc.data());
      const canjes = canjesSnapshot.docs.map(doc => doc.data());

      const estadisticas = {
        resumen: {
          totalClientes: clientes.length,
          totalConsumos: consumos.length,
          totalCanjes: canjes.length,
          montoTotalConsumos: consumos.reduce((sum, c) => sum + (c.monto || 0), 0),
          puntosCanjeados: canjes.reduce((sum, c) => sum + (c.puntosUsados || 0), 0),
        },
        clientesTop: clientes
          .sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
          .slice(0, 10)
          .map(c => ({
            nombre: c.nombre,
            puntos: c.puntos || 0,
            email: c.email
          })),
        consumosPorMes: {},
        fechaGeneracion: new Date().toISOString()
      };

      // Agrupar consumos por mes
      consumos.forEach(consumo => {
        if (consumo.fecha) {
          const fecha = consumo.fecha.toDate ? consumo.fecha.toDate() : new Date(consumo.fecha);
          const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
          
          if (!estadisticas.consumosPorMes[mes]) {
            estadisticas.consumosPorMes[mes] = { cantidad: 0, monto: 0 };
          }
          
          estadisticas.consumosPorMes[mes].cantidad++;
          estadisticas.consumosPorMes[mes].monto += consumo.monto || 0;
        }
      });

      const estadisticasText = JSON.stringify(estadisticas, null, 2);
      
      await Share.share({
        message: estadisticasText,
        title: `Estadísticas Pergamino - ${new Date().toLocaleDateString()}`,
      });

      Alert.alert(
        'Estadísticas Exportadas',
        'Se han exportado las estadísticas completas del negocio.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error al exportar estadísticas:', error);
      Alert.alert('Error', 'No se pudieron exportar las estadísticas.');
    } finally {
      setLoading(false);
      setOperacion('');
    }
  };

  const opciones = [
    {
      titulo: 'Backup Completo',
      descripcion: 'Respaldar todos los datos (clientes, consumos, campañas)',
      accion: crearBackupCompleto,
      color: '#28a745',
      icono: '💾'
    },
    {
      titulo: 'Backup Solo Clientes',
      descripcion: 'Respaldar únicamente la base de clientes',
      accion: crearBackupClientes,
      color: '#007AFF',
      icono: '👥'
    },
    {
      titulo: 'Exportar Estadísticas',
      descripcion: 'Generar reporte completo de estadísticas',
      accion: exportarEstadisticas,
      color: '#ff6b35',
      icono: '📊'
    },
    {
      titulo: 'Limpiar Datos de Prueba',
      descripcion: 'Eliminar clientes y consumos de testing',
      accion: limpiarDatosPrueba,
      color: '#dc3545',
      icono: '🧹'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Backup y Restauración</Text>
        <Text style={styles.subtitle}>Gestión de datos empresariales</Text>
      </View>

      <ScrollView style={styles.content}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B4513" />
            <Text style={styles.loadingText}>{operacion}</Text>
          </View>
        )}

        {opciones.map((opcion, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.opcionCard, { borderLeftColor: opcion.color }]}
            onPress={opcion.accion}
            disabled={loading}
          >
            <View style={styles.opcionContent}>
              <View style={styles.opcionHeader}>
                <Text style={styles.icono}>{opcion.icono}</Text>
                <Text style={styles.opcionTitulo}>{opcion.titulo}</Text>
              </View>
              <Text style={styles.opcionDescripcion}>{opcion.descripcion}</Text>
            </View>
            <View style={[styles.colorIndicator, { backgroundColor: opcion.color }]} />
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitulo}>ℹ️ Información Importante</Text>
          <Text style={styles.infoTexto}>
            • Los backups incluyen todos los datos de la aplicación{'\n'}
            • Los archivos se guardan en formato JSON{'\n'}
            • Guarda los backups en un lugar seguro{'\n'}
            • Realiza backups regularmente{'\n'}
            • La limpieza de datos de prueba es irreversible
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Volver al Panel Admin</Text>
      </TouchableOpacity>
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
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  opcionCard: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  opcionContent: {
    flex: 1,
    padding: 20,
  },
  opcionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icono: {
    fontSize: 24,
    marginRight: 12,
  },
  opcionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  opcionDescripcion: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  colorIndicator: {
    width: 4,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 10,
  },
  infoTexto: {
    fontSize: 14,
    color: '#1565c0',
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: '#8B4513',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BackupRestauracion;
