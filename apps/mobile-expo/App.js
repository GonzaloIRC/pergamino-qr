import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, Button } from 'react-native';
import RootNavigation from '../../src/navigation';
import { ThemeProvider } from '../../src/context/ThemeContext';
import { AuthProvider } from '../../src/context/AuthContext';
import { checkEmulatorConfig, mockAuthForTesting } from '../../src/utils/emulatorCheck';
import { useEmulators } from '../../src/services/firebaseClient';
import { db, auth, enableEmulatorsIfNeeded } from '../../src/services/firebaseClient';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Configurar emuladores y manejo de errores
    try {
      // Asegurarse de que los emuladores están conectados si están activados
      if (useEmulators) {
        console.log('🔧 Inicializando emuladores en App.js...');
        enableEmulatorsIfNeeded({ auth, db });
        // Crear usuario mock para testing si estamos usando emuladores
        mockAuthForTesting();
      }
      
      // Verificar configuración
      const config = checkEmulatorConfig();
      console.log('Config check:', config);
      
      setIsReady(true);
    } catch (err) {
      console.error('Error en la inicialización:', err);
      setError(err.message);
    }
  }, []);

  // Mostrar pantalla de error si hay problemas
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
          Error de inicialización
        </Text>
        <Text style={{ marginBottom: 20, textAlign: 'center' }}>{error}</Text>
        <Button title="Reintentar" onPress={() => window.location.reload()} />
      </View>
    );
  }

  // Pantalla de carga mientras se inicializa
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando aplicación...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <ThemeProvider>
        <AuthProvider>
          <RootNavigation />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}