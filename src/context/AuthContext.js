/**
 * AuthContext: provee user, isAuthenticated, userRole, login, register, logout.
 * Mockeable en tests: puedes envolver cualquier componente con AuthProvider.
 */
import React, { createContext, useState, useEffect } from 'react';
import { app, auth, db, enableEmulatorsIfNeeded } from '../services/firebaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [userRole, setUserRole] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		enableEmulatorsIfNeeded({ auth, db });
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			setUser(firebaseUser);
			if (firebaseUser) {
				// Obtiene el rol desde Firestore
				const ref = doc(db, 'roles', firebaseUser.uid);
				const snap = await getDoc(ref);
				setUserRole(snap.exists() ? snap.data().role : null);
			} else {
				setUserRole(null);
			}
			setLoading(false);
		});
		return () => unsubscribe();
	}, []);

	const login = async (email, password) => {
		setLoading(true);
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} finally {
			setLoading(false);
		}
	};

	const register = async (email, password) => {
		setLoading(true);
		try {
			// Validar que el RUT/DNI no esté en uso
			const dni = arguments[2]?.dni || '';
			const q = window && window.process ? null : require('firebase/firestore').query;
			const where = window && window.process ? null : require('firebase/firestore').where;
			const getDocs = window && window.process ? null : require('firebase/firestore').getDocs;
			let dniExists = false;
			if (dni) {
				const clientesQuery = require('firebase/firestore').query(require('firebase/firestore').collection(db, 'clientes'), require('firebase/firestore').where('dni', '==', dni));
				const snapshot = await require('firebase/firestore').getDocs(clientesQuery);
				dniExists = snapshot.docs.length > 0;
			}
			if (dniExists) {
				throw new Error('El RUT/DNI ya está registrado.');
			}
			// Registrar usuario en Auth
				const cred = await createUserWithEmailAndPassword(auth, email, password);
				// Asignar rol 'cliente' en Firestore
				await setDoc(doc(db, 'roles', cred.user.uid), { role: 'cliente' });
				// Guardar datos del usuario en la colección 'clientes'
				await setDoc(doc(db, 'clientes', cred.user.uid), {
					uid: cred.user.uid,
					email,
					nombre: arguments[2]?.nombre || '',
					apellido: arguments[2]?.apellido || '',
					dni: dni,
					nacimiento: arguments[2]?.nacimiento || '',
					fechaRegistro: new Date().toISOString(),
					puntos: 0,
					estado: 'activo',
					role: arguments[2]?.role || 'cliente'
				});
				return cred.user.uid;
		} finally {
			setLoading(false);
		}
	};

	const logout = async () => {
		setLoading(true);
		await signOut(auth);
		setLoading(false);
	};

	return (
		<AuthContext.Provider value={{ user, isAuthenticated: !!user, userRole, loading, login, register, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
