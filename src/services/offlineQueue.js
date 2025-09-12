import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { transactRedeemSerial, recordAccumulation } from './transactions';

const QUEUE_STORAGE_KEY = '@PergaminoApp:OfflineQueue';

/**
 * Cola para operaciones offline
 */
class OfflineQueue {
  constructor() {
    this.queue = [];
    this.isOnline = true;
    this.isProcessing = false;

    // Inicializar cola desde AsyncStorage y suscribirse a cambios de conectividad
    this.initialize();
  }

  async initialize() {
    try {
      // Cargar cola previa si existe
      const storedQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (storedQueue) {
        this.queue = JSON.parse(storedQueue);
        console.log(`Cola offline restaurada con ${this.queue.length} operaciones pendientes`);
      }

      // Suscribirse a cambios de conectividad
      NetInfo.addEventListener(state => {
        const wasOffline = !this.isOnline;
        this.isOnline = state.isConnected && state.isInternetReachable;
        
        // Si volvemos a estar online, procesar la cola
        if (wasOffline && this.isOnline) {
          this.processQueue();
        }
      });
      
      // Verificar estado inicial de conexión
      const state = await NetInfo.fetch();
      this.isOnline = state.isConnected && state.isInternetReachable;
    } catch (error) {
      console.error('Error inicializando OfflineQueue:', error);
    }
  }

  /**
   * Encolar una operación para procesarla más tarde
   * @param {string} type - Tipo de operación ('redeemSerial' o 'recordAccumulation')
   * @param {Object} params - Parámetros necesarios para la operación
   * @returns {string} - ID de la operación encolada
   */
  async enqueue(type, params) {
    const operation = {
      id: uuidv4(),
      type,
      params,
      timestamp: Date.now()
    };

    this.queue.push(operation);
    
    // Guardar cola actualizada
    await this.saveQueue();
    
    return operation.id;
  }

  /**
   * Guarda la cola actual en AsyncStorage
   */
  async saveQueue() {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error guardando cola offline:', error);
    }
  }

  /**
   * Procesa todas las operaciones pendientes en la cola
   */
  async processQueue() {
    // Evitar procesamiento simultáneo
    if (this.isProcessing || !this.isOnline || this.queue.length === 0) {
      return;
    }
    
    try {
      this.isProcessing = true;
      console.log(`Procesando ${this.queue.length} operaciones pendientes...`);
      
      // Crear una copia para evitar modificar mientras iteramos
      const queueCopy = [...this.queue];
      const successfulOps = [];
      
      for (const operation of queueCopy) {
        try {
          const { type, params } = operation;
          
          // Procesar según tipo
          if (type === 'redeemSerial') {
            await transactRedeemSerial(params);
            successfulOps.push(operation.id);
          } else if (type === 'recordAccumulation') {
            await recordAccumulation(params);
            successfulOps.push(operation.id);
          }
        } catch (error) {
          console.error(`Error procesando operación ${operation.id}:`, error);
          // No lo añadimos a successfulOps para reintentarlo después
        }
      }
      
      // Eliminar operaciones exitosas de la cola
      this.queue = this.queue.filter(op => !successfulOps.includes(op.id));
      
      // Guardar cola actualizada
      await this.saveQueue();
      
      console.log(`${successfulOps.length} operaciones completadas, ${this.queue.length} pendientes`);
    } catch (error) {
      console.error('Error en processQueue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Intenta ejecutar una operación inmediatamente o la encola si estamos offline
   * @param {string} type - Tipo de operación ('redeemSerial' o 'recordAccumulation')
   * @param {Object} params - Parámetros necesarios para la operación
   * @returns {Promise<Object>} - Resultado de la operación
   */
  async execute(type, params) {
    // Si estamos online, intentar ejecutar directamente
    if (this.isOnline) {
      try {
        let result;
        
        if (type === 'redeemSerial') {
          result = await transactRedeemSerial(params);
        } else if (type === 'recordAccumulation') {
          result = await recordAccumulation(params);
        } else {
          throw new Error(`Tipo de operación desconocido: ${type}`);
        }
        
        return { success: true, result, offline: false };
      } catch (error) {
        // Si falla por conectividad, encolar para más tarde
        if (error.message && (
          error.message.includes('network') || 
          error.message.includes('internet') ||
          error.message.includes('connection')
        )) {
          const opId = await this.enqueue(type, params);
          return { 
            success: true, 
            offline: true, 
            message: 'Operación guardada para sincronización futura',
            operationId: opId
          };
        }
        
        // Si es otro tipo de error, propagar
        throw error;
      }
    } else {
      // Si estamos offline, encolar directamente
      const opId = await this.enqueue(type, params);
      return { 
        success: true, 
        offline: true, 
        message: 'Operación guardada para sincronización futura',
        operationId: opId
      };
    }
  }
  
  /**
   * Obtiene el estado actual de la cola
   * @returns {Object} - Estado actual
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      isProcessing: this.isProcessing,
      pendingOperations: this.queue.length
    };
  }
}

// Exportar instancia singleton
export const offlineQueue = new OfflineQueue();
