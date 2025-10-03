import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Divider, Switch } from 'react-native-paper';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseClient';
import { subscribeSettings, getSettings } from '../../services/settings';

export default function ConfigScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    QR_TTL_SECONDS: 30,
    COOLDOWN_MIN: 1,
    LIMITS_PER_WEEK: 20,
    GEO_RADIUS_M: 200,
    MAINTENANCE_MODE: false,
    AUTO_LOCK_SEC: 2
  });

  // Cargar configuración inicial
  useEffect(() => {
    const unsubscribe = subscribeSettings((settings) => {
      setConfig(settings);
      setLoading(false);
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  // Validación de entrada
  const validateNumber = (value, min = 0, max = 99999) => {
    const num = parseInt(value, 10);
    return !isNaN(num) && num >= min && num <= max;
  };

  // Guardar cambios
  const saveChanges = async () => {
    // Validar todos los campos
    if (!validateNumber(config.QR_TTL_SECONDS, 10, 300)) {
      return Alert.alert('Error', 'El tiempo de vida del QR debe estar entre 10 y 300 segundos');
    }
    if (!validateNumber(config.COOLDOWN_MIN, 0.5, 10)) {
      return Alert.alert('Error', 'El tiempo de cooldown debe estar entre 0.5 y 10 minutos');
    }
    if (!validateNumber(config.LIMITS_PER_WEEK, 1, 100)) {
      return Alert.alert('Error', 'El límite semanal debe estar entre 1 y 100');
    }
    if (!validateNumber(config.GEO_RADIUS_M, 50, 1000)) {
      return Alert.alert('Error', 'El radio geográfico debe estar entre 50 y 1000 metros');
    }
    if (!validateNumber(config.AUTO_LOCK_SEC, 1, 60)) {
      return Alert.alert('Error', 'El tiempo de bloqueo automático debe estar entre 1 y 60 segundos');
    }

    try {
      setSaving(true);
      
      // Actualizar documento en Firestore
      const configRef = doc(db, 'Ajustes', 'global');
      await updateDoc(configRef, {
        QR_TTL_SECONDS: parseInt(config.QR_TTL_SECONDS),
        COOLDOWN_MIN: parseFloat(config.COOLDOWN_MIN),
        LIMITS_PER_WEEK: parseInt(config.LIMITS_PER_WEEK),
        GEO_RADIUS_M: parseInt(config.GEO_RADIUS_M),
        MAINTENANCE_MODE: config.MAINTENANCE_MODE,
        AUTO_LOCK_SEC: parseInt(config.AUTO_LOCK_SEC)
      });
      
      Alert.alert('Éxito', 'Configuración actualizada correctamente');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{marginTop: 10}}>Cargando configuración...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configuración del Sistema</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Códigos QR y Seguridad</Text>
        
        <Text style={styles.label}>Tiempo de vida de QR (segundos):</Text>
        <TextInput
          mode="outlined"
          keyboardType="number-pad"
          value={String(config.QR_TTL_SECONDS)}
          onChangeText={(text) => setConfig({...config, QR_TTL_SECONDS: text})}
          style={styles.input}
        />
        <Text style={styles.hint}>
          Tiempo de validez de los códigos QR dinámicos generados (10-300 seg)
        </Text>
        
        <Text style={styles.label}>Tiempo de cooldown (minutos):</Text>
        <TextInput
          mode="outlined"
          keyboardType="decimal-pad"
          value={String(config.COOLDOWN_MIN)}
          onChangeText={(text) => setConfig({...config, COOLDOWN_MIN: text})}
          style={styles.input}
        />
        <Text style={styles.hint}>
          Tiempo mínimo entre escaneos del mismo código (0.5-10 min)
        </Text>
        
        <Text style={styles.label}>Bloqueo automático (segundos):</Text>
        <TextInput
          mode="outlined"
          keyboardType="number-pad"
          value={String(config.AUTO_LOCK_SEC)}
          onChangeText={(text) => setConfig({...config, AUTO_LOCK_SEC: text})}
          style={styles.input}
        />
        <Text style={styles.hint}>
          Tiempo de inactividad antes de bloqueo automático (1-60 seg)
        </Text>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Límites y Restricciones</Text>
        
        <Text style={styles.label}>Canjes por semana:</Text>
        <TextInput
          mode="outlined"
          keyboardType="number-pad"
          value={String(config.LIMITS_PER_WEEK)}
          onChangeText={(text) => setConfig({...config, LIMITS_PER_WEEK: text})}
          style={styles.input}
        />
        <Text style={styles.hint}>
          Límite de canjes por usuario por semana (1-100)
        </Text>
        
        <Text style={styles.label}>Radio geográfico (metros):</Text>
        <TextInput
          mode="outlined"
          keyboardType="number-pad"
          value={String(config.GEO_RADIUS_M)}
          onChangeText={(text) => setConfig({...config, GEO_RADIUS_M: text})}
          style={styles.input}
        />
        <Text style={styles.hint}>
          Distancia máxima permitida para verificación de ubicación (50-1000m)
        </Text>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado del Sistema</Text>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Modo mantenimiento:</Text>
          <Switch
            value={config.MAINTENANCE_MODE}
            onValueChange={(value) => setConfig({...config, MAINTENANCE_MODE: value})}
          />
        </View>
        <Text style={styles.hint}>
          Activa el modo de mantenimiento para prevenir acciones de usuarios durante actualizaciones
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={saveChanges} 
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
        >
          Guardar Cambios
        </Button>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 4,
  },
  hint: {
    color: '#666',
    fontSize: 12,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    marginVertical: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    padding: 8,
  }
});
