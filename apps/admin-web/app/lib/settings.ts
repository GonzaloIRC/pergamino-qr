// apps/admin-web/app/lib/settings.ts
'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { getDocument, setDocument } from './firestore';

export interface GlobalSettings {
  QR_TTL_SECONDS: number;
  SCAN_COOLDOWN_MS: number;
  LIMITS_PER_WEEK: number;
  COOLDOWN_MIN: number;
  GEO_RADIUS_M: number;
  MAINTENANCE_MODE: boolean;
  AUTO_LOCK_SEC: number;
}

export const DEFAULT_SETTINGS: GlobalSettings = {
  QR_TTL_SECONDS: 30,
  SCAN_COOLDOWN_MS: 1500,
  LIMITS_PER_WEEK: 7,
  COOLDOWN_MIN: 15,
  GEO_RADIUS_M: 1000,
  MAINTENANCE_MODE: false,
  AUTO_LOCK_SEC: 120
};

const SETTINGS_COLLECTION = 'Ajustes';
const SETTINGS_DOC_ID = 'global';

/**
 * Hook to get and update global settings
 */
export function useSettings() {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    
    // Subscribe to settings changes
    const unsubscribe = onSnapshot(
      settingsDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setSettings({
            ...DEFAULT_SETTINGS,
            ...docSnapshot.data() as GlobalSettings
          });
        } else {
          // If document doesn't exist, use defaults
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error getting settings:', err);
        setError('Error loading settings. Please try again.');
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<GlobalSettings>) => {
    try {
      setLoading(true);
      await setDocument<GlobalSettings>(
        SETTINGS_COLLECTION,
        SETTINGS_DOC_ID,
        newSettings,
        true // merge with existing settings
      );
      setError(null);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, updateSettings };
}

/**
 * Get settings without subscription (for server components)
 */
export async function getSettings(): Promise<GlobalSettings> {
  try {
    const settings = await getDocument<GlobalSettings>(SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    return settings ? { ...DEFAULT_SETTINGS, ...settings } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update settings (for server actions)
 */
export async function updateSettings(newSettings: Partial<GlobalSettings>): Promise<void> {
  try {
    await setDocument<GlobalSettings>(
      SETTINGS_COLLECTION,
      SETTINGS_DOC_ID,
      newSettings,
      true
    );
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}