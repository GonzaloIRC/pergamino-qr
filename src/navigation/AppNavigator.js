
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { RequireAuth, RequireRole } from './RouteGuards';
import { AuthContext } from '../context/AuthContext';

import Landing from '../screens/Landing';
import Onboarding from '../screens/Onboarding';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminDashboard from '../screens/AdminDashboard';
import WaiterDashboard from '../screens/WaiterDashboard';
import CustomerDashboard from '../screens/CustomerDashboard';
import Settings from '../screens/Settings';
import Campaigns from '../screens/Campaigns';
import Customers from '../screens/Customers';
import Reports from '../screens/Reports';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { userRole } = useContext(AuthContext);
  
  // Determinar qué pestaña mostrar inicialmente según el rol
  let initialRouteName = "Customer"; // Por defecto, mostrar la pestaña Cliente
  
  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
    >
      <Tab.Screen
        name="Admin"
        component={RequireRole(['admin'], AdminDashboard)}
        options={{ tabBarLabel: 'Admin', headerTitle: 'Panel Admin' }}
      />
      <Tab.Screen
        name="Waiter"
        component={RequireRole(['waiter'], WaiterDashboard)}
        options={{ tabBarLabel: 'Mesero', headerTitle: 'Panel Mesero' }}
      />
      <Tab.Screen
        name="Customer"
        component={RequireRole(['cliente', 'customer'], CustomerDashboard)}
        options={{ tabBarLabel: 'Cliente', headerTitle: 'Mi Cuenta' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen name="Landing" component={Landing} options={{ headerShown: false }} />
            <Stack.Screen name="Onboarding" component={Onboarding} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="MainTabs" component={RequireAuth(MainTabs)} options={{ headerShown: false }} />
            <Stack.Screen name="Settings" component={RequireAuth(Settings)} />
            <Stack.Screen name="Campaigns" component={RequireAuth(Campaigns)} />
            <Stack.Screen name="Customers" component={RequireAuth(Customers)} />
            <Stack.Screen name="Reports" component={RequireAuth(Reports)} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
