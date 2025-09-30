// apps/admin-web/components/MaintenanceMode.tsx
import React from 'react';

export default function MaintenanceMode() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Estamos en mantenimiento
        </h1>
        
        <p className="text-gray-600 mb-8">
          Estamos realizando mejoras en nuestro sistema. Por favor, inténtelo de nuevo más tarde.
          Disculpe las molestias.
        </p>
        
        <div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-300"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    </div>
  );
}