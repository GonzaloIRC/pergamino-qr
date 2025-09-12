import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { RequireRole } from './RouteGuards';

// Pantallas principales
import CustomerDashboard from '../screens/CustomerDashboard';
import WaiterDashboard from '../screens/WaiterDashboard';
import AdminDashboard from '../screens/AdminDashboard';

// Pantallas de administración
import HistoryScreen from '../screens/admin/HistoryScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import ConfigScreen from '../screens/admin/ConfigScreen';
import FraudAlertsScreen from '../screens/admin/FraudAlertsScreen';

// Pantallas compartidas
import ScannerScreen from '../screens/main/ScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReferralsScreen from '../screens/ReferralsScreen';

// Navegadores
const Tab = createBottomTabNavigator();
const AdminStack = createNativeStackNavigator();
const WaiterStack = createNativeStackNavigator();
const CustomerStack = createNativeStackNavigator();

// Navegador específico para administradores
const AdminStackNavigator = () => (
  <AdminStack.Navigator>
    <AdminStack.Screen 
      name="Dashboard" 
      component={AdminDashboard} 
      options={{ headerTitle: 'Panel de Administración' }}
    />
    <AdminStack.Screen 
      name="History" 
      component={HistoryScreen} 
      options={{ headerTitle: 'Historial de Transacciones' }}
    />
    <AdminStack.Screen 
      name="Analytics" 
      component={AnalyticsScreen} 
      options={{ headerTitle: 'Analítica' }}
    />
    <AdminStack.Screen 
      name="Config" 
      component={ConfigScreen} 
      options={{ headerTitle: 'Configuración' }}
    />
    <AdminStack.Screen 
      name="Scanner" 
      component={ScannerScreen} 
      options={{ headerTitle: 'Escanear QR' }}
    />
    <AdminStack.Screen 
      name="FraudAlerts" 
      component={FraudAlertsScreen} 
      options={{ headerTitle: 'Alertas de Fraude' }}
    />
  </AdminStack.Navigator>
);

// Navegador específico para meseros
const WaiterStackNavigator = () => (
  <WaiterStack.Navigator>
    <WaiterStack.Screen 
      name="Dashboard" 
      component={WaiterDashboard} 
      options={{ headerTitle: 'Panel de Mesero' }}
    />
    <WaiterStack.Screen 
      name="Scanner" 
      component={ScannerScreen} 
      options={{ headerTitle: 'Escanear QR' }}
    />
  </WaiterStack.Navigator>
);

// Navegador específico para clientes
const CustomerStackNavigator = () => (
  <CustomerStack.Navigator>
    <CustomerStack.Screen 
      name="Dashboard" 
      component={CustomerDashboard} 
      options={{ headerTitle: 'Mi Cuenta' }}
    />
    <CustomerStack.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ headerTitle: 'Mi Perfil' }}
    />
    <CustomerStack.Screen 
      name="Referrals" 
      component={ReferralsScreen} 
      options={{ headerTitle: 'Mis Referidos' }}
    />
  </CustomerStack.Navigator>
);

// Navegador principal basado en roles
export default function RoleBasedNavigator() {
  const { userRole } = useContext(AuthContext);
  
  // Determinar la pestaña inicial basada en el rol del usuario
  let initialRouteName = 'Cliente';
  if (userRole === 'admin') initialRouteName = 'Admin';
  else if (userRole === 'waiter' || userRole === 'mesero') initialRouteName = 'Mesero';
  
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Mesero') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Cliente') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Admin"
        component={RequireRole(['admin'], AdminStackNavigator)}
        options={{ 
          tabBarLabel: 'Admin', 
          headerShown: false,
          tabBarStyle: { display: userRole === 'admin' ? 'flex' : 'none' }
        }}
      />
      <Tab.Screen
        name="Mesero"
        component={RequireRole(['waiter', 'mesero'], WaiterStackNavigator)}
        options={{ 
          tabBarLabel: 'Mesero', 
          headerShown: false,
          tabBarStyle: { display: (userRole === 'waiter' || userRole === 'mesero') ? 'flex' : 'none' }
        }}
      />
      <Tab.Screen
        name="Cliente"
        component={RequireRole(['cliente', 'customer'], CustomerStackNavigator)}
        options={{ 
          tabBarLabel: 'Cliente', 
          headerShown: false,
          tabBarStyle: { display: (userRole === 'cliente' || userRole === 'customer') ? 'flex' : 'none' }
        }}
      />
    </Tab.Navigator>
  );
}
