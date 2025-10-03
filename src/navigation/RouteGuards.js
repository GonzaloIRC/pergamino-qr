// src/navigation/RouteGuards.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseClient';

/**
 * Componente que solo muestra sus children si el usuario está autenticado
 */
export function RequireAuth({ children }) {
  const { user, isLoading } = useContext(AuthContext);
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 20 }}>Verificando autenticación...</Text>
      </View>
    );
  }
  
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

/**
 * Higher-Order Component que verifica si el usuario tiene los roles requeridos
 * @param {string|string[]} allowedRoles - Rol o roles permitidos
 * @param {React.Component} Component - Componente a envolver
 * @returns {React.Component} Componente con verificación de roles
 */
export function RequireRole(allowedRoles, Component) {
  // Devuelve un nuevo componente funcional
  return function RoleWrapper(props) {
    const { user } = useContext(AuthContext);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Cargar el rol del usuario desde Firestore
    useEffect(() => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      // Referencia al documento de rol
      const roleRef = doc(db, 'roles', user.uid);
      
      // Suscripción a cambios en tiempo real
      const unsubscribe = onSnapshot(
        roleRef, 
        (snapshot) => {
          if (snapshot.exists()) {
            setRole(snapshot.data().role);
          } else {
            setRole('customer'); // Rol por defecto
          }
          setLoading(false);
        },
        (error) => {
          console.error('Error al cargar el rol:', error);
          setRole('customer'); // Rol por defecto en caso de error
          setLoading(false);
        }
      );
      
      return () => unsubscribe();
    }, [user]);
    
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 20 }}>Verificando permisos...</Text>
        </View>
      );
    }
    
    // Role puede ser un string o un array de roles permitidos
    const hasPermission = Array.isArray(allowedRoles)
      ? allowedRoles.includes(role)
      : (allowedRoles === role);
      
    if (!hasPermission) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ marginBottom: 20, fontSize: 18 }}>
            No tienes permisos para acceder a esta sección
          </Text>
        </View>
      );
    }
    
    // Pasar todas las props al componente original
    return <Component {...props} />;
  };
}
