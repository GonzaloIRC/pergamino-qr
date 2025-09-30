// apps/admin-web/app/analytics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  getFirestore, collection, query, where, orderBy, limit, 
  getDocs, Timestamp
} from 'firebase/firestore';
import { 
  startOfDay, endOfDay, startOfWeek, endOfWeek 
} from 'date-fns';
import { withAuth } from '../lib/auth';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { CSVLink } from 'react-csv';

interface StatData {
  mau: number;
  wau: number;
  redemptionsToday: number;
  accumulationsToday: number;
  redemptionRate: number;
  refCodePercentage: number;
}

interface ChartData {
  date: string;
  redemptions: number;
  accumulations: number;
}

interface PieData {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatData>({
    mau: 0,
    wau: 0,
    redemptionsToday: 0,
    accumulationsToday: 0,
    redemptionRate: 0,
    refCodePercentage: 0
  });
  const [dailyData, setDailyData] = useState<ChartData[]>([]);
  const [pieData, setPieData] = useState<PieData[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Calcular fechas de referencia
      const now = new Date();
      const today = startOfDay(now);
      const todayEnd = endOfDay(now);
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      const oneWeekAgo = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      
      // 1. Obtener MAU (Monthly Active Users)
      const mauSnapshot = await getDocs(query(
        collection(db, 'Historial'),
        where('ts', '>=', Timestamp.fromDate(oneMonthAgo)),
        orderBy('ts', 'desc')
      ));
      
      // Extraer UIDs únicos para calcular MAU
      const uniqueMonthlyUids = new Set();
      mauSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.uid) uniqueMonthlyUids.add(data.uid);
      });
      
      // 2. Obtener WAU (Weekly Active Users)
      const wauSnapshot = await getDocs(query(
        collection(db, 'Historial'),
        where('ts', '>=', Timestamp.fromDate(oneWeekAgo)),
        orderBy('ts', 'desc')
      ));
      
      // Extraer UIDs únicos para calcular WAU
      const uniqueWeeklyUids = new Set();
      wauSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.uid) uniqueWeeklyUids.add(data.uid);
      });
      
      // 3. Operaciones de hoy
      const todaySnapshot = await getDocs(query(
        collection(db, 'Historial'),
        where('ts', '>=', Timestamp.fromDate(today)),
        where('ts', '<=', Timestamp.fromDate(todayEnd)),
        orderBy('ts', 'desc')
      ));
      
      let redemptionsToday = 0;
      let accumulationsToday = 0;
      
      todaySnapshot.forEach(doc => {
        const data = doc.data();
        if (data.tipo === 'redemption') redemptionsToday++;
        if (data.tipo === 'accumulation') accumulationsToday++;
      });
      
      // 4. Calcular redemption rate
      const serialesSnapshot = await getDocs(query(
        collection(db, 'BeneficioSeriales'),
        where('estado', '!=', 'canjeado')
      ));
      
      const totalSeriales = serialesSnapshot.size;
      const redeemedSnapshot = await getDocs(query(
        collection(db, 'BeneficioSeriales'),
        where('estado', '==', 'canjeado')
      ));
      
      const redeemedSeriales = redeemedSnapshot.size;
      const redemptionRate = totalSeriales > 0 
        ? (redeemedSeriales / (totalSeriales + redeemedSeriales)) * 100 
        : 0;
      
      // 5. Calcular porcentaje de clientes con refCode
      const clientesSnapshot = await getDocs(collection(db, 'Clientes'));
      
      let clientesTotal = 0;
      let clientesConRef = 0;
      
      clientesSnapshot.forEach(doc => {
        clientesTotal++;
        const data = doc.data();
        if (data.refCode) clientesConRef++;
      });
      
      const refCodePercentage = clientesTotal > 0 
        ? (clientesConRef / clientesTotal) * 100 
        : 0;
      
      // 6. Generar datos para la gráfica
      const dailyStatsMap = new Map<string, { redemptions: number, accumulations: number }>();
      
      // Inicializar el mapa con los últimos 30 días
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        dailyStatsMap.set(dateString, { redemptions: 0, accumulations: 0 });
      }
      
      // Calcular operaciones por día
      const last30DaysSnapshot = await getDocs(query(
        collection(db, 'Historial'),
        where('ts', '>=', Timestamp.fromDate(dateRange.startDate)),
        where('ts', '<=', Timestamp.fromDate(dateRange.endDate)),
        orderBy('ts', 'desc')
      ));
      
      last30DaysSnapshot.forEach(doc => {
        const data = doc.data();
        const date = data.ts.toDate().toISOString().split('T')[0];
        
        if (!dailyStatsMap.has(date)) {
          dailyStatsMap.set(date, { redemptions: 0, accumulations: 0 });
        }
        
        const currentStats = dailyStatsMap.get(date)!;
        
        if (data.tipo === 'redemption') {
          currentStats.redemptions++;
        } else if (data.tipo === 'accumulation') {
          currentStats.accumulations++;
        }
        
        dailyStatsMap.set(date, currentStats);
      });
      
      // Convertir el mapa a un array para la gráfica
      const chartData = Array.from(dailyStatsMap, ([date, stats]) => ({
        date,
        redemptions: stats.redemptions,
        accumulations: stats.accumulations
      })).sort((a, b) => a.date.localeCompare(b.date));
      
      // 7. Generar datos para el gráfico de pastel
      const pieData = [
        { name: 'Canjes', value: redeemedSeriales },
        { name: 'Seriales Activos', value: totalSeriales }
      ];
      
      // Actualizar el estado con todos los datos
      setStats({
        mau: uniqueMonthlyUids.size,
        wau: uniqueWeeklyUids.size,
        redemptionsToday,
        accumulationsToday,
        redemptionRate,
        refCodePercentage
      });
      
      setDailyData(chartData);
      setPieData(pieData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos de analytics:', error);
      setLoading(false);
    }
  };
  
  // Preparar datos para exportación CSV
  const prepareCSVData = () => {
    return dailyData.map(item => ({
      Fecha: item.date,
      Canjes: item.redemptions,
      Acumulaciones: item.accumulations
    }));
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: new Date(value)
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Panel de Analytics</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Cargando datos...</div>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Usuarios Activos</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mensuales (MAU)</p>
                  <p className="text-xl font-bold">{stats.mau}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Semanales (WAU)</p>
                  <p className="text-xl font-bold">{stats.wau}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Operaciones de Hoy</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Canjes</p>
                  <p className="text-xl font-bold">{stats.redemptionsToday}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Acumulaciones</p>
                  <p className="text-xl font-bold">{stats.accumulationsToday}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">Otros Indicadores</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tasa de Canje</p>
                  <p className="text-xl font-bold">{stats.redemptionRate.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clientes con RefCode</p>
                  <p className="text-xl font-bold">{stats.refCodePercentage.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="bg-white p-4 rounded shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">Filtros</h2>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Fecha inicial</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate.toISOString().split('T')[0]}
                  onChange={handleDateRangeChange}
                  className="border rounded p-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Fecha final</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate.toISOString().split('T')[0]}
                  onChange={handleDateRangeChange}
                  className="border rounded p-2"
                />
              </div>
              <div className="self-end">
                <button
                  onClick={fetchData}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Aplicar Filtros
                </button>
              </div>
              <div className="self-end ml-auto">
                <CSVLink
                  data={prepareCSVData()}
                  filename={`analytics_${new Date().toISOString().split('T')[0]}.csv`}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  target="_blank"
                >
                  Exportar CSV
                </CSVLink>
              </div>
            </div>
          </div>
          
          {/* Gráfico de Líneas */}
          <div className="bg-white p-4 rounded shadow mb-8">
            <h2 className="text-lg font-semibold mb-4">Operaciones por Día</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="redemptions" stroke="#8884d8" name="Canjes" />
                  <Line type="monotone" dataKey="accumulations" stroke="#82ca9d" name="Acumulaciones" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gráfico de Barras */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-4">Canjes vs Acumulaciones</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="redemptions" fill="#8884d8" name="Canjes" />
                    <Bar dataKey="accumulations" fill="#82ca9d" name="Acumulaciones" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Gráfico de Pastel */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-4">Estado de Seriales</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name: string, percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Tabla de Datos */}
          <div className="bg-white p-4 rounded shadow mt-8">
            <h2 className="text-lg font-semibold mb-4">Datos Diarios</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 border">Fecha</th>
                    <th className="p-2 border">Canjes</th>
                    <th className="p-2 border">Acumulaciones</th>
                    <th className="p-2 border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyData.map((day, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="p-2 border">{day.date}</td>
                      <td className="p-2 border text-center">{day.redemptions}</td>
                      <td className="p-2 border text-center">{day.accumulations}</td>
                      <td className="p-2 border text-center font-semibold">{day.redemptions + day.accumulations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Nota: Usamos date-fns para las funciones de fechas

export default withAuth(AnalyticsPage);