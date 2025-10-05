import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/main/HomeScreen';
import ScannerScreen from '../screens/main/ScannerScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

// Importamos pantallas de seguimiento
import TrackingDashboard from '../screens/TrackingDashboard';
import TrackingTableSetup from '../screens/TrackingTableSetup';

// Componentes de Tracking Table
import TrackingForm from '../components/TrackingTable/TrackingForm';

// Tabs
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Scanner') {
            iconName = focused ? 'qr-code' : 'qr-code-outline';
          } else if (route.name === 'Tracking') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scanner" component={ScannerScreen} />
      <Tab.Screen
        name="Tracking"
        component={TrackingDashboard}
        options={{
          title: 'Seguimiento',
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Main Stack
const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TrackingTableSetup"
        component={TrackingTableSetup}
        options={{
          title: 'Configurar Mesa de Seguimiento',
        }}
      />
      <Stack.Screen
        name="TrackingFormScreen"
        component={TrackingFormScreen}
        options={{
          title: 'Nuevo Registro',
        }}
      />
    </Stack.Navigator>
  );
}

// Pantalla contenedora para el formulario
function TrackingFormScreen({ route, navigation }) {
  const { tableId, initialData } = route.params || {};

  const handleSuccess = () => {
    navigation.navigate('Tracking');
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <TrackingForm
      tableId={tableId}
      initialData={initialData}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
