import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import RootNavigation from './src/navigation';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebase/firebaseConfig';
import { enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ignorar advertencias específicas (opcional)
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native core',
  'Setting a timer for a long period of time',
  'VirtualizedLists should never be nested inside plain ScrollViews'
]);

export default function App() {
  // Habilitar persistencia cuando la app se inicia (opcional)
  useEffect(() => {
    const setupFirestore = async () => {
      try {
        // Habilitar persistencia offline (opcional)
        await enableIndexedDbPersistence(db);
      } catch (error) {
        console.log('Error enabling persistence:', error.code);
      }
    };

    setupFirestore();
  }, []);

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
// ...existing code...
