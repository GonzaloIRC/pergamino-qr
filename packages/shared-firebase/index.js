// shared-firebase/index.js
import {
  getFirestore, doc, getDoc, setDoc, runTransaction, collection, query, where, getDocs
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Crea un cliente con un DNI específico
 * @param {Object} input Datos del cliente
 * @param {string} input.dni DNI del cliente
 * @param {string} [input.displayName] Nombre del cliente
 * @param {string} [input.phone] Teléfono del cliente
 * @returns {Promise<{ok: boolean, dni: string, uid: string}>} Resultado de la operación
 * @throws {Error} Si el DNI ya está en uso o no hay usuario autenticado
 */
export async function createCustomerWithDNI(input) {
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
 * @param {string} dni DNI a reasignar
 * @param {string} newUid UID del nuevo usuario
 * @param {string} adminUid UID del administrador que realiza la reasignación
 * @returns {Promise<{ok: boolean, dni: string, newUid: string}>} Resultado de la operación
 * @throws {Error} Si el administrador no tiene permisos o si hay problemas en la transacción
 */
export async function reassignDNIByAdmin(dni, newUid, adminUid) {
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
 * @param {string} dni DNI del cliente a buscar
 * @returns {Promise<Object|null>} Datos del cliente o null si no existe
 */
export async function getCustomerByDNI(dni) {
  const db = getFirestore();
  const clienteRef = doc(db, 'Clientes', dni);
  const clienteSnap = await getDoc(clienteRef);
  
  if (!clienteSnap.exists()) {
    return null;
  }
  
  return clienteSnap.data();
}