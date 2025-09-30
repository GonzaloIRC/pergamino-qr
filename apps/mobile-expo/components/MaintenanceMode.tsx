// apps/mobile-expo/components/MaintenanceMode.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MaintenanceModeProps {
  onRetry?: () => void;
}

export default function MaintenanceMode({ onRetry }: MaintenanceModeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="construct-outline" size={64} color="#f59e0b" style={styles.icon} />
        
        <Text style={styles.title}>
          Estamos en mantenimiento
        </Text>
        
        <Text style={styles.message}>
          Estamos realizando mejoras en nuestra aplicación. Por favor, inténtelo de nuevo más tarde.
          Disculpe las molestias.
        </Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={onRetry || (() => {})}
        >
          <Text style={styles.buttonText}>Intentar nuevamente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});