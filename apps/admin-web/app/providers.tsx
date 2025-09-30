"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db, signIn as firebaseSignIn, signOut as firebaseSignOut } from "@/app/lib/firebase"; // ajusta ruta
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";

type Role = "admin" | "waiter" | "customer" | null;

type AuthCtx = {
  user: User | null;
  role: Role;
  loading: boolean; // cargando sesión/rol
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({ 
  user: null, 
  role: null, 
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {}
});
export const useAuth = () => useContext(AuthContext);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setRole(null);
        setLoading(false);
        // Si está en zona protegida y NO hay user, mandamos a login
        if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/analytics") || pathname?.startsWith("/alerts") || pathname?.startsWith("/clients")) {
          router.replace("/login");
        }
        return;
      }
      // cargar rol
      try {
        const r = await getDoc(doc(db, "roles", u.uid));
        const value = (r.exists() ? r.data()?.role : null) as Role;
        setRole(value || null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirección post-login a /dashboard sólo si está en /login y es admin
  useEffect(() => {
    console.log('Efecto de redirección ejecutado', { loading, pathname, user: !!user, role, isAdmin: role === "admin" });
    
    if (loading) {
      console.log('No redireccionando: todavía cargando estado de auth');
      return;
    }
    
    // Si está autenticado con rol admin y está en /login, redireccionar siempre a dashboard
    if (user && role === "admin") {
      console.log('Usuario autenticado como admin');
      
      if (pathname === "/login" || pathname === "/") {
        console.log('Redirigiendo a /dashboard desde', pathname);
        router.replace("/dashboard");
      } else {
        console.log('No es necesario redirigir, ya no estamos en /login o /', pathname);
      }
    } else {
      console.log('No redireccionando: no es un admin o no está autenticado', { isAuthenticated: !!user, role });
    }
  }, [loading, pathname, role, router, user]);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Iniciando sesión con:', email);
      const result = await firebaseSignIn(email, password);
      console.log('Login exitoso, usuario:', result.user.uid);
      
      // Determinar si es admin para redirigir inmediatamente
      try {
        const roleDoc = await getDoc(doc(db, "roles", result.user.uid));
        const userRole = (roleDoc.exists() ? roleDoc.data()?.role : null) as Role;
        console.log('Rol de usuario recuperado:', userRole);
        
        if (userRole === 'admin') {
          console.log('¡Es admin! Redirigiendo a /dashboard');
          // Forzar la redirección aquí, además del efecto de autenticación
          if (pathname === '/login' || pathname === '/') {
            router.replace('/dashboard');
          }
        } else {
          console.log('No es admin, no se redirige a /dashboard');
        }
      } catch (roleError) {
        console.error('Error al obtener rol:', roleError);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error al iniciar sesión');
      setLoading(false);
      throw err;
    }
  };
  
  // Logout function
  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await firebaseSignOut();
      router.push('/login');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Error al cerrar sesión');
      setLoading(false);
      throw err;
    }
  };

  const value = useMemo(() => ({ 
    user, 
    role, 
    loading,
    error,
    login,
    logout 
  }), [user, role, loading, error]);
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}