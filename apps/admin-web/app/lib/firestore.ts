// apps/admin-web/app/lib/firestore.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  QueryConstraint,
  QueryDocumentSnapshot,
  Timestamp,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

// Collection references
export const COLLECTIONS = {
  CLIENTS: 'Clientes',
  BENEFITS: 'Beneficios',
  SERIALS: 'BeneficioSeriales',
  HISTORY: 'Historial',
  SETTINGS: 'Ajustes',
  ROLES: 'roles'
};

// Generic fetching functions
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
}

export async function createDocument<T>(collectionName: string, data: Partial<T>): Promise<string> {
  try {
    const dataWithTimestamp = {
      ...data,
      creado: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, collectionName), dataWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
}

export async function updateDocument<T>(
  collectionName: string, 
  docId: string, 
  data: Partial<T>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    
    const dataWithTimestamp = {
      ...data,
      actualizado: serverTimestamp(),
    };
    
    await updateDoc(docRef, dataWithTimestamp as any);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
}

export async function setDocument<T>(
  collectionName: string, 
  docId: string, 
  data: Partial<T>, 
  merge: boolean = true
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    
    const dataWithTimestamp = {
      ...data,
      actualizado: serverTimestamp(),
    };
    
    await setDoc(docRef, dataWithTimestamp as any, { merge });
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error);
    throw error;
  }
}

export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
}

export interface PaginationOptions {
  pageSize?: number;
  startAfterDoc?: QueryDocumentSnapshot<DocumentData>;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

export async function getDocumentsWithPagination<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: PaginationOptions = {}
): Promise<{
  data: T[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> {
  try {
    const {
      pageSize = parseInt(process.env.NEXT_PUBLIC_PAGINATION_LIMIT || '10', 10),
      startAfterDoc,
      orderByField = 'creado',
      orderDirection = 'desc'
    } = options;
    
    let queryConstraints = [...constraints, orderBy(orderByField, orderDirection), limit(pageSize + 1)];
    
    if (startAfterDoc) {
      queryConstraints.push(startAfter(startAfterDoc));
    }
    
    const q = query(collection(db, collectionName), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    // Check if there are more documents
    const hasMore = querySnapshot.docs.length > pageSize;
    
    // Remove the extra document used to check for more
    const docs = hasMore ? querySnapshot.docs.slice(0, pageSize) : querySnapshot.docs;
    
    // Map documents to data with IDs
    const data = docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
    
    // Get the last document for pagination
    const lastDoc = docs.length > 0 ? docs[docs.length - 1] : null;
    
    return {
      data,
      lastDoc,
      hasMore
    };
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

export async function batchWrite<T>(
  collectionName: string, 
  documents: Array<{ id?: string; data: Partial<T> }>
): Promise<void> {
  try {
    const batch = writeBatch(db);
    const timestamp = serverTimestamp();
    
    documents.forEach(({ id, data }) => {
      const dataWithTimestamp = {
        ...data,
        creado: timestamp,
      };
      
      if (id) {
        // Update existing document
        const docRef = doc(db, collectionName, id);
        batch.set(docRef, dataWithTimestamp as any);
      } else {
        // Create new document
        const docRef = doc(collection(db, collectionName));
        batch.set(docRef, dataWithTimestamp as any);
      }
    });
    
    await batch.commit();
  } catch (error) {
    console.error(`Error batch writing to ${collectionName}:`, error);
    throw error;
  }
}

// Utility function to convert Firestore Timestamp to Date
export function timestampToDate(timestamp: Timestamp | null | undefined): Date | null {
  if (!timestamp) return null;
  return timestamp.toDate();
}

// Utility function to convert Date to Firestore Timestamp
export function dateToTimestamp(date: Date | null): Timestamp | null {
  if (!date) return null;
  return Timestamp.fromDate(date);
}

// Funciones específicas para obtener datos de KPIs
export async function getClientCount(): Promise<number> {
  try {
    const q = query(collection(db, COLLECTIONS.CLIENTS));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error obteniendo conteo de clientes:", error);
    return 0;
  }
}

export async function getRecentHistory(limitCount: number = 5): Promise<any[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.HISTORY),
      orderBy("creado", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error obteniendo historial reciente:", error);
    return [];
  }
}

export async function getRedemptionCount(): Promise<number> {
  try {
    const q = query(
      collection(db, COLLECTIONS.HISTORY),
      where("tipo", "==", "canje")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error obteniendo conteo de canjes:", error);
    return 0;
  }
}

export default {
  getDocument,
  createDocument,
  updateDocument,
  setDocument,
  deleteDocument,
  getDocumentsWithPagination,
  batchWrite,
  timestampToDate,
  dateToTimestamp,
  COLLECTIONS,
  getClientCount,
  getRecentHistory,
  getRedemptionCount
};