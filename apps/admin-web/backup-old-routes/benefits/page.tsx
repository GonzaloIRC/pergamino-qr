'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '../lib/auth';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

function Benefits() {
  const [benefits, setBenefits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBenefits() {
      try {
        const benefitsSnapshot = await getDocs(collection(db, 'Beneficios'));
        const benefitsData = benefitsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBenefits(benefitsData);
      } catch (err: any) {
        console.error('Error fetching benefits:', err);
        setError(err.message || 'Error al cargar los beneficios');
      } finally {
        setLoading(false);
      }
    }

    fetchBenefits();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Beneficios</h1>
        <button className="btn-primary">
          + Agregar beneficio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.length > 0 ? (
          benefits.map((benefit) => (
            <div key={benefit.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-40 bg-gray-200 flex items-center justify-center">
                {benefit.imageUrl ? (
                  <img 
                    src={benefit.imageUrl} 
                    alt={benefit.title} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">Sin imagen</div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {benefit.pointsCost} puntos
                  </span>
                </div>
                <p className="text-gray-600 mt-2 line-clamp-2">{benefit.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {benefit.isActive ? (
                      <span className="text-green-600">Activo</span>
                    ) : (
                      <span className="text-red-600">Inactivo</span>
                    )}
                  </div>
                  <div>
                    <button className="text-primary-600 hover:text-primary-900 text-sm font-medium mr-3">
                      Editar
                    </button>
                    <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 py-8 text-center text-gray-500">
            No hay beneficios disponibles
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(Benefits);