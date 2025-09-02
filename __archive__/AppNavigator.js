// src/navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Importa pantallas principales
import QRScanner from '../cliente/QRScanner';
import ClienteQR from '../cliente/ClienteQR';
import CanjeoPremios from '../cliente/CanjeoPremios';
import HistorialConsumos from '../cliente/HistorialConsumos';
import RegisterClient from '../screens/RegisterClient';
import ValidarQR from '../mesero/ValidarQR';
import RegistrarConsumo from '../mesero/RegistrarConsumo';
import Campañas from '../admin/Campañas';
import GenerarQR from '../admin/GenerarQR';
import MenuAdmin from '../admin/MenuAdmin';
import SimpleMenuAdmin from '../admin/SimpleMenuAdmin';
import ListaClientes from '../admin/ListaClientes';
import Estadisticas from '../admin/Estadisticas';
import Configuraciones from '../admin/Configuraciones';
import ExportarDatos from '../admin/ExportarDatos';
import BackupRestauracion from '../admin/BackupRestauracion';
import SimpleBackup from '../components/SimpleBackup';
// import eliminado: SimplePergaminoApp
import DashboardTiempoReal from '../admin/DashboardTiempoReal';
import PINAccess from '../components/PINAccess';

const Stack = createNativeStackNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pergamino App</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('QRScanner')}
        >
          <Text style={styles.buttonText}>Escanear QR - Cliente</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('PINAccess')}
        >
          <Text style={styles.buttonText}>Modo Mesero</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.adminButton]}
          onPress={() => navigation.navigate('MenuAdmin')}
        >
          <Text style={styles.buttonText}>Modo Admin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator>
  <Stack.Screen name="Inicio" component={HomeScreen} />
      <Stack.Screen name="InicioCompleto" component={HomeScreen} />
      <Stack.Screen name="QRScanner" component={QRScanner} />
      <Stack.Screen name="RegisterClient" component={RegisterClient} />
      <Stack.Screen name="ClienteQR" component={ClienteQR} />
      <Stack.Screen name="CanjeoPremios" component={CanjeoPremios} />
      <Stack.Screen name="HistorialConsumos" component={HistorialConsumos} />
      <Stack.Screen name="PINAccess" component={PINAccess} />
      <Stack.Screen name="ValidarQR" component={ValidarQR} />
      <Stack.Screen name="RegistrarConsumo" component={RegistrarConsumo} />
      <Stack.Screen name="MenuAdmin" component={MenuAdmin} />
      <Stack.Screen name="SimpleMenuAdmin" component={SimpleMenuAdmin} />
      <Stack.Screen name="Campañas" component={Campañas} />
      <Stack.Screen name="GenerarQR" component={GenerarQR} />
      <Stack.Screen name="ListaClientes" component={ListaClientes} />
      <Stack.Screen name="Estadisticas" component={Estadisticas} />
      <Stack.Screen name="Configuraciones" component={Configuraciones} />
      <Stack.Screen name="ExportarDatos" component={ExportarDatos} />
      <Stack.Screen name="BackupRestauracion" component={BackupRestauracion} />
      <Stack.Screen name="SimpleBackup" component={SimpleBackup} />
      <Stack.Screen name="DashboardTiempoReal" component={DashboardTiempoReal} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#8B4513',
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    backgroundColor: '#8B4513',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adminButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AppNavigator;
