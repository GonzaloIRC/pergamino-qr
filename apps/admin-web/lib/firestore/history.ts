// Tipo para los registros de historial
export type HistoryRecord = {
  id: string;
  fecha: any; // Timestamp o Date
  dni?: string;
  serial?: string;
  tipo?: string;
  detalle?: string;
  monto?: number;
  descripcion?: string;
  [k: string]: any;
};

// Tipo para los filtros de búsqueda
export type HistoryFilters = {
  dni?: string;
  serial?: string;
  tipo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  desde?: Date;
  hasta?: Date;
};

/**
 * Función para obtener el historial según los filtros aplicados
 * @param filters Filtros para la búsqueda
 * @returns Array de registros de historial
 */
export async function fetchHistory(filters: HistoryFilters = {}): Promise<HistoryRecord[]> {
  console.log("Fetching history with filters:", filters);
  
  // En un caso real, aquí realizaríamos la consulta a Firestore
  // Pero para este ejemplo, devolvemos datos de prueba
  
  // Simulamos un retraso para emular la llamada a la base de datos
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Datos de prueba
  const mockData: HistoryRecord[] = [
    {
      id: "1",
      fecha: {
        toDate: () => new Date("2023-12-01T10:30:00")
      },
      dni: "12345678",
      serial: "SER001",
      tipo: "visita",
      detalle: "Visita regular",
      monto: 0
    },
    {
      id: "2",
      fecha: {
        toDate: () => new Date("2023-12-02T14:15:00")
      },
      dni: "87654321",
      serial: "SER002",
      tipo: "canje",
      detalle: "Canje de promoción",
      monto: 500
    },
    {
      id: "3",
      fecha: {
        toDate: () => new Date("2023-12-03T09:45:00")
      },
      dni: "12345678",
      serial: "SER003",
      tipo: "lectura",
      detalle: "Lectura de QR",
      monto: 0
    },
    {
      id: "4",
      fecha: {
        toDate: () => new Date("2023-12-05T16:20:00")
      },
      dni: "98765432",
      serial: "SER004",
      tipo: "canje",
      detalle: "Canje de puntos",
      monto: 1200
    }
  ];
  
  // Filtramos los datos según los filtros recibidos
  return mockData.filter(record => {
    // Filtro por DNI
    if (filters.dni && !record.dni?.includes(filters.dni)) {
      return false;
    }
    
    // Filtro por serial
    if (filters.serial && !record.serial?.includes(filters.serial)) {
      return false;
    }
    
    // Filtro por tipo
    if (filters.tipo && record.tipo !== filters.tipo) {
      return false;
    }
    
    // Filtro por fecha de inicio
    if (filters.fechaInicio || filters.desde) {
      const fechaInicio = filters.desde || (filters.fechaInicio ? new Date(filters.fechaInicio + "T00:00:00") : null);
      if (fechaInicio && record.fecha.toDate() < fechaInicio) {
        return false;
      }
    }
    
    // Filtro por fecha de fin
    if (filters.fechaFin || filters.hasta) {
      const fechaFin = filters.hasta || (filters.fechaFin ? new Date(filters.fechaFin + "T23:59:59") : null);
      if (fechaFin && record.fecha.toDate() > fechaFin) {
        return false;
      }
    }
    
    // Si pasó todos los filtros, se incluye en el resultado
    return true;
  });
}