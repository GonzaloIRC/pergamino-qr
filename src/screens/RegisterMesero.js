import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../services/firebaseClient';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function RegisterMesero({ navigation }){
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(){
    if(!nombre || !apellido || !dni || !email || !password){
      Alert.alert('Faltan datos', 'Completa todos los campos obligatorios.');
      return;
    }
    setLoading(true);
    try {
      const dniRef = doc(db, 'meseros', String(dni));
      const exists = await getDoc(dniRef);
      if (exists.exists()) {
        Alert.alert('DNI ya registrado', 'Este RUT/DNI ya existe en la base.');
        setLoading(false);
        return;
      }
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(dniRef, {
        dni: String(dni),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        categoria: 'mesero',
        createdAt: serverTimestamp(),
        activo: true,
      });
      Alert.alert('OK', 'Mesero registrado');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error registrando', String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro de Mesero</Text>
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder='Nombre' />
      <Text style={styles.label}>Apellido</Text>
      <TextInput style={styles.input} value={apellido} onChangeText={setApellido} placeholder='Apellido' />
      <Text style={styles.label}>RUT / DNI</Text>
      <TextInput style={styles.input} value={dni} onChangeText={setDni} placeholder='11111111-1' autoCapitalize='none' />
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder='correo@ejemplo.com' autoCapitalize='none' keyboardType='email-address' />
      <Text style={styles.label}>Contraseña</Text>
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder='••••••••' secureTextEntry />
      <View style={{ height: 12 }} />
      <Button title={loading ? 'Registrando...' : 'Registrar'} onPress={handleRegister} disabled={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 8 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', marginTop: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16 },
});
