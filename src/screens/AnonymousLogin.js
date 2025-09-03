// src/screens/AnonymousLogin.js
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { auth } from '../services/firebase/app';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function AnonymousLogin({ onDone }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('guest@pergamino.test');
  const [password, setPassword] = useState('pergamino123');
  const [mode, setMode] = useState('signin'); // 'signin' o 'signup'

  const handleTestLogin = async () => {
    setLoading(true);
    try {
      console.log(`Intentando inicio de sesión con ${email}...`);
      let userCredential;
      
      if (mode === 'signin') {
        // Intenta iniciar sesión con las credenciales proporcionadas
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
          // Si el usuario no existe, intenta crearlo
          if (error.code === 'auth/user-not-found') {
            console.log('Usuario no encontrado, intentando crear uno nuevo...');
            setMode('signup');
            throw error; // Propagar para manejar en catch externo
          } else {
            throw error;
          }
        }
      } else {
        // Modo registro
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      console.log('Inicio de sesión exitoso:', userCredential.user.uid);
      Alert.alert('Éxito', `Has iniciado sesión como ${email}`);
      if (onDone) onDone();
    } catch (error) {
      console.error('Error en inicio de sesión:', error);
      
      // Mensajes de error personalizados
      let errorMessage = error.message || String(error);
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado. Intenta registrarte primero.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta. Inténtalo de nuevo.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está registrado. Intenta iniciar sesión.';
        setMode('signin');
      }
      
      Alert.alert(
        'Error de inicio de sesión', 
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio de Sesión de Prueba</Text>
      <Text style={styles.subtitle}>
        Usa estas credenciales para probar la aplicación
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña:</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#5a3e84" style={styles.loader} />
      ) : (
        <View style={styles.buttonRow}>
          <Button 
            title={mode === 'signin' ? "Iniciar Sesión" : "Registrarse"} 
            onPress={handleTestLogin} 
          />
        </View>
      )}
      
      {!loading && (
        <Button
          title={mode === 'signin' ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          color="#666"
        />
      )}
      
      {onDone && (
        <View style={styles.backButtonContainer}>
          <Button title="Volver" onPress={onDone} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 10,
    textAlign: 'center'
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center'
  },
  loader: {
    marginVertical: 20
  },
  backButtonContainer: {
    marginTop: 20
  }
});
