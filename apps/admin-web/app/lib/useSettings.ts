// apps/admin-web/app/lib/useSettings.ts
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Default settings
const DEFAULT_SETTINGS = {
  QR_TTL_SECONDS: 30,
  SCAN_COOLDOWN_MS: 3000,
  LIMITS_PER_WEEK: 3,
  COOLDOWN_MIN: 20,
  GEO_RADIUS_M: 200,
  MAINTENANCE_MODE: false,
  AUTO_LOCK_SEC: 300
};

export type Settings = typeof DEFAULT_SETTINGS;

// Settings hook
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get settings from Firestore
  useEffect(() => {
    const settingsRef = doc(db, 'Ajustes', 'global');
    
    // Real-time subscription
    const unsubscribe = onSnapshot(
      settingsRef,
      (doc) => {
        if (doc.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...doc.data() as Settings });
        } else {
          // If settings don't exist, use defaults
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error getting settings:', err);
        setError(err.message);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);
  
  // Update settings
  const updateSettings = async (newSettings: Partial<Settings>) => {
    setLoading(true);
    setError(null);
    
    try {
      const settingsRef = doc(db, 'Ajustes', 'global');
      await updateDoc(settingsRef, newSettings);
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return {
    settings,
    loading,
    error,
    updateSettings
  };
}