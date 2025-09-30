// Ejemplo de uso en admin-web
'use client';

import { useState } from 'react';
// Importamos las funciones directamente
// NOTA: Es posible que necesites configurar el resolver de paths en el tsconfig.json del proyecto
// para que esto funcione correctamente
import { createCustomerWithDNI, reassignDNIByAdmin, getCustomerByDNI, releaseDNIByAdmin } from '@/lib/shared-firebase';
import { FormEvent } from 'react';
import { DocumentData } from 'firebase/firestore';

type CustomerData = DocumentData | null;

export default function CustomerManagement() {
  const [dni, setDni] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [newUid, setNewUid] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [customerData, setCustomerData] = useState<CustomerData>(null);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      const result = await createCustomerWithDNI({
        dni,
        displayName: displayName || undefined,
        phone: phone || undefined
      });
      setMessage(`Cliente creado exitosamente con DNI: ${result.dni}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'dni-already-taken') {
          setError('Este DNI ya está registrado por otro usuario');
        } else if (err.message === 'auth-required') {
          setError('Necesitas iniciar sesión para realizar esta acción');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError('Error desconocido');
      }
    }
  };

  const handleReassign = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      // Obtener el usuario actual desde Firebase Auth
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setError('Debes iniciar sesión como administrador para realizar esta acción');
        return;
      }
      
      const adminUid = user.uid;
      
      const result = await reassignDNIByAdmin(dni, newUid, adminUid);
      setMessage(`DNI ${result.dni} reasignado exitosamente al usuario ${result.newUid}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error al reasignar: ${err.message}`);
      } else {
        setError('Error desconocido al reasignar');
      }
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setCustomerData(null);
    
    try {
      const customer = await getCustomerByDNI(dni);
      if (customer) {
        setCustomerData(customer);
        setMessage('Cliente encontrado');
      } else {
        setMessage('No se encontró ningún cliente con ese DNI');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error al buscar: ${err.message}`);
      } else {
        setError('Error desconocido al buscar');
      }
    }
  };
  
  const handleRelease = async () => {
    if (!dni) {
      setError('Debes ingresar un DNI para liberar');
      return;
    }
    
    if (!confirm(`¿Estás seguro de que deseas LIBERAR COMPLETAMENTE el DNI ${dni}? Esta acción eliminará la asignación y no se puede deshacer.`)) {
      return;
    }
    
    setMessage('');
    setError('');
    
    try {
      // Obtener el usuario actual desde Firebase Auth
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        setError('Debes iniciar sesión como administrador para realizar esta acción');
        return;
      }
      
      const adminUid = user.uid;
      
      const result = await releaseDNIByAdmin(dni, adminUid);
      setMessage(`DNI ${result.dni} liberado exitosamente`);
      setCustomerData(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Error al liberar DNI: ${err.message}`);
      } else {
        setError('Error desconocido al liberar DNI');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Clientes</h1>
      
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-4 rounded">{message}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crear Cliente */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Crear Cliente</h2>
          <form onSubmit={handleCreate}>
            <div className="mb-4">
              <label className="block mb-2">DNI:</label>
              <input 
                type="text" 
                value={dni} 
                onChange={(e) => setDni(e.target.value)}
                className="w-full p-2 border rounded" 
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Nombre:</label>
              <input 
                type="text" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-2 border rounded" 
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Teléfono:</label>
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded" 
              />
            </div>
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Crear Cliente
            </button>
          </form>
        </div>
        
        {/* Reasignar DNI */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Reasignar DNI (Solo Admin)</h2>
          <form onSubmit={handleReassign}>
            <div className="mb-4">
              <label className="block mb-2">DNI a reasignar:</label>
              <input 
                type="text" 
                value={dni} 
                onChange={(e) => setDni(e.target.value)}
                className="w-full p-2 border rounded" 
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">UID del nuevo usuario:</label>
              <input 
                type="text" 
                value={newUid} 
                onChange={(e) => setNewUid(e.target.value)}
                className="w-full p-2 border rounded" 
                required
              />
            </div>
            <button 
              type="submit" 
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Reasignar DNI
            </button>
          </form>
        </div>
      </div>
      
      {/* Buscar Cliente */}
      <div className="bg-white p-6 rounded shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">Buscar Cliente por DNI</h2>
        <form onSubmit={handleSearch} className="flex items-end space-x-4">
          <div className="flex-grow">
            <label className="block mb-2">DNI:</label>
            <input 
              type="text" 
              value={dni} 
              onChange={(e) => setDni(e.target.value)}
              className="w-full p-2 border rounded" 
              required
            />
          </div>
          <button 
            type="submit" 
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Buscar
          </button>
        </form>
        
        {customerData && (
          <div className="mt-4">
            <h3 className="font-semibold">Datos del Cliente:</h3>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
              {JSON.stringify(customerData, null, 2)}
            </pre>
            
            <div className="mt-4 flex space-x-3">
              <button 
                onClick={() => setDni(customerData.dni)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Usar este DNI para reasignar
              </button>
              
              <button 
                onClick={handleRelease}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Liberar este DNI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}