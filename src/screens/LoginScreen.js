import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
	const { login, loading } = useContext(AuthContext);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const onSubmit = async () => {
		try { await login(email, password); navigation.replace('MainTabs'); }
		catch (e) { Alert.alert('Error', e.message); }
	};

	return (
		<View style={{ padding: 24, gap: 12 }}>
			<Text style={{ fontSize: 20, fontWeight: '700' }}>Ingresar</Text>
			<TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 10 }} />
			<TextInput placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 10 }} />
			<Button title={loading ? 'Entrando...' : 'Entrar'} onPress={onSubmit} />
			<Button title="¿No tienes cuenta? Regístrate" onPress={() => navigation.navigate('Register')} />
		</View>
	);
}
