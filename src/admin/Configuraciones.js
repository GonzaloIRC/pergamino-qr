// src/admin/Configuraciones.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { db } from '../services/firebaseClient';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';

const Configuraciones = ({ navigation }) => {
  const [configuraciones, setConfiguraciones] = useState({
    pinMesero: '1234',
    puntosMinimos: 1,
    puntosMaximos: 10,
    puntosMultiplicador: 1,
    notificacionesActivas: true,
    mensajeBienvenida: 'Bienvenido a Pergamino',
    nombreRestaurante: 'Pergamino',
    monedaSimbolo: '$',
    validacionAutomatica: false,
    codigoVerificacion: '1234'
  });
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const cargarConfiguraciones = async () => {
    setLoading(true);
    try {
      const configDoc = await getDoc(doc(db, 'configuraciones', 'general'));
      if (configDoc.exists()) {
        setConfiguraciones(prev => ({
          ...prev,
          ...configDoc.data()
        }));
      }
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarConfiguraciones = async () => {
    setGuardando(true);
    try {
      await setDoc(doc(db, 'configuraciones', 'general'), configuraciones, { merge: true });
      Alert.alert('Éxito', 'Configuraciones guardadas correctamente');
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
      Alert.alert('Error', 'No se pudieron guardar las configuraciones');
    } finally {
      setGuardando(false);
    }
  };

  const actualizarConfiguracion = (key, value) => {
    setConfiguraciones(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validarPuntos = (texto, tipo) => {
    const numero = parseInt(texto) || 0;
    if (numero < 0) return;
    
    if (tipo === 'minimo' && numero > configuraciones.puntosMaximos) {
      Alert.alert('Error', 'Los puntos mínimos no pueden ser mayores que los máximos');
      return;
    }
    
    if (tipo === 'maximo' && numero < configuraciones.puntosMinimos) {
      Alert.alert('Error', 'Los puntos máximos no pueden ser menores que los mínimos');
      return;
    }
    
    actualizarConfiguracion(
      tipo === 'minimo' ? 'puntosMinimos' : 'puntosMaximos', 
      numero
    );
  };

  const resetearConfiguraciones = () => {
    Alert.alert(
      'Confirmar Reset',
      '¿Estás seguro de que quieres restaurar todas las configuraciones a sus valores por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: () => {
            setConfiguraciones({
              pinMesero: '1234',
              puntosMinimos: 1,
              puntosMaximos: 10,
              puntosMultiplicador: 1,
              notificacionesActivas: true,
              mensajeBienvenida: 'Bienvenido a Pergamino',
              nombreRestaurante: 'Pergamino',
              monedaSimbolo: '$',
              validacionAutomatica: false,
              codigoVerificacion: '1234'
            });
          }
        }
      ]
    );
  };

  const exportarConfiguraciones = () => {
    const configString = JSON.stringify(configuraciones, null, 2);
    Alert.alert(
      'Configuraciones Exportadas',
      'Copia este texto para hacer backup de tu configuración:\n\n' + configString,
      [{ text: 'OK' }]
    );
  };

  const renderConfigItem = (titulo, descripcion, children) => (
    <View style={styles.configItem}>
      <View style={styles.configHeader}>
        <Text style={styles.configTitulo}>{titulo}</Text>
        {descripcion && (
          <Text style={styles.configDescripcion}>{descripcion}</Text>
        )}
      </View>
      {children}
    </View>
  );

  const renderTextInput = (placeholder, value, onChangeText, keyboardType = 'default') => (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value.toString()}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  );

  const renderSwitch = (value, onValueChange) => (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#767577', true: '#8B4513' }}
      thumbColor={value ? '#f5dd4b' : '#f4f3f4'}
    />
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Configuraciones</Text>
        <Text style={styles.subtitulo}>Personaliza la aplicación</Text>
      </View>

      <View style={styles.content}>
        {/* Configuraciones de Seguridad */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>🔐 Seguridad</Text>
          
          {renderConfigItem(
            'PIN del Mesero',
            'Código de acceso para el modo mesero',
            renderTextInput(
              'PIN (4 dígitos)',
              configuraciones.pinMesero,
              (text) => actualizarConfiguracion('pinMesero', text),
              'numeric'
            )
          )}

          {renderConfigItem(
            'Código de Verificación',
            'Código para confirmar canjes de premios',
            renderTextInput(
              'Código de verificación',
              configuraciones.codigoVerificacion,
              (text) => actualizarConfiguracion('codigoVerificacion', text),
              'numeric'
            )
          )}
        </View>

        {/* Configuraciones de Puntos */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>⭐ Sistema de Puntos</Text>
          
          {renderConfigItem(
            'Puntos Mínimos por Consumo',
            'Mínimo número de puntos que se pueden ganar',
            renderTextInput(
              'Puntos mínimos',
              configuraciones.puntosMinimos,
              (text) => validarPuntos(text, 'minimo'),
              'numeric'
            )
          )}

          {renderConfigItem(
            'Puntos Máximos por Consumo',
            'Máximo número de puntos que se pueden ganar',
            renderTextInput(
              'Puntos máximos',
              configuraciones.puntosMaximos,
              (text) => validarPuntos(text, 'maximo'),
              'numeric'
            )
          )}

          {renderConfigItem(
            'Multiplicador de Puntos',
            'Factor de multiplicación para eventos especiales',
            renderTextInput(
              'Multiplicador (ej: 1.5)',
              configuraciones.puntosMultiplicador,
              (text) => {
                const numero = parseFloat(text) || 1;
                if (numero >= 0.1 && numero <= 10) {
                  actualizarConfiguracion('puntosMultiplicador', numero);
                }
              },
              'numeric'
            )
          )}
        </View>

        {/* Configuraciones de Aplicación */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>🏪 Información del Restaurante</Text>
          
          {renderConfigItem(
            'Nombre del Restaurante',
            'Nombre que aparece en la aplicación',
            renderTextInput(
              'Nombre del restaurante',
              configuraciones.nombreRestaurante,
              (text) => actualizarConfiguracion('nombreRestaurante', text)
            )
          )}

          {renderConfigItem(
            'Símbolo de Moneda',
            'Símbolo que aparece antes de los precios',
            renderTextInput(
              'Símbolo ($, €, etc.)',
              configuraciones.monedaSimbolo,
              (text) => actualizarConfiguracion('monedaSimbolo', text)
            )
          )}

          {renderConfigItem(
            'Mensaje de Bienvenida',
            'Mensaje que ven los nuevos clientes',
            renderTextInput(
              'Mensaje de bienvenida',
              configuraciones.mensajeBienvenida,
              (text) => actualizarConfiguracion('mensajeBienvenida', text)
            )
          )}
        </View>

        {/* Configuraciones Avanzadas */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>⚙️ Configuraciones Avanzadas</Text>
          
          {renderConfigItem(
            'Notificaciones Activas',
            'Activar notificaciones en la aplicación',
            <View style={styles.switchContainer}>
              {renderSwitch(
                configuraciones.notificacionesActivas,
                (value) => actualizarConfiguracion('notificacionesActivas', value)
              )}
            </View>
          )}

          {renderConfigItem(
            'Validación Automática',
            'Validar QR automáticamente sin confirmación',
            <View style={styles.switchContainer}>
              {renderSwitch(
                configuraciones.validacionAutomatica,
                (value) => actualizarConfiguracion('validacionAutomatica', value)
              )}
            </View>
          )}
        </View>

        {/* Botones de Acción */}
        <View style={styles.botonesContainer}>
          <TouchableOpacity
            style={styles.botonGuardar}
            onPress={guardarConfiguraciones}
            disabled={guardando}
          >
            <Text style={styles.textoBotonGuardar}>
              {guardando ? 'Guardando...' : '💾 Guardar Configuraciones'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonSecundario}
            onPress={exportarConfiguraciones}
          >
            <Text style={styles.textoBotonSecundario}>📤 Exportar Configuraciones</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonReset}
            onPress={resetearConfiguraciones}
          >
            <Text style={styles.textoBotonReset}>🔄 Restaurar por Defecto</Text>
          </TouchableOpacity>
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
  configItem: {
    marginBottom: 20,
  },
  configHeader: {
    marginBottom: 8,
  },
  configTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  configDescripcion: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  switchContainer: {
    alignItems: 'flex-start',
  },
  botonesContainer: {
    marginTop: 20,
    gap: 12,
  },
  botonGuardar: {
    backgroundColor: '#8B4513',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  textoBotonGuardar: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  botonSecundario: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoBotonSecundario: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  botonReset: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoBotonReset: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Configuraciones;
