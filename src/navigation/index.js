import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import RoleBasedNavigator from './RoleBasedNavigator';

/**
 * Componente principal de navegación que controla el flujo entre autenticación
 * y navegación basada en roles para usuarios autenticados
 */
export default function RootNavigation() {
  const { user } = useContext(AuthContext);
  
  return (
    <NavigationContainer>
      {user ? <RoleBasedNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}


