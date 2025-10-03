
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { RequireAuth } from './RouteGuards';
import RoleBasedNavigator from './RoleBasedNavigator';
import WebAdminNavigator from './WebAdminNavigator';
import { useAuth } from '../context/AuthContext';

import Landing from '../screens/Landing';
import Onboarding from '../screens/Onboarding';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import Settings from '../screens/Settings';
import Campaigns from '../screens/Campaigns';
import Customers from '../screens/Customers';
import Reports from '../screens/Reports';
import CustomerListScreen from '../screens/CustomerListScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isPlatformWeb, role } = useAuth();
  
  // Si estamos en web y el usuario es administrador, mostramos el panel web
  if (isPlatformWeb && role === 'admin') {
    return (
      <NavigationContainer>
        <WebAdminNavigator />
      </NavigationContainer>
    );
  }
  
  // Si no, mostramos la navegación normal para la app móvil
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen name="Landing" component={Landing} options={{ headerShown: false }} />
            <Stack.Screen name="Onboarding" component={Onboarding} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen 
              name="MainTabs" 
              component={RequireAuth(RoleBasedNavigator)} 
              options={{ headerShown: false }} 
            />
            <Stack.Screen name="Settings" component={RequireAuth(Settings)} />
            <Stack.Screen name="Campaigns" component={RequireAuth(Campaigns)} />
            <Stack.Screen name="Customers" component={RequireAuth(Customers)} />
            <Stack.Screen name="Reports" component={RequireAuth(Reports)} />
            <Stack.Screen 
              name="CustomerList" 
              component={RequireAuth(CustomerListScreen)}
              options={{ title: "Clientes" }}
            />
            <Stack.Screen 
              name="CustomerDetail" 
              component={RequireAuth(CustomerDetailScreen)}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
