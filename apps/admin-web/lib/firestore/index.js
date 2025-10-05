/**
 * @fileoverview Punto de entrada para todos los clientes de Firestore
 * Exporta todas las funciones de los clientes individuales
 */

// Re-exportar todas las funciones desde los clientes individuales
export * from './kpiClient';
export * from './historyClient';
export * from './exportClient';

// Cliente base de Firestore
import { db } from '@/lib/firebase';

// Exportar instancia de Firestore para uso en componentes
export { db };