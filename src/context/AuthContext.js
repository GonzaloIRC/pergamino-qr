// src/context/AuthContext.js
import React, { createContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from '../services/firebaseClient';
import {
  onAuthStateChanged, signInAnonymously
} from 'firebase/auth';
import {
  doc, getDoc
} from 'firebase/firestore';

export const AuthCtx = createContext({ user: null, role: 'guest', profile: null });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('guest'); // 'customer' | 'waiter' | 'admin'
  const [profile, setProfile] = useState(null); // {dni, ...}

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        // auth mínima en emulador / dev
        try { await signInAnonymously(auth); }
        catch { /* noop */ }
        setUser(null);
        setRole('guest');
        setProfile(null);
        return;
      }
      setUser(u);

      // rol en roles/{uid}
      let r = 'waiter';
      try {
        const rSnap = await getDoc(doc(db, 'roles', u.uid));
        if (rSnap.exists()) r = rSnap.data()?.role || r;
      } catch {}
      setRole(r);

      // perfil por uid (si usas Clientes por DNI, puedes mapear por uid->dni en otra colección)
      try {
        const pSnap = await getDoc(doc(db, 'Perfiles', u.uid));
        if (pSnap.exists()) setProfile(pSnap.data());
      } catch {}
    });
    return () => unsub();
  }, []);

  const value = useMemo(() => ({ user, role, profile }), [user, role, profile]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = React.useContext(AuthCtx);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
