"use client";

import { useState } from "react";
import { fetchHistory, type HistoryRecord } from "../../../lib/firestore/history";

// Componente para exportar historia
const HistoryExportButton = ({ data }: { data: HistoryRecord[] }) => {
  const [exporting, setExporting] = useState(false);
  
  const handleExport = async () => {
    setExporting(true);
    try {
      // Simulación de exportación
      console.log("Exportando datos:", data);
      
      // Convertir a CSV
      const headers = ["id", "fecha", "dni", "serial", "tipo", "detalle", "monto"];
      const rows = [headers.join(",")];
      
      for (const record of data) {
        const fechaISO = record.fecha?.toDate ? record.fecha.toDate().toISOString() : "";
        const line = [
          record.id,
          fechaISO,
          record.dni ?? "",
          record.serial ?? "",
          record.tipo ?? "",
          JSON.stringify(record.detalle ?? ""),
          record.monto !== undefined ? record.monto.toString() : ""
        ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(",");
        
        rows.push(line);
      }
      
      const csv = rows.join("\n");
      
      // Crear blob y descargar
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `history_export_${new Date().toISOString().slice(0,10)}.csv`;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      alert("¡Exportación completada!");
    } catch (error) {
      console.error("Error exportando datos:", error);
      alert("Error al exportar datos");
    } finally {
      setExporting(false);
    }
  };
  
  return (
    <button 
      onClick={handleExport} 
      disabled={exporting || !data.length}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
      data-testid="export-csv-button"
    >
      {exporting ? "Exportando..." : "Exportar CSV"}
    </button>
  );
};

export default function HistoryPage() {
  const [filters, setFilters] = useState({
    dni: "",
    serial: "",
    tipo: "",
    fechaInicio: "",
    fechaFin: "",
  });
  
  const [results, setResults] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setError(null);
    
    try {
      const historyData = await fetchHistory(filters);
      setResults(historyData);
    } catch (error: any) {
      console.error("Error fetching history:", error);
      setError(error.message || "Error al obtener el historial");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Fecha inválida";
    }
  };
  
  return (
    <div className="p-6" data-testid="history-container">
      <h1 className="text-2xl font-bold mb-6">Historial de Operaciones</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6" data-testid="history-filters">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="dni" className="block text-sm font-medium mb-1">
              DNI
            </label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={filters.dni}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Ingrese DNI"
              data-testid="history-dni-filter"
            />
          </div>
          
          <div>
            <label htmlFor="serial" className="block text-sm font-medium mb-1">
              Serial
            </label>
            <input
              type="text"
              id="serial"
              name="serial"
              value={filters.serial}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              placeholder="Ingrese serial"
              data-testid="history-serial-filter"
            />
          </div>
          
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium mb-1">
              Tipo de operación
            </label>
            <select
              id="tipo"
              name="tipo"
              value={filters.tipo}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Todos</option>
              <option value="visita">Visita</option>
              <option value="canje">Canje</option>
              <option value="lectura">Lectura</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="fechaInicio" className="block text-sm font-medium mb-1">
              Fecha inicio
            </label>
            <input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              value={filters.fechaInicio}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              data-testid="history-from-filter"
            />
          </div>
          
          <div>
            <label htmlFor="fechaFin" className="block text-sm font-medium mb-1">
              Fecha fin
            </label>
            <input
              type="date"
              id="fechaFin"
              name="fechaFin"
              value={filters.fechaFin}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
              data-testid="history-to-filter"
            />
          </div>
          
          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-300"
              disabled={loading}
              data-testid="history-search-button"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>
      </div>
      
      {/* Mensajes de estado */}
      {loading && (
        <div className="flex justify-center py-4" data-testid="history-loading">
          <div className="text-blue-600">Cargando...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center gap-2" role="alert">
          <p>Error: {error}</p>
        </div>
      )}
      
      {searched && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Resultados ({results.length})</h2>
            <HistoryExportButton data={results} />
          </div>
          
          {loading ? (
            <div className="text-center py-8">Cargando...</div>
          ) : results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" data-testid="history-table">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DNI
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalle
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((row) => (
                    <tr key={row.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(row.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.dni || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.serial || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          row.tipo === 'visita' ? 'bg-green-100 text-green-800' : 
                          row.tipo === 'canje' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                        }`}>
                          {row.tipo || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-[320px]">
                        {row.detalle || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {row.monto !== undefined ? `$${row.monto}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500" data-testid="history-empty">
              No se encontraron resultados con los filtros seleccionados.
            </div>
          )}
        </div>
      )}
    </div>
  );