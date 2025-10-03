// shared-firebase/customer.ts
import {
  getFirestore, doc, getDoc, setDoc, runTransaction, collection, query, where, getDocs
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

type CreateCustomerInput = {
  dni: string;
  displayName?: string;
  phone?: string;
};

/**
 * Crea un cliente con un DNI específico
 * @param input Datos del cliente
 * @returns Objeto con el resultado de la operación
 * @throws Error si el DNI ya está en uso o no hay usuario autenticado
 */
export async function createCustomerWithDNI(input: CreateCustomerInput) {
  const { dni, displayName, phone } = input;
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error('auth-required');

  const uid = user.uid;
  const clienteRef = doc(db, 'Clientes', dni);
  const perfilRef = doc(db, 'Perfiles', uid);

  await runTransaction(db, async (tx) => {
    const clienteSnap = await tx.get(clienteRef);
    if (clienteSnap.exists()) {
      // Ya hay dueño de ese DNI
      throw new Error('dni-already-taken');
    }
    tx.set(clienteRef, {
      dni,
      uid,
      createdAt: Date.now(),
      displayName: displayName || null,
      phone: phone || null,
    });
    tx.set(perfilRef, {
      dni,
      displayName: displayName || null,
      phone: phone || null,
      updatedAt: Date.now(),
    }, { merge: true });
  });

  return { ok: true, dni, uid };
}

/**
 * Reasigna un DNI a un usuario diferente (solo para administradores)
 * @param dni DNI a reasignar
 * @param newUid UID del nuevo usuario
 * @param adminUid UID del administrador que realiza la reasignación
 * @returns Objeto con el resultado de la operación
 * @throws Error si el administrador no tiene permisos o si hay problemas en la transacción
 */
export async function reassignDNIByAdmin(dni: string, newUid: string, adminUid: string) {
  const db = getFirestore();
  
  // Verificar si el administrador tiene permisos
  const adminRef = doc(db, 'Administradores', adminUid);
  const adminSnap = await getDoc(adminRef);
  if (!adminSnap.exists()) {
    throw new Error('admin-permissions-required');
  }

  const clienteRef = doc(db, 'Clientes', dni);
  const perfilRefNew = doc(db, 'Perfiles', newUid);

  await runTransaction(db, async (tx) => {
    const clienteSnap = await tx.get(clienteRef);
    
    if (!clienteSnap.exists()) {
      throw new Error('dni-not-found');
    }

    const currentData = clienteSnap.data();
    const oldUid = currentData.uid;

    if (oldUid === newUid) {
      throw new Error('same-user');
    }

    // Si el DNI ya pertenecía a alguien, limpiamos su perfil
    if (oldUid) {
      const perfilRefOld = doc(db, 'Perfiles', oldUid);
      const oldPerfilSnap = await tx.get(perfilRefOld);
      if (oldPerfilSnap.exists()) {
        tx.update(perfilRefOld, {
          dni: null,
          updatedAt: Date.now(),
          updatedBy: adminUid
        });
      }
    }

    // Actualizamos el documento de cliente
    tx.update(clienteRef, {
      uid: newUid,
      updatedAt: Date.now(),
      updatedBy: adminUid
    });

    // Actualizamos el nuevo perfil
    tx.update(perfilRefNew, {
      dni,
      updatedAt: Date.now(),
      updatedBy: adminUid
    });
  });

  return { ok: true, dni, newUid };
}

/**
 * Obtiene un cliente por DNI
 * @param dni DNI del cliente a buscar
 * @returns Datos del cliente o null si no existe
 */
export async function getCustomerByDNI(dni: string) {
  const db = getFirestore();
  const clienteRef = doc(db, 'Clientes', dni);
  const clienteSnap = await getDoc(clienteRef);
  
  if (!clienteSnap.exists()) {
    return null;
  }
  
  return clienteSnap.data();
}

/**
 * Libera un DNI eliminando completamente el documento (solo para administradores)
 * @param dni DNI a liberar
 * @param adminUid UID del administrador que realiza la liberación
 * @returns Objeto con el resultado de la operación
 * @throws Error si el administrador no tiene permisos, el DNI no existe, o hay otros problemas
 */
export async function releaseDNIByAdmin(dni: string, adminUid: string) {
  const db = getFirestore();
  
  // Verificar si el administrador tiene permisos
  const adminRef = doc(db, 'Administradores', adminUid);
  const adminSnap = await getDoc(adminRef);
  if (!adminSnap.exists()) {
    throw new Error('admin-permissions-required');
  }

  const clienteRef = doc(db, 'Clientes', dni);
  
  await runTransaction(db, async (tx) => {
    const clienteSnap = await tx.get(clienteRef);
    
    if (!clienteSnap.exists()) {
      throw new Error('dni-not-found');
    }

    const currentData = clienteSnap.data();
    const oldUid = currentData.uid;

    // Si el DNI pertenecía a alguien, limpiamos su perfil
    if (oldUid) {
      const perfilRefOld = doc(db, 'Perfiles', oldUid);
      const oldPerfilSnap = await tx.get(perfilRefOld);
      if (oldPerfilSnap.exists()) {
        tx.update(perfilRefOld, {
          dni: null,
          updatedAt: Date.now(),
          updatedBy: adminUid
        });
      }
    }

    // Eliminamos el documento de cliente
    tx.delete(clienteRef);
    
    // Registramos esta acción en un historial de auditoría
    const auditRef = doc(collection(db, 'Alertas'));
    tx.set(auditRef, {
      type: 'dni-released',
      dni,
      previousOwner: oldUid,
      adminUid,
      timestamp: Date.now(),
      description: `DNI ${dni} liberado por administrador ${adminUid}`
    });
  });

  return { ok: true, dni, released: true };
}