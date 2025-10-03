import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer
} from 'recharts';
import { analyticsService } from '../services/analyticsService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A52A2A', '#800080'];

const AnalyticsPage = () => {
  // Estados para filtros de fecha
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Estados para los datos
  const [timeFrame, setTimeFrame] = useState('daily');
  const [generalStats, setGeneralStats] = useState({
    totalUsers: 0,
    totalOperations: 0,
    totalAlerts: 0,
    pendingAlerts: 0
  });
  
  // Estados para los datos de gráficos
  const [usersChartData, setUsersChartData] = useState([]);
  const [operationsChartData, setOperationsChartData] = useState([]);
  const [alertsChartData, setAlertsChartData] = useState([]);
  const [alertTypeDistribution, setAlertTypeDistribution] = useState([]);
  
  // Estado para el loading
  const [loading, setLoading] = useState(true);
  
  // Función para cargar datos
  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar estadísticas generales
      const stats = await analyticsService.getGeneralStats(startDate, endDate);
      setGeneralStats(stats);
      
      // Cargar datos para gráficos
      const usersData = await analyticsService.getUsersChartData(timeFrame);
      setUsersChartData(usersData);
      
      const operationsData = await analyticsService.getOperationsChartData(timeFrame);
      setOperationsChartData(operationsData);
      
      const alertsData = await analyticsService.getAlertsChartData(timeFrame);
      setAlertsChartData(alertsData);
      
      const alertTypesData = await analyticsService.getAlertTypeDistribution(startDate, endDate);
      setAlertTypeDistribution(alertTypesData);
    } catch (error) {
      console.error('Error al cargar datos de analytics:', error);
      alert('Error al cargar datos de analytics');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);
  
  // Volver a cargar al cambiar filtros
  useEffect(() => {
    loadData();
  }, [timeFrame, startDate, endDate]);
  
  return (
    <div className="analytics-container">
      <h1>Panel de Analytics</h1>
      
      {/* Filtros */}
      <div className="filters-container">
        <div className="date-filters">
          <h3>Filtrar por fecha</h3>
          <div className="date-inputs">
            <div>
              <label>Desde:</label>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate || new Date()}
                className="date-picker"
                placeholderText="Fecha inicio"
              />
            </div>
            <div>
              <label>Hasta:</label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                className="date-picker"
                placeholderText="Fecha fin"
              />
            </div>
            <button 
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
              }}
              className="clear-button"
            >
              Limpiar fechas
            </button>
          </div>
        </div>
        
        <div className="time-frame-filter">
          <h3>Agrupación temporal</h3>
          <div className="time-buttons">
            <button 
              className={timeFrame === 'daily' ? 'active' : ''} 
              onClick={() => setTimeFrame('daily')}
            >
              Diario
            </button>
            <button 
              className={timeFrame === 'weekly' ? 'active' : ''} 
              onClick={() => setTimeFrame('weekly')}
            >
              Semanal
            </button>
            <button 
              className={timeFrame === 'monthly' ? 'active' : ''} 
              onClick={() => setTimeFrame('monthly')}
            >
              Mensual
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Cargando datos...</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="kpi-container">
            <div className="kpi-card">
              <h3>Total Usuarios</h3>
              <p className="kpi-value">{generalStats.totalUsers}</p>
            </div>
            <div className="kpi-card">
              <h3>Total Operaciones</h3>
              <p className="kpi-value">{generalStats.totalOperations}</p>
            </div>
            <div className="kpi-card">
              <h3>Total Alertas</h3>
              <p className="kpi-value">{generalStats.totalAlerts}</p>
            </div>
            <div className="kpi-card alert">
              <h3>Alertas Pendientes</h3>
              <p className="kpi-value">{generalStats.pendingAlerts}</p>
            </div>
          </div>
          
          {/* Gráficos */}
          <div className="charts-container">
            {/* Gráfico de usuarios */}
            <div className="chart-card">
              <h3>Nuevos Usuarios</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={usersChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Usuarios"
                      stroke="#0088FE"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Gráfico de operaciones */}
            <div className="chart-card">
              <h3>Operaciones</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={operationsChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Operaciones"
                      fill="#00C49F"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Gráfico de alertas */}
            <div className="chart-card">
              <h3>Alertas por {timeFrame === 'daily' ? 'Día' : timeFrame === 'weekly' ? 'Semana' : 'Mes'}</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={alertsChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Alertas"
                      stroke="#FF8042"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Gráfico de distribución de tipos de alertas */}
            <div className="chart-card">
              <h3>Tipos de Alertas</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={alertTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => 
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {alertTypeDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
      
      <style jsx>{`
        .analytics-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h1 {
          margin-bottom: 20px;
          color: #333;
        }
        
        .filters-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 30px;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 8px;
        }
        
        .date-filters, .time-frame-filter {
          flex: 1;
          min-width: 300px;
        }
        
        .date-inputs {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        
        .date-picker {
          width: 120px;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        
        .time-buttons button {
          padding: 8px 15px;
          margin-right: 10px;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .time-buttons button.active {
          background-color: #007bff;
          color: white;
          border-color: #007bff;
        }
        
        .clear-button {
          padding: 8px 15px;
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .kpi-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .kpi-card {
          flex: 1;
          min-width: 200px;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .kpi-card.alert {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
        }
        
        .kpi-value {
          font-size: 32px;
          font-weight: bold;
          margin: 10px 0;
        }
        
        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
          gap: 20px;
        }
        
        .chart-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .chart-wrapper {
          height: 300px;
        }
        
        .loading {
          text-align: center;
          padding: 50px;
          font-size: 18px;
          color: #666;
        }
        
        @media (max-width: 768px) {
          .charts-container {
            grid-template-columns: 1fr;
          }
          
          .kpi-card {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsPage;