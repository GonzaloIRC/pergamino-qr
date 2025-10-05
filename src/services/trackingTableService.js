import { db } from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    serverTimestamp,
    orderBy,
    limit,
    doc,
    getDoc
} from 'firebase/firestore';

/**
 * Añade un nuevo registro de tracking a una tabla específica
 * @param {string} tableId - ID de la tabla de tracking
 * @param {object} data - Datos a guardar
 * @param {string} userId - ID del usuario que crea el registro
 * @returns {Promise<string>} - ID del registro creado
 */
export const addTrackingRecord = async (tableId, data, userId) => {
    try {
        // Primero, verificar que la tabla existe
        const tableDoc = await getDoc(doc(db, 'trackingTables', tableId));

        if (!tableDoc.exists()) {
            throw new Error(`La tabla de tracking ${tableId} no existe`);
        }

        // Preparar el documento con datos del sistema
        const trackingDoc = {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            createdBy: userId || 'anonymous'
        };

        // Guardar en la colección correspondiente
        const trackingRef = collection(db, `tracking_${tableId}`);
        const docRef = await addDoc(trackingRef, trackingDoc);

        return docRef.id;
    } catch (error) {
        console.error('Error adding tracking record:', error);
        throw error;
    }
};

/**
 * Obtiene todos los registros de una tabla de tracking
 * @param {string} tableId - ID de la tabla de tracking
 * @param {object} options - Opciones de consulta (filtros, ordenamiento, etc)
 * @returns {Promise<Array>} - Array de registros
 */
export const getTrackingRecords = async (tableId, options = {}) => {
    try {
        const { filters = [], sortBy = 'createdAt', sortDirection = 'desc', limitCount = 100 } = options;

        // Construir la consulta base
        const trackingRef = collection(db, `tracking_${tableId}`);
        let trackingQuery = query(trackingRef);

        // Aplicar filtros si existen
        filters.forEach(filter => {
            if (filter.field && filter.operator && filter.value !== undefined) {
                trackingQuery = query(trackingQuery, where(filter.field, filter.operator, filter.value));
            }
        });

        // Aplicar ordenamiento
        trackingQuery = query(trackingQuery, orderBy(sortBy, sortDirection));

        // Aplicar límite
        if (limitCount > 0) {
            trackingQuery = query(trackingQuery, limit(limitCount));
        }

        // Ejecutar consulta
        const snapshot = await getDocs(trackingQuery);

        // Transformar resultados
        const records = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return records;
    } catch (error) {
        console.error('Error getting tracking records:', error);
        throw error;
    }
};

/**
 * Obtiene la configuración de una tabla de tracking
 * @param {string} tableId - ID de la tabla de tracking
 * @returns {Promise<object>} - Configuración de la tabla
 */
export const getTrackingTableConfig = async (tableId) => {
    try {
        const tableDoc = await getDoc(doc(db, 'trackingTables', tableId));

        if (!tableDoc.exists()) {
            throw new Error(`La tabla de tracking ${tableId} no existe`);
        }

        return {
            id: tableDoc.id,
            ...tableDoc.data()
        };
    } catch (error) {
        console.error('Error getting tracking table config:', error);
        throw error;
    }
};

/**
 * Obtiene todas las configuraciones de tablas de tracking
 * @returns {Promise<Array>} - Array de configuraciones
 */
export const getAllTrackingTables = async () => {
    try {
        const tablesRef = collection(db, 'trackingTables');
        const snapshot = await getDocs(tablesRef);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting all tracking tables:', error);
        throw error;
    }
};

/**
 * Genera un resumen de actividad para el dashboard
 * @param {object} options - Opciones para filtrar el resumen
 * @returns {Promise<object>} - Resumen de actividad
 */
export const generateActivitySummary = async (options = {}) => {
    try {
        const { period = 'week' } = options;

        // Calcular fecha de inicio según el período
        const startDate = new Date();
        switch (period) {
            case 'day':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            default:
                startDate.setDate(startDate.getDate() - 7);
        }

        // Obtener todas las tablas de tracking
        const tables = await getAllTrackingTables();

        // Para cada tabla, contar registros en el período
        const tableCounts = await Promise.all(tables.map(async table => {
            const records = await getTrackingRecords(table.id, {
                filters: [
                    { field: 'createdAt', operator: '>=', value: startDate }
                ],
                limitCount: 0  // Sin límite para contar todos
            });

            return {
                tableId: table.id,
                tableName: table.name,
                count: records.length
            };
        }));

        return {
            period,
            startDate,
            endDate: new Date(),
            tables: tableCounts,
            totalRecords: tableCounts.reduce((sum, table) => sum + table.count, 0)
        };
    } catch (error) {
        console.error('Error generating activity summary:', error);
        throw error;
    }
};

/**
 * Obtiene estadísticas de escaneos por tipo
 * @param {object} options - Opciones para filtrar las estadísticas
 * @returns {Promise<object>} - Estadísticas de escaneos
 */
export const getScanStats = async (options = {}) => {
    // Implementación de ejemplo - en un caso real, deberíamos 
    // consultar datos específicos de escaneos
    return {
        total: 245,
        successful: 203,
        failed: 42,
        byType: {
            qrCode: 156,
            barcode: 89
        }
    };
};