import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Menú de navegación para el panel web administrativo
 */
const WebAdminMenu = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // Opciones del menú
  const menuOptions = [
    { id: 'analytics', label: 'Dashboard', icon: '📊', route: 'AnalyticsPage' },
    { id: 'alerts', label: 'Alertas', icon: '🔔', route: 'AlertsPage' },
    { id: 'logout', label: 'Cerrar Sesión', icon: '🚪', action: 'logout' }
  ];
  
  // Manejar clic en opción
  const handleOptionClick = (option) => {
    if (option.action === 'logout') {
      // Implementar cierre de sesión
      return;
    }
    
    if (option.route) {
      navigation.navigate(option.route);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Pergamino Admin</Text>
        {user && (
          <Text style={styles.userInfo}>
            {user.email || 'Admin'}
          </Text>
        )}
      </View>
      
      <View style={styles.menuItems}>
        {menuOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            style={styles.menuItem}
            onPress={() => handleOptionClick(option)}
          >
            <Text style={styles.menuIcon}>{option.icon}</Text>
            <Text style={styles.menuLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} Pergamino</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: '100%',
    backgroundColor: '#2c3e50',
    padding: 16,
    flexDirection: 'column',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  userInfo: {
    fontSize: 14,
    color: '#ddd',
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 6,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: 'white',
  },
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  }
});

export default WebAdminMenu;