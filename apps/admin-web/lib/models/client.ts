// Modelo para la colección de clientes con validación de DNI único
// apps/admin-web/lib/models/client.ts

import { db } from '../firebase';
import {
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { COLLECTIONS } from '../constants';

// Interfaz para el cliente
export interface Client {
  id?: string;
  name: string;
  email: string;
  dni: string;
  phone?: string;
  address?: string;
  points: number;
  createdAt?: any;
  updatedAt?: any;
  status: 'active' | 'inactive' | 'pending';
}

// Clase para gestionar clientes con validación de DNI único
export class ClientModel {
  
  // Verificar si un DNI ya está registrado
  static async isDniUnique(dni: string): Promise<boolean> {
    try {
      // Verificar en la colección de DNIs registrados (índice)
      const dniRef = collection(db, COLLECTIONS.REGISTERED_DNIS);
      const q = query(dniRef, where('dni', '==', dni));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.empty;
    } catch (error) {
      console.error('Error al verificar DNI único:', error);
      throw error;
    }
  }
  
  // Crear un nuevo cliente con validación de DNI
  static async create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Validar que el DNI sea único
    const isDniUnique = await this.isDniUnique(client.dni);
    if (!isDniUnique) {
      throw new Error(`El DNI ${client.dni} ya está registrado en el sistema.`);
    }
    
    try {
      // Crear un nuevo documento con ID autogenerado
      const clientsRef = collection(db, COLLECTIONS.CLIENTS);
      const newClientRef = doc(clientsRef);
      const clientId = newClientRef.id;
      
      // Datos del cliente con timestamps
      const clientData = {
        ...client,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Guardar el cliente
      await setDoc(newClientRef, clientData);
      
      // Registrar el DNI en la colección de DNIs registrados
      await setDoc(doc(db, COLLECTIONS.REGISTERED_DNIS, client.dni), {
        dni: client.dni,
        clientId: clientId,
        registeredAt: serverTimestamp()
      });
      
      return clientId;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  }
  
  // Actualizar un cliente existente
  static async update(id: string, data: Partial<Omit<Client, 'id' | 'dni' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      // No permitimos actualizar el DNI para mantener la integridad
      const { dni, ...updateData } = data;
      
      if (dni) {
        console.warn('El DNI no puede ser actualizado una vez registrado.');
      }
      
      // Actualizar el cliente
      const clientRef = doc(db, COLLECTIONS.CLIENTS, id);
      await updateDoc(clientRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  }
  
  // Obtener un cliente por ID
  static async getById(id: string): Promise<Client | null> {
    try {
      const clientRef = doc(db, COLLECTIONS.CLIENTS, id);
      const clientDoc = await getDoc(clientRef);
      
      if (clientDoc.exists()) {
        return { id: clientDoc.id, ...clientDoc.data() } as Client;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      throw error;
    }
  }
  
  // Buscar cliente por DNI
  static async getByDni(dni: string): Promise<Client | null> {
    try {
      // Primero buscar en la colección de DNIs registrados (más eficiente)
      const dniRef = doc(db, COLLECTIONS.REGISTERED_DNIS, dni);
      const dniDoc = await getDoc(dniRef);
      
      if (dniDoc.exists()) {
        const { clientId } = dniDoc.data();
        return await this.getById(clientId);
      }
      
      // Si no se encuentra, buscar en la colección de clientes (menos eficiente)
      const clientsRef = collection(db, COLLECTIONS.CLIENTS);
      const q = query(clientsRef, where('dni', '==', dni));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Client;
      }
      
      return null;
    } catch (error) {
      console.error('Error al buscar cliente por DNI:', error);
      throw error;
    }
  }
}

export default ClientModel;