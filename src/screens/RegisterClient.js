// src/screens/RegisterClient.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, ScrollView, StatusBar, Alert, StyleSheet,
} from 'react-native';
import { auth, db } from '../services/firebase/app';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function RegisterClient({ onDone }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

    async function handleRegister() {
      if (!nombre || !apellido || !rut || !email || !password) {
        Alert.alert('Faltan datos', 'Completa los campos obligatorios.');
        return;
      }
      setLoading(true);
      try {
        // 1) valida RUT único en colección clientes (docId = RUT)
        const clienteRef = doc(db, 'clientes', rut);
        const snap = await getDoc(clienteRef);
        if (snap.exists()) {
          throw new Error('El RUT ya está registrado.');
        }

        // 2) Crea usuario Auth con email/password
        const cred = await createUserWithEmailAndPassword(auth, email, password);

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
        });

        Alert.alert('OK', 'Cliente registrado correctamente.');
        if (onDone) onDone();
      } catch (e) {
        Alert.alert('Error', e.message || String(e));
      } finally {
        setLoading(false);
      }
    }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar />
      <Text style={styles.title}>Registro de Cliente</Text>

      <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Apellido" value={apellido} onChangeText={setApellido} style={styles.input} />
      <TextInput placeholder="RUT (único)" value={rut} onChangeText={setRut} autoCapitalize="characters" style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Fecha Nacimiento (YYYY-MM-DD)" value={fechaNacimiento} onChangeText={setFechaNacimiento} style={styles.input} />
      <TextInput placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <View style={{ height: 12 }} />
      <Button title={loading ? 'Registrando...' : 'Registrar'} onPress={handleRegister} disabled={loading} />
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
});