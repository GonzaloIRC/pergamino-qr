// src/admin/MenuAdmin.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import NotificationCenter from '../components/NotificationCenter';

const MenuAdmin = ({ navigation }) => {
  const [notificacionesVisible, setNotificacionesVisible] = useState(false);
  const menuOptions = [
    {
      title: 'Dashboard en Tiempo Real',
      description: 'Vista en vivo del estado del negocio',
      screen: 'DashboardTiempoReal',
      color: '#17a2b8'
    },
    {
      title: 'Centro de Notificaciones',
      description: 'Alertas y notificaciones del negocio',
      action: () => setNotificacionesVisible(true),
      color: '#FF6B35',
      isAction: true
    },
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
    },
    {
      title: 'Exportar Datos',
      description: 'Descargar reportes y respaldos en CSV',
      screen: 'ExportarDatos',
      color: '#dc3545'
    },
    {
      title: 'Backup y Restauración (Simple)',
      description: 'Respaldo básico compatible con móviles',
      screen: 'SimpleBackup',
      color: '#6f42c1'
    }
  ];

  const handleOptionPress = (screen, option) => {
    if (option?.isAction && option?.action) {
      option.action();
    } else {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Administración</Text>
        <Text style={styles.subtitle}>Pergamino App</Text>
      </View>

      <ScrollView style={styles.menuContainer}>
        {menuOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuOption, { borderLeftColor: option.color }]}
            onPress={() => handleOptionPress(option.screen, option)}
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

      <NotificationCenter
        visible={notificacionesVisible}
        onClose={() => setNotificacionesVisible(false)}
        userRole="admin"
      />
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
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  optionContent: {
    flex: 1,
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
    width: 8,
    height: 40,
    borderRadius: 4,
    marginLeft: 15,
  },
  backButton: {
    backgroundColor: '#666',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MenuAdmin;
