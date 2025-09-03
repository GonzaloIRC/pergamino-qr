import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { checkFirebaseCredentials } from '../utils/firebaseCredentialCheck';
import AnonymousLogin from './AnonymousLogin';

export default function LoginScreen({ navigation }) {
	const { login, loading } = useContext(AuthContext);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showAnonymousLogin, setShowAnonymousLogin] = useState(false);
	const [checkingCredentials, setCheckingCredentials] = useState(false);
	const [credentialStatus, setCredentialStatus] = useState(null);

	const onSubmit = async () => {
		try { 
			await login(email, password); 
			navigation.replace('MainTabs'); 
		}
		catch (e) { 
			console.error('Error de login:', e);
			Alert.alert('Error de login', e.message);
		}
	};
	
	const verifyFirebaseCredentials = async () => {
		setCheckingCredentials(true);
		try {
			const result = await checkFirebaseCredentials();
			setCredentialStatus(result);
			Alert.alert(
				result.success ? 'Credenciales Válidas' : 'Problema de Credenciales',
				result.message
			);
		} catch (error) {
			console.error('Error al verificar credenciales:', error);
			setCredentialStatus({
				success: false,
				message: `Error: ${error.message}`
			});
			Alert.alert('Error', `No se pudieron verificar las credenciales: ${error.message}`);
		} finally {
			setCheckingCredentials(false);
		}
	};

	if (showAnonymousLogin) {
		return <AnonymousLogin 
		  onDone={() => setShowAnonymousLogin(false)} 
		  navigation={navigation}
		/>;
	}

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title}>Ingresar</Text>
			
			<TextInput 
				placeholder="Email" 
				autoCapitalize="none" 
				keyboardType="email-address" 
				value={email} 
				onChangeText={setEmail} 
				style={styles.input} 
			/>
			
			<TextInput 
				placeholder="Contraseña" 
				secureTextEntry 
				value={password} 
				onChangeText={setPassword} 
				style={styles.input} 
			/>
			
			<View style={styles.buttonContainer}>
				<Button 
					title={loading ? 'Entrando...' : 'Entrar'} 
					onPress={onSubmit}
					disabled={loading} 
				/>
			</View>
			
			<View style={styles.buttonContainer}>
				<Button 
					title="¿No tienes cuenta? Regístrate" 
					onPress={() => navigation.navigate('Register')} 
				/>
			</View>

			<View style={styles.divider} />
			
			<Text style={styles.sectionTitle}>Opciones de diagnóstico</Text>
			
			<View style={styles.buttonContainer}>
				<Button 
					title="Verificar Credenciales Firebase" 
					onPress={verifyFirebaseCredentials}
					disabled={checkingCredentials} 
				/>
			</View>
			
			{checkingCredentials && (
				<View style={styles.statusContainer}>
					<ActivityIndicator size="small" color="#5a3e84" />
					<Text style={styles.statusText}>Verificando credenciales...</Text>
				</View>
			)}
			
			{credentialStatus && (
				<View style={[
					styles.statusContainer, 
					credentialStatus.success ? styles.successContainer : styles.errorContainer
				]}>
					<Text style={styles.statusText}>
						{credentialStatus.success ? '✅ ' : '❌ '}
						{credentialStatus.message}
					</Text>
				</View>
			)}
			
			<View style={styles.buttonContainer}>
				<Button 
					title="Acceder como Invitado" 
					onPress={() => setShowAnonymousLogin(true)}
				/>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 24,
		flexGrow: 1,
	},
	title: {
		fontSize: 24,
		fontWeight: '700',
		marginBottom: 20,
		textAlign: 'center'
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 10,
		marginTop: 10,
		textAlign: 'center'
	},
	input: {
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
		backgroundColor: '#fff'
	},
	buttonContainer: {
		marginBottom: 16
	},
	divider: {
		height: 1,
		backgroundColor: '#ddd',
		marginVertical: 20
	},
	statusContainer: {
		backgroundColor: '#f8f8f8',
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center'
	},
	successContainer: {
		backgroundColor: '#e7f3e8',
		borderColor: '#c3e6cb',
		borderWidth: 1
	},
	errorContainer: {
		backgroundColor: '#f8d7da',
		borderColor: '#f5c6cb',
		borderWidth: 1
	},
	statusText: {
		fontSize: 14,
		marginLeft: 8
	}
});
