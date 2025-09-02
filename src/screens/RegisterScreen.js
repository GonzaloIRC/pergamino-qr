import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  // Eliminado DatePicker, solo TextInput
  const { register, loading } = useContext(AuthContext);
  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '', email: '', nacimiento: '', password: ''
  });
  const [testCounter, setTestCounter] = useState(1);

  const rellenarDatosPrueba = () => {
    const n = testCounter;
    setForm({
      nombre: `TestNombre${n}`,
      apellido: `TestApellido${n}`,
      dni: `9999999${n}`,
      email: `PRUEBA${n}@gmail.com`,
      nacimiento: `1990-01-0${(n % 9) + 1}`,
      password: '123456',
    });
    setTestCounter(n + 1);
  };
  const [selectedRole, setSelectedRole] = useState('customer');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validateForm = () => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.apellido.trim()) return 'El apellido es obligatorio.';
    if (!form.dni.trim()) return 'El RUT/DNI es obligatorio.';
    if (!form.email.trim()) return 'El email es obligatorio.';
    if (!form.nacimiento.trim()) return 'La fecha de nacimiento es obligatoria.';
    if (!form.password || form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    // Validación básica de email
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'El email no es válido.';
    return null;
  };

  const onSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Error', error);
      return;
    }
    try {
      // Usar el método register del AuthContext y obtener el UID
      const uid = await register(form.email, form.password, {
        ...form,
        role: selectedRole
      });

      // Registrar historial de movimientos para el usuario recién creado
      const { db } = require('../services/firebaseClient');
      const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
      const movimientosRef = collection(db, 'clientes', uid, 'movimientos');
      await addDoc(movimientosRef, {
        tipo: 'registro',
        descripcion: `Usuario registrado como ${selectedRole}`,
        fecha: serverTimestamp(),
      });

      Alert.alert('OK', 'Registro completado. Inicia sesión.');
      navigation.replace('Login');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 8 }}>Registro de Usuario</Text>

      {/* Botones de selección de rol */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 16 }}>
        <Button
          title="Cliente"
          color={selectedRole === 'customer' ? '#007AFF' : '#ccc'}
          onPress={() => setSelectedRole('customer')}
        />
        <View style={{ width: 10 }} />
        <Button
          title="Mesero"
          color={selectedRole === 'waiter' ? '#007AFF' : '#ccc'}
          onPress={() => setSelectedRole('waiter')}
        />
        <View style={{ width: 10 }} />
        <Button
          title="Admin"
          color={selectedRole === 'admin' ? '#007AFF' : '#ccc'}
          onPress={() => setSelectedRole('admin')}
        />
      </View>

      {/* Botón para rellenar datos de prueba */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Button title="Rellenar datos de prueba" color="#8B4513" onPress={rellenarDatosPrueba} />
      </View>

      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontWeight: '600', marginBottom: 4, color: '#8B4513' }}>Nombre</Text>
        <TextInput placeholder="Ej: Juan" placeholderTextColor="#8B4513" value={form.nombre} onChangeText={(v) => set('nombre', v)} style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, backgroundColor: '#f2f2f2' }} />
      </View>
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontWeight: '600', marginBottom: 4, color: '#8B4513' }}>Apellido</Text>
        <TextInput placeholder="Ej: Pérez" placeholderTextColor="#8B4513" value={form.apellido} onChangeText={(v) => set('apellido', v)} style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, backgroundColor: '#f2f2f2' }} />
      </View>
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontWeight: '600', marginBottom: 4, color: '#8B4513' }}>RUT/DNI</Text>
  <TextInput placeholder="Ej: 12.345.678-9" placeholderTextColor="#8B4513" value={form.dni} onChangeText={(v) => set('dni', v)} style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, backgroundColor: '#f2f2f2' }} />
      </View>
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontWeight: '600', marginBottom: 4, color: '#8B4513' }}>Email</Text>
  <TextInput placeholder="Ej: correo@dominio.com" placeholderTextColor="#8B4513" value={form.email} onChangeText={(v) => set('email', v)} autoCapitalize="none" keyboardType="email-address" style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, backgroundColor: '#f2f2f2' }} />
      </View>
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontWeight: '600', marginBottom: 4, color: '#8B4513' }}>Fecha nacimiento</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#8B4513"
          value={form.nacimiento}
          onChangeText={(v) => set('nacimiento', v)}
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, backgroundColor: '#f2f2f2' }}
        />
      </View>
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontWeight: '600', marginBottom: 4, color: '#8B4513' }}>Contraseña</Text>
  <TextInput placeholder="Mínimo 6 caracteres" placeholderTextColor="#8B4513" secureTextEntry value={form.password} onChangeText={(v) => set('password', v)} style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, backgroundColor: '#f2f2f2' }} />
      </View>
      <Button title={loading ? 'Registrando...' : 'Registrar'} onPress={onSubmit} />
    </ScrollView>
  );
}
