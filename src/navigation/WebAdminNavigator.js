// src/navigation/WebAdminNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RequireRole } from './RouteGuards';
import { View, StyleSheet } from 'react-native';
import AnalyticsPage from '../pages/AnalyticsPage';
import AlertsPage from '../pages/AlertsPage';
import WebAdminMenu from '../components/WebAdminMenu';

// Navegador web para administradores
const WebAdminStack = createStackNavigator();

/**
 * Componente contenedor para incluir el menú lateral
 */
const WebAdminLayout = ({ children }) => {
  return (
    <View style={styles.container}>
      <WebAdminMenu />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

/**
 * Función para envolver un componente con el layout
 */
const withWebAdminLayout = (Component) => {
  return (props) => (
    <WebAdminLayout>
      <Component {...props} />
    </WebAdminLayout>
  );
};

/**
 * Navegador para la versión web del panel de administración
 * Este navegador solo debe usarse en plataforma web
 */
export default function WebAdminNavigator() {
  // Envolver los componentes con el layout
  const AnalyticsPageWithLayout = withWebAdminLayout(RequireRole(['admin'], AnalyticsPage));
  const AlertsPageWithLayout = withWebAdminLayout(RequireRole(['admin'], AlertsPage));
  
  return (
    <WebAdminStack.Navigator 
      initialRouteName="AnalyticsPage"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007bff',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Ocultar la cabecera para usar nuestro propio menú
        headerShown: false,
      }}
    >
      <WebAdminStack.Screen 
        name="AnalyticsPage" 
        component={AnalyticsPageWithLayout}
      />
      <WebAdminStack.Screen 
        name="AlertsPage" 
        component={AlertsPageWithLayout}
      />
    </WebAdminStack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});