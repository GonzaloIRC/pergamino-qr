import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export function RequireAuth(Component) {
	return function Wrapper(props) {
		const { isAuthenticated, loading } = useContext(AuthContext);
		if (loading) return <Text>Cargando...</Text>;
		if (!isAuthenticated) {
			return (
				<View style={{ padding: 24 }}>
					<Text style={{ marginBottom: 12 }}>Acceso denegado: inicia sesión.</Text>
					<Button title="Ir a Login" onPress={() => props.navigation.replace('Login')} />
				</View>
			);
		}
		return <Component {...props} />;
	};
}

export function RequireRole(roles, Component) {
	return function Wrapper(props) {
		const { userRole, isAuthenticated, loading, logout } = useContext(AuthContext);
		if (loading) return <Text>Cargando...</Text>;
		if (!isAuthenticated) return <RequireAuth Component={Component} {...props} />;
		if (!roles.includes(userRole || 'customer')) {
			return (
				<View style={{ padding: 24 }}>
					<Text style={{ marginBottom: 12 }}>Acceso denegado: rol insuficiente.</Text>
					<Button title="Cerrar sesión" onPress={logout} />
				</View>
			);
		}
		return <Component {...props} />;
	};
}
