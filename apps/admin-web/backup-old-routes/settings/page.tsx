'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '../lib/auth';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_SETTINGS, GlobalSettings } from '../lib/settings';

function Settings() {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch settings from Firestore
  useEffect(() => {
    async function fetchSettings() {
      try {
        const settingsDoc = await getDoc(doc(db, 'Ajustes', 'global'));
        
        if (settingsDoc.exists()) {
          const settingsData = settingsDoc.data() as GlobalSettings;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...settingsData
          });
        }
      } catch (err: any) {
        console.error('Error fetching settings:', err);
        setError(err.message || 'Error al cargar la configuración');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    
    try {
      await setDoc(doc(db, 'Ajustes', 'global'), settings);
      setSuccess('Configuración guardada correctamente');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: parseInt(value, 10)
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200 mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded border border-green-200 mb-6">
          <p>{success}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="qrRefreshTime" className="form-label">
                Tiempo de actualización de QR (segundos)
              </label>
              <input
                type="number"
                id="qrRefreshTime"
                name="qrRefreshTime"
                value={settings.QR_TTL_SECONDS}
                onChange={handleInputChange}
                min="5"
                max="300"
                className="form-input"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Cada cuántos segundos se regenera el código QR dinámico
              </p>
            </div>
            
            <div>
              <label htmlFor="pointsPerScan" className="form-label">
                Puntos por escaneo
              </label>
              <input
                type="number"
                id="pointsPerScan"
                name="pointsPerScan"
                value={1}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="form-input"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Puntos que recibe un cliente al escanear un código QR
              </p>
            </div>
            
            <div>
              <label htmlFor="maxScanPerDay" className="form-label">
                Máximo de escaneos por día
              </label>
              <input
                type="number"
                id="maxScanPerDay"
                name="maxScanPerDay"
                value={settings.LIMITS_PER_WEEK}
                onChange={handleInputChange}
                min="1"
                max="20"
                className="form-input"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Número máximo de escaneos permitidos por cliente al día
              </p>
            </div>
            
            <div>
              <label htmlFor="cooldownPeriod" className="form-label">
                Período de enfriamiento (minutos)
              </label>
              <input
                type="number"
                id="cooldownPeriod"
                name="cooldownPeriod"
                value={settings.COOLDOWN_MIN}
                onChange={handleInputChange}
                min="1"
                max="1440"
                className="form-input"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Tiempo mínimo entre escaneos consecutivos del mismo cliente
              </p>
            </div>
            
            <div>
              <label htmlFor="minPointsForRedemption" className="form-label">
                Puntos mínimos para canje
              </label>
              <input
                type="number"
                id="minPointsForRedemption"
                name="minPointsForRedemption"
                value={1}
                onChange={handleInputChange}
                min="1"
                className="form-input"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Cantidad mínima de puntos para poder canjear beneficios
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              disabled={saving}
              className={`btn-primary ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {saving ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default withAuth(Settings);