// src/admin/SimpleMenuAdmin.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const SimpleMenuAdmin = ({ navigation }) => {
  const menuOptions = [
    {
      title: 'Gestionar Campañas',
      description: 'Crear, editar y administrar campañas de fidelización',
      screen: 'Campañas',
      color: '#8B4513'
    },
    {
      title: 'Generar QR de Mesas',
      description: 'Crear códigos QR para las mesas del restaurante',
      screen: 'GenerarQR',
      color: '#28a745'
    },
    {
      title: 'Ver Clientes',
      description: 'Lista de clientes registrados y sus puntos',
      screen: 'ListaClientes',
      color: '#007AFF'
    },
    {
      title: 'Estadísticas',
      description: 'Reportes y estadísticas de consumos',
      screen: 'Estadisticas',
      color: '#ff6b35'
    },
    {
      title: 'Configuraciones',
      description: 'Ajustes y configuración de la aplicación',
      screen: 'Configuraciones',
      color: '#6f42c1'
    }
  ];

  const handleOptionPress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administración</Text>
        <Text style={styles.subtitle}>Pergamino App (Versión Móvil)</Text>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuOption, { borderLeftColor: option.color }]}
            onPress={() => handleOptionPress(option.screen)}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            <View style={[styles.colorIndicator, { backgroundColor: option.color }]} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Volver al Inicio</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  menuContainer: {
    flex: 1,
    padding: 20,
  },
  menuOption: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  optionContent: {
    flex: 1,
    padding: 20,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  colorIndicator: {
    width: 5,
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

export default SimpleMenuAdmin;
