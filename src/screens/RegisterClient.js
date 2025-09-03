// src/screens/RegisterClient.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, ScrollView, StatusBar, Alert, StyleSheet, ActivityIndicator
} from 'react-native';
import { auth, db } from '../services/firebase/app';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { checkFirebaseConnection } from '../utils/firebaseConnectionCheck';

export default function RegisterClient({ onDone }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ checking: true, auth: false, firestore: false, error: null });

  // Verificar la conexión a Firebase al cargar el componente
  useEffect(() => {
    async function verifyConnection() {
      try {
        const status = await checkFirebaseConnection();
        setConnectionStatus({
          checking: false,
          ...status
        });
        
        if (!status.auth || !status.firestore) {
          Alert.alert(
            "Problema de conexión", 
            "No se pudo conectar correctamente a los servicios. Esto puede afectar el proceso de registro.",
            [{ text: "Entendido" }]
          );
        }
      } catch (error) {
        console.error("Error verificando conexión:", error);
        setConnectionStatus({
          checking: false,
          auth: false,
          firestore: false,
          error: error.message
        });
      }
    }
    
    verifyConnection();
  }, []);

    async function handleRegister() {
      if (!nombre || !apellido || !rut || !email || !password) {
        Alert.alert('Faltan datos', 'Completa los campos obligatorios.');
        return;
      }
      
      // Validación básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Email inválido', 'Por favor ingresa un email válido');
        return;
      }

      // Validación de contraseña
      if (password.length < 6) {
        Alert.alert('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres');
        return;
      }

      console.log('Iniciando registro de cliente:', { nombre, apellido, rut, email });
      setLoading(true);
      
      try {
        console.log('Paso 1: Validando RUT único');
        // 1) valida RUT único en colección clientes (docId = RUT)
        const clienteRef = doc(db, 'clientes', rut);
        const snap = await getDoc(clienteRef);
        if (snap.exists()) {
          throw new Error('El RUT ya está registrado.');
        }

        console.log('Paso 2: Creando usuario en Authentication');
        // 2) Crea usuario Auth con email/password
        const cred = await createUserWithEmailAndPassword(auth, email, password)
          .catch(error => {
            console.error('Error en createUserWithEmailAndPassword:', error.code, error.message);
            if (error.code === 'auth/email-already-in-use') {
              throw new Error('Este email ya está registrado. Intenta iniciar sesión.');
            } else if (error.code === 'auth/invalid-email') {
              throw new Error('El formato del email no es válido.');
            } else if (error.code === 'auth/network-request-failed') {
              throw new Error('Problema de conexión. Verifica tu internet e intenta nuevamente.');
            } else {
              throw error;
            }
          });

        if (!cred || !cred.user) {
          throw new Error('No se pudo crear la cuenta de usuario');
        }

        console.log('Paso 3: Guardando datos en Firestore');
        // 3) Guarda perfil en Firestore (clave = RUT)
        await setDoc(clienteRef, {
          uid: cred.user.uid,
          nombre: nombre,
          apellido: apellido,
          email: email,
          rut: rut,
          fechaNacimiento: fechaNacimiento || null,
          puntos: 0,
          categoria: 'cliente',
          walletActivo: true,
          fechaRegistro: serverTimestamp()
        }).catch(error => {
          console.error('Error en setDoc:', error);
          throw new Error('Cuenta creada pero hubo un problema al guardar los datos. Intenta iniciar sesión.');
        });

        console.log('Registro completado con éxito');
        Alert.alert('OK', 'Cliente registrado correctamente.');
        if (onDone) onDone();
      } catch (e) {
        console.error('Error en registro:', e);
        Alert.alert('Error', e.message || String(e));
      } finally {
        setLoading(false);
      }
    }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar />
      <Text style={styles.title}>Registro de Cliente</Text>
      
      {connectionStatus.checking ? (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#5a3e84" />
          <Text style={styles.statusText}>Verificando conexión...</Text>
        </View>
      ) : !connectionStatus.auth || !connectionStatus.firestore ? (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>Estado de conexión:</Text>
          <Text style={styles.statusText}>Firebase Auth: {connectionStatus.auth ? '✅' : '❌'}</Text>
          <Text style={styles.statusText}>Firestore: {connectionStatus.firestore ? '✅' : '❌'}</Text>
          {connectionStatus.error && (
            <Text style={styles.errorDetail}>{connectionStatus.error}</Text>
          )}
          <Button 
            title="Reintentar conexión" 
            onPress={async () => {
              setConnectionStatus({ checking: true, auth: false, firestore: false, error: null });
              const status = await checkFirebaseConnection();
              setConnectionStatus({ checking: false, ...status });
            }} 
          />
        </View>
      ) : null}

      <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Apellido" value={apellido} onChangeText={setApellido} style={styles.input} />
      <TextInput placeholder="RUT (único)" value={rut} onChangeText={setRut} autoCapitalize="characters" style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Fecha Nacimiento (YYYY-MM-DD)" value={fechaNacimiento} onChangeText={setFechaNacimiento} style={styles.input} />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <View style={{ height: 12 }} />
      <Button 
        title={loading ? 'Registrando...' : 'Registrar'} 
        onPress={handleRegister} 
        disabled={loading || connectionStatus.checking || (!connectionStatus.auth && !connectionStatus.firestore)} 
      />
      <View style={{ height: 8 }} />
      <Button title="Volver" onPress={() => onDone && onDone()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  statusContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusText: {
    fontSize: 14,
    marginVertical: 4,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  }
});