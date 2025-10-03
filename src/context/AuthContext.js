// src/context/AuthContext.js
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { auth, db, useEmulators } from '../services/firebaseClient';
import {
  onAuthStateChanged, signInAnonymously
} from 'firebase/auth';
import {
  doc, getDoc
} from 'firebase/firestore';

export const AuthContext = createContext({ 
  user: null, 
  role: 'guest', 
  profile: null, 
  isLoading: true, 
  error: null,
  isPlatformWeb: false 
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest'); // 'customer' | 'waiter' | 'admin'
  const [profile, setProfile] = useState(null); // {dni, ...}
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Detectar si estamos en plataforma web
  const [isPlatformWeb, setIsPlatformWeb] = useState(false);
  
  // Detectar plataforma al inicio
  useEffect(() => {
    // Detectar si estamos en un navegador web
    const isWeb = typeof window !== 'undefined' && 
                 !window.navigator.userAgent.includes('ReactNative') &&
                 !window.navigator.userAgent.includes('Expo');
    
    setIsPlatformWeb(isWeb);
  }, []);

  useEffect(() => {
    // Si estamos usando emuladores, podemos crear un usuario de prueba directamente
    if (useEmulators) {
      console.log('🔧 Usando emuladores - creando usuario de prueba');
      
      // Usuario de prueba para desarrollo con emuladores
      const testUser = {
        uid: 'test-waiter-123',
        email: 'waiter@test.com',
        displayName: 'Mesero de Prueba'
      };
      
      setUser(testUser);
      setRole('waiter'); // Podemos elegir el rol que queremos probar
      setProfile({
        nombre: 'Mesero de Prueba',
        telefono: '123456789',
        createdAt: new Date()
      });
      setIsLoading(false);
      return () => {};
    }
    
    // Si no usamos emuladores, seguimos el flujo normal
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (!u) {
          // auth mínima en emulador / dev
          try { await signInAnonymously(auth); }
          catch (e) { 
            console.warn('Error al iniciar sesión anónima:', e);
          }
          setUser(null);
          setRole('guest');
          setProfile(null);
          setIsLoading(false);
          return;
        }
        setUser(u);

        // rol en roles/{uid}
        let r = 'waiter'; // Por defecto waiter para pruebas
        try {
          const rSnap = await getDoc(doc(db, 'roles', u.uid));
          if (rSnap.exists()) r = rSnap.data()?.role || r;
        } catch (e) {
          console.warn('Error al obtener rol:', e);
        }
        setRole(r);

        // perfil por uid
        try {
          const pSnap = await getDoc(doc(db, 'Perfiles', u.uid));
          if (pSnap.exists()) setProfile(pSnap.data());
        } catch (e) {
          console.warn('Error al obtener perfil:', e);
        }
      } catch (e) {
        console.error('Error en autenticación:', e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const value = useMemo(() => ({ 
    user, 
    role, 
    profile, 
    isLoading,
    error,
    isPlatformWeb
  }), [user, role, profile, isLoading, error, isPlatformWeb]);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
