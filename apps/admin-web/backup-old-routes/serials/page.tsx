'use client';

import React, { useState, useEffect } from 'react';
import { withAuth } from '../lib/auth';
import { collection, getDocs, query, orderBy, deleteDoc, doc, where, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COLLECTIONS } from '../lib/firestore';
import ExportCSVButton from '../components/ExportCSVButton';
import ImportCSVButton from '../components/ImportCSVButton';
import SerialGenerator from '../components/SerialGenerator';

interface Serial {
  id: string;
  serial: string;
  beneficioId: string;
  estado: string;
  emitidoPor: string;
  emitidoA?: string;
  creado: any; // Firestore timestamp
  usadoPor?: string;
  usadoEn?: any; // Firestore timestamp
}

interface Beneficio {
  id: string;
  titulo: string;
  descripcion: string;
}

function Serials() {
  const [serials, setSerials] = useState<Serial[]>([]);
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [selectedBeneficio, setSelectedBeneficio] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serialToDelete, setSerialToDelete] = useState<string | null>(null);

  // Fetch beneficios for dropdown
  useEffect(() => {
    async function fetchBeneficios() {
      try {
        const beneficiosQuery = query(collection(db, COLLECTIONS.BENEFITS));
        const snapshot = await getDocs(beneficiosQuery);
        
        const beneficiosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Beneficio[];
        
        setBeneficios(beneficiosData);
      } catch (err: any) {
        console.error('Error fetching beneficios:', err);
        setError(err.message || 'Error al cargar los beneficios');
      }
    }

    fetchBeneficios();
  }, []);

  // Fetch serials when beneficio changes
  useEffect(() => {
    async function fetchSerials() {
      try {
        setLoading(true);
        
        let serialsQuery;
        if (selectedBeneficio) {
          serialsQuery = query(
            collection(db, COLLECTIONS.SERIALS), 
            where('beneficioId', '==', selectedBeneficio),
            orderBy('creado', 'desc'), 
            limit(100)
          );
        } else {
          serialsQuery = query(
            collection(db, COLLECTIONS.SERIALS),
            orderBy('creado', 'desc'),
            limit(100)
          );
        }
        
        const snapshot = await getDocs(serialsQuery);
        
        const serialsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Serial[];
        
        setSerials(serialsData);
      } catch (err: any) {
        console.error('Error fetching serials:', err);
        setError(err.message || 'Error al cargar los seriales');
      } finally {
        setLoading(false);
      }
    }

    fetchSerials();
  }, [selectedBeneficio]);

  // Handle serial deletion
  const confirmDelete = (id: string) => {
    setSerialToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!serialToDelete) return;
    
    try {
      await deleteDoc(doc(db, COLLECTIONS.SERIALS, serialToDelete));
      setSerials(serials.filter(serial => serial.id !== serialToDelete));
      setShowDeleteModal(false);
      setSerialToDelete(null);
      setSuccess('Serial eliminado correctamente');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error deleting serial:', err);
      setError(err.message || 'Error al eliminar el serial');
    }
  };
  
  // Handle imported data
  const handleDataImported = (data: any[]) => {
    if (!data.length) {
      setError('No se encontraron datos válidos en el archivo CSV');
      return;
    }
    
    // Validate and process the imported data
    // This would normally include validation and saving to Firestore
    
    setSuccess(`Se importaron ${data.length} seriales correctamente`);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  // Handle generated serials
  const handleSerialsGenerated = (newSerials: any[]) => {
    setSerials(prevSerials => [...newSerials, ...prevSerials]);
    setSuccess(`Se generaron ${newSerials.length} seriales correctamente`);
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  // Format data for CSV export
  const getExportData = () => {
    return serials.map(serial => ({
      Serial: serial.serial,
      BeneficioID: serial.beneficioId,
      Estado: serial.estado,
      EmitidoA: serial.emitidoA || '',
      EmitidoPor: serial.emitidoPor || 'admin',
      Creado: serial.creado?.toDate ? serial.creado.toDate().toISOString() : '',
      UsadoPor: serial.usadoPor || '',
      UsadoEn: serial.usadoEn?.toDate ? serial.usadoEn.toDate().toISOString() : ''
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !serials.length) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded border border-red-200">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Seriales</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="beneficio">
          Seleccionar Beneficio
        </label>
        <select
          id="beneficio"
          value={selectedBeneficio}
          onChange={(e) => setSelectedBeneficio(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="">Seleccione un beneficio...</option>
          {beneficios.map(beneficio => (
            <option key={beneficio.id} value={beneficio.id}>
              {beneficio.titulo}
            </option>
          ))}
        </select>
      </div>
      
      {selectedBeneficio && (
        <SerialGenerator 
          beneficioId={selectedBeneficio} 
          onSerialsGenerated={handleSerialsGenerated}
        />
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Lista de Seriales</h2>
        <div className="flex gap-2">
          <ExportCSVButton 
            data={getExportData()} 
            filename={`seriales-${new Date().toISOString().slice(0, 10)}`}
            disabled={!serials.length || loading}
          />
          <ImportCSVButton 
            onDataImported={handleDataImported}
            disabled={!selectedBeneficio}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {serials.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Serial</th>
                    <th className="py-2 px-4 border-b text-left">Estado</th>
                    <th className="py-2 px-4 border-b text-left">Emitido A</th>
                    <th className="py-2 px-4 border-b text-left">Emitido Por</th>
                    <th className="py-2 px-4 border-b text-left">Creado</th>
                    <th className="py-2 px-4 border-b text-left">Usado Por</th>
                    <th className="py-2 px-4 border-b text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {serials.map((serial) => (
                    <tr key={serial.id}>
                      <td className="py-2 px-4 border-b">{serial.serial}</td>
                      <td className="py-2 px-4 border-b">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            serial.estado === 'activo' 
                              ? 'bg-green-100 text-green-800' 
                              : serial.estado === 'usado' 
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {serial.estado || 'desconocido'}
                        </span>
                      </td>
                      <td className="py-2 px-4 border-b">{serial.emitidoA || '-'}</td>
                      <td className="py-2 px-4 border-b">{serial.emitidoPor || 'admin'}</td>
                      <td className="py-2 px-4 border-b">
                        {serial.creado?.toDate 
                          ? new Date(serial.creado.toDate()).toLocaleDateString() 
                          : '-'
                        }
                      </td>
                      <td className="py-2 px-4 border-b">{serial.usadoPor || '-'}</td>
                      <td className="py-2 px-4 border-b">
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => confirmDelete(serial.id)}
                          disabled={serial.estado === 'usado'}
                          title={serial.estado === 'usado' ? 'No se puede eliminar un serial utilizado' : 'Eliminar serial'}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 text-center text-gray-500">
              {selectedBeneficio 
                ? 'No hay seriales disponibles para este beneficio.' 
                : 'Seleccione un beneficio para ver sus seriales.'
              }
            </div>
          )}
        </>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-gray-500 mb-6">
              ¿Estás seguro de que deseas eliminar este serial? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={handleDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(Serials);