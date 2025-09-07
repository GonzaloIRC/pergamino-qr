// src/navigation/RouteGuards.js
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Component that only shows its children if the user is authenticated
export function RequireAuth({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ marginBottom: 20, fontSize: 18 }}>
          Por favor inicia sesión para continuar
        </Text>
      </View>
    );
  }
  
  return children;
}

// Component that only shows its children if the user has the specified role
export function RequireRole({ children, role }) {
  const { role: userRole } = useAuth();
  
  // Role can be a string or an array of allowed roles
  const hasPermission = Array.isArray(role)
    ? role.includes(userRole)
    : (role === userRole);
    
  if (!hasPermission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ marginBottom: 20, fontSize: 18 }}>
          No tienes permisos para acceder a esta sección
        </Text>
			</View>
		);
	}
	
	return children;
}
