// src/hooks/useSettings.js
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseClient';

// Configuraciones por defecto en caso de no poder cargar desde Firestore
const DEFAULT_SETTINGS = {
  QR_TTL_SECONDS: 30,
  SCAN_COOLDOWN_MS: 3000,
  LIMITS_PER_WEEK: 3,
  COOLDOWN_MIN: 20,
  GEO_RADIUS_M: 200,
  MAINTENANCE_MODE: false,
  AUTO_LOCK_SEC: 300
};

/**
 * Hook personalizado para acceder a las configuraciones globales 
 * almacenadas en Firestore/Ajustes/global
 * 
 * @returns {Object} Objeto con las configuraciones y función para actualizar
 */
export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Referencia al documento de configuraciones globales
    const settingsRef = doc(db, 'Ajustes', 'global');
    
    // Suscripción a cambios en tiempo real
    const unsubscribe = onSnapshot(settingsRef, 
      // Callback de éxito
      (snapshot) => {
        if (snapshot.exists()) {
          const newSettings = { ...DEFAULT_SETTINGS, ...snapshot.data() };
          setSettings(newSettings);
        } else {
          console.log('No hay configuraciones disponibles, usando valores por defecto');
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      // Callback de error
      (err) => {
        console.error('Error al cargar configuraciones:', err);
        setError(err);
        setLoading(false);
      }
    );
    
    // Limpieza al desmontar el componente
    return () => unsubscribe();
  }, []);
  
  return { settings, loading, error };
}