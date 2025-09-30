// apps/admin-web/app/lib/auth.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { auth, db, onAuthChange, signIn, signOut } from './firebase';

// Types
type AuthContextType = {
  user: User | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Get user role from Firestore
          const roleDoc = await getDoc(doc(db, 'roles', user.uid));
          const userRole = roleDoc.exists() ? roleDoc.data().role : 'customer';
          setRole(userRole);
          
          // Redirect based on role
          if (userRole !== 'admin' && pathname !== '/login') {
            router.push('/login');
          } else if (userRole === 'admin' && pathname === '/login') {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        }
      } else {
        setRole(null);
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [pathname, router]);
  
  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    console.log('Intentando iniciar sesión con:', { email, emulatorEnabled: process.env.NEXT_PUBLIC_USE_EMULATORS === 'true' });
    
    try {
      await signIn(email, password);
      console.log('Inicio de sesión exitoso');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await signOut();
      router.push('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Error al cerrar sesión');
    }
    
    setLoading(false);
  };
  
  // Context value
  const value = {
    user,
    role,
    loading,
    error,
    login,
    logout,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Role-based route protection
export function withAuth(Component: React.ComponentType) {
  return function ProtectedRoute(props: any) {
    const { user, role, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
      
      if (!loading && user && role !== 'admin') {
        router.push('/login');
      }
    }, [loading, user, role, router]);
    
    if (loading) {
      return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
    }
    
    if (!user || role !== 'admin') {
      return null;
    }
    
    return <Component {...props} />;
  };
}