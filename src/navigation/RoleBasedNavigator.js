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
import CustomersScreen from '../screens/admin/CustomersScreen';
import FraudAlertsScreen from '../screens/admin/FraudAlertsScreen';

// Nuevas pantallas web para analytics y alertas
import AnalyticsPage from '../pages/AnalyticsPage';
import AlertsPage from '../pages/AlertsPage';

// Pantallas compartidas
import ScannerScreen from '../screens/main/ScannerScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Navegadores
const Tab = createBottomTabNavigator();
const AdminStack = createNativeStackNavigator();
const WaiterStack = createNativeStackNavigator();
const CustomerStack = createNativeStackNavigator();

// Navegador específico para administradores
const AdminStackNavigator = () => {
  const { isPlatformWeb } = useContext(AuthContext);
  
  return (
    <AdminStack.Navigator>
      {isPlatformWeb ? (
        // Pantallas específicas para la versión web (panel administrativo)
        <>
          <AdminStack.Screen 
            name="AnalyticsPage" 
            component={AnalyticsPage} 
            options={{ headerTitle: 'Panel de Analytics' }}
          />
          <AdminStack.Screen 
            name="AlertsPage" 
            component={AlertsPage} 
            options={{ headerTitle: 'Alertas de Seguridad' }}
          />
        </>
      ) : (
        // Pantallas para la versión móvil
        <>
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
        </>
      )}
    </AdminStack.Navigator>
  );
};

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
  const { role } = useContext(AuthContext);
  
  // Determinar la pestaña inicial basada en el rol del usuario
  let initialRouteName = 'CustomerDashboard';
  if (role === 'admin') initialRouteName = 'Admin';
  else if (role === 'waiter') initialRouteName = 'Scanner';
  
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Scanner') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'CustomerDashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Customers') {
            iconName = focused ? 'people' : 'people-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {/* Tab para el dashboard de clientes - visible para todos */}
      <Tab.Screen
        name="CustomerDashboard"
        component={CustomerStackNavigator}
        options={{ 
          tabBarLabel: 'Mi Cuenta', 
          headerShown: false
        }}
      />
      
      {/* Tab para escanear - visible para waiter y admin */}
      <Tab.Screen
        name="Scanner"
        component={RequireRole(['waiter', 'admin'], ScannerScreen)}
        options={{ 
          tabBarLabel: 'Escanear',
          headerTitle: 'Escáner QR',
          tabBarStyle: { display: (role === 'waiter' || role === 'admin') ? 'flex' : 'none' }
        }}
      />
      
      {/* Tab para gestión de clientes - visible para admin */}
      <Tab.Screen
        name="Customers"
        component={RequireRole(['admin'], CustomersScreen)}
        options={{ 
          tabBarLabel: 'Clientes',
          headerTitle: 'Gestión de Clientes',
          tabBarStyle: { display: role === 'admin' ? 'flex' : 'none' }
        }}
      />
      
      {/* Tab para administración - visible para admin */}
      <Tab.Screen
        name="Admin"
        component={RequireRole(['admin'], AdminStackNavigator)}
        options={{ 
          tabBarLabel: 'Admin', 
          headerShown: false,
          tabBarStyle: { display: role === 'admin' ? 'flex' : 'none' }
        }}
      />
    </Tab.Navigator>
  );
}
