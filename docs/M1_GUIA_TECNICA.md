# Guía Técnica para Implementación de M1

Este documento proporciona detalles técnicos para implementar los componentes más complejos de M1.

## 1. Estructura de Firebase Modular

### config.js
```javascript
// src/firebase/config.js
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const useEmulators = (process.env.EXPO_PUBLIC_USE_EMULATORS ?? 'false') === 'true';
```

### index.js
```javascript
// src/firebase/index.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig, useEmulators } from './config';

// Inicialización singleton
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export * from './auth';
export * from './firestore';
```

### auth.js
```javascript
// src/firebase/auth.js
import { getAuth, initializeAuth, connectAuthEmulator, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app, useEmulators } from './index';

// Inicializar Auth con persistencia
let auth;
try {
  auth = initializeAuth(app, { 
    persistence: getReactNativePersistence(AsyncStorage) 
  });
} catch (e) {
  auth = getAuth(app);
}

// Conectar al emulador si es necesario
if (useEmulators) {
  connectAuthEmulator(auth, 'http://localhost:9099');
}

export { auth };
```

### firestore.js
```javascript
// src/firebase/firestore.js
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { app, useEmulators } from './index';

// Inicializar Firestore
export const db = getFirestore(app);

// Conectar al emulador si es necesario
if (useEmulators) {
  connectFirestoreEmulator(db, 'localhost', 8080);
}

// Colecciones comunes
export const collections = {
  usuarios: 'Usuarios',
  beneficios: 'Beneficios',
  seriales: 'BeneficioSeriales',
  historial: 'Historial',
  configuracion: 'Configuracion'
};
```

## 2. Escáner QR con expo-camera

### QRScanner.js
```javascript
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { Button, TextInput } from 'react-native-paper';
import { processBNFCode, processAPPCode } from '../services/qrService';

export default function QRScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const lastScan = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    // Implementar debounce
    const now = Date.now();
    if (lastScan.current && (now - lastScan.current) < 1500) {
      return;
    }
    lastScan.current = now;
    
    setScanned(true);
    try {
      if (data.startsWith('BNF:')) {
        await processBNFCode(data);
      } else if (data.startsWith('APP:')) {
        await processAPPCode(data);
      } else {
        alert('Formato de código QR no reconocido');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleManualInput = async () => {
    if (!manualInput) return;
    
    try {
      if (manualInput.startsWith('BNF:')) {
        await processBNFCode(manualInput);
      } else if (manualInput.startsWith('APP:')) {
        await processAPPCode(manualInput);
      } else {
        alert('Formato de código manual no reconocido');
      }
      setManualInput('');
      setShowManual(false);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (hasPermission === null) {
    return <View><Text>Solicitando permisos de cámara...</Text></View>;
  }
  if (hasPermission === false) {
    return <View><Text>No hay acceso a la cámara</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        flashMode={torch ? Camera.Constants.FlashMode.torch : Camera.Constants.FlashMode.off}
      />
      
      <View style={styles.controls}>
        <Button 
          mode="contained" 
          onPress={() => setTorch(!torch)}
        >
          {torch ? 'Apagar Linterna' : 'Encender Linterna'}
        </Button>
        
        <Button 
          mode="contained" 
          onPress={() => setScanned(false)}
          style={{ marginTop: 10 }}
        >
          Escanear Nuevamente
        </Button>
        
        <Button 
          mode="outlined" 
          onPress={() => setShowManual(!showManual)}
          style={{ marginTop: 10 }}
        >
          Entrada Manual
        </Button>
        
        {showManual && (
          <View style={styles.manualContainer}>
            <TextInput
              label="Código manual"
              value={manualInput}
              onChangeText={setManualInput}
              placeholder="BNF:XXXX o APP:XXXXX:XXXXX"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleManualInput}>
              Procesar
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  manualContainer: {
    marginTop: 10,
  },
  input: {
    marginBottom: 10,
  }
});
```

## 3. Servicios para Procesamiento QR

### qrService.js
```javascript
// src/services/qrService.js
import { doc, getDoc, updateDoc, setDoc, serverTimestamp, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db, collections } from '../firebase/firestore';
import { auth } from '../firebase/auth';

/**
 * Procesa un código QR de formato BNF
 * @param {string} code - Código en formato BNF:serial
 */
export const processBNFCode = async (code) => {
  try {
    // Extraer el serial del código
    const serial = code.replace('BNF:', '');
    if (!serial) throw new Error('Serial inválido');
    
    // Referencia al documento del serial
    const serialRef = doc(db, collections.seriales, serial);
    
    // Obtener el estado actual
    const serialDoc = await getDoc(serialRef);
    
    // Validar que el serial exista
    if (!serialDoc.exists()) {
      throw new Error('El código QR no es válido o ha expirado');
    }
    
    // Verificar que el serial no esté usado
    if (serialDoc.data().estado === 'usado') {
      throw new Error('Este beneficio ya ha sido utilizado');
    }
    
    // Actualizar el estado del serial a "usado"
    await updateDoc(serialRef, {
      estado: 'usado',
      usadoEn: serverTimestamp(),
      usadoPor: auth.currentUser?.uid || 'anonymous',
    });
    
    // Registrar en el historial
    await addDoc(collection(db, collections.historial), {
      tipo: 'canje',
      serialId: serial,
      beneficioId: serialDoc.data().beneficioId,
      usuarioId: auth.currentUser?.uid || 'anonymous',
      fecha: serverTimestamp(),
    });
    
    return { success: true, message: 'Beneficio canjeado exitosamente' };
  } catch (error) {
    console.error('Error procesando código BNF:', error);
    throw error;
  }
};

/**
 * Procesa un código QR de formato APP
 * @param {string} code - Código en formato APP:dni:nonce
 */
export const processAPPCode = async (code) => {
  try {
    // Extraer DNI y nonce del código
    const parts = code.replace('APP:', '').split(':');
    if (parts.length !== 2) throw new Error('Formato de código inválido');
    
    const [dni, nonce] = parts;
    
    // Buscar el usuario por DNI
    const usuariosRef = collection(db, collections.usuarios);
    const q = query(usuariosRef, where('dni', '==', dni));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Usuario no encontrado. Verifique el DNI.');
    }
    
    // Obtener el ID del usuario
    const userId = querySnapshot.docs[0].id;
    
    // Registrar acumulación en el historial
    await addDoc(collection(db, collections.historial), {
      tipo: 'acumulacion',
      usuarioId: userId,
      operadorId: auth.currentUser?.uid || 'anonymous',
      fecha: serverTimestamp(),
      nonce: nonce, // Para evitar duplicados
    });
    
    return { success: true, message: 'Acumulación registrada exitosamente' };
  } catch (error) {
    console.error('Error procesando código APP:', error);
    throw error;
  }
};
```

## 4. Gestión de Clientes

### clienteService.js
```javascript
// src/services/clienteService.js
import { collection, addDoc, query, where, getDocs, doc, getDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, collections } from '../firebase/firestore';

/**
 * Crea un nuevo cliente
 * @param {Object} clienteData - Datos del cliente
 */
export const crearCliente = async (clienteData) => {
  try {
    // Verificar DNI único
    const dniExistente = await verificarDniExistente(clienteData.dni);
    if (dniExistente) {
      throw new Error('Ya existe un cliente con ese DNI');
    }
    
    // Añadir campos adicionales
    const nuevoCliente = {
      ...clienteData,
      fechaRegistro: serverTimestamp(),
      puntos: 0,
    };
    
    // Crear el cliente en Firestore
    const docRef = await addDoc(collection(db, collections.usuarios), nuevoCliente);
    
    return { id: docRef.id, ...nuevoCliente };
  } catch (error) {
    console.error('Error creando cliente:', error);
    throw error;
  }
};

/**
 * Verifica si ya existe un cliente con el DNI especificado
 * @param {string} dni - DNI a verificar
 */
export const verificarDniExistente = async (dni) => {
  const q = query(collection(db, collections.usuarios), where('dni', '==', dni));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

/**
 * Busca clientes en tiempo real con onSnapshot
 * @param {string} searchTerm - Término de búsqueda
 * @param {Function} callback - Función callback para resultados
 */
export const buscarClientesEnVivo = (searchTerm, callback) => {
  if (!searchTerm || searchTerm.length < 3) {
    callback([]);
    return () => {};
  }
  
  // Podríamos mejorar esto con índices y búsqueda por prefijo
  const q = query(collection(db, collections.usuarios));
  
  // Devolvemos el unsubscribe para poder detener la suscripción
  return onSnapshot(q, (snapshot) => {
    const clientes = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Filtrar localmente
      if (
        data.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.dni?.includes(searchTerm)
      ) {
        clientes.push({
          id: doc.id,
          ...data
        });
      }
    });
    callback(clientes);
  });
};

/**
 * Obtiene el historial de un cliente
 * @param {string} clienteId - ID del cliente
 */
export const obtenerHistorialCliente = async (clienteId) => {
  try {
    const q = query(
      collection(db, collections.historial),
      where('usuarioId', '==', clienteId)
    );
    const querySnapshot = await getDocs(q);
    
    const historial = [];
    querySnapshot.forEach((doc) => {
      historial.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return historial;
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    throw error;
  }
};
```

Esta guía técnica proporciona el código base para implementar las partes más complejas del alcance de M1. Recuerda adaptar estos ejemplos según las necesidades específicas del proyecto y la estructura actual del código.
