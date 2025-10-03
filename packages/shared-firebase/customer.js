// Generado automáticamente para compatibilidad con scripts JavaScript
// customer.js

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createCustomerWithDNI = createCustomerWithDNI;
exports.reassignDNIByAdmin = reassignDNIByAdmin;
exports.getCustomerByDNI = getCustomerByDNI;
exports.releaseDNIByAdmin = releaseDNIByAdmin;

var _firestore = require("firebase/firestore");

var _auth = require("firebase/auth");

/**
 * Crea un cliente con un DNI específico
 * @param {Object} input Datos del cliente
 * @param {string} input.dni DNI del cliente
 * @param {string=} input.displayName Nombre del cliente (opcional)
 * @param {string=} input.phone Teléfono del cliente (opcional)
 * @returns {Promise<Object>} Objeto con el resultado de la operación
 * @throws Error si el DNI ya está en uso o no hay usuario autenticado
 */
async function createCustomerWithDNI(input) {
  const { dni, displayName, phone } = input;
  const db = (0, _firestore.getFirestore)();
  const auth = (0, _auth.getAuth)();
  const user = auth.currentUser;
  if (!user) throw new Error('auth-required');

  const uid = user.uid;
  const clienteRef = (0, _firestore.doc)(db, 'Clientes', dni);
  const perfilRef = (0, _firestore.doc)(db, 'Perfiles', uid);

  await (0, _firestore.runTransaction)(db, async (tx) => {
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
 * @returns {Promise<Object>} Objeto con el resultado de la operación
 * @throws Error si el administrador no tiene permisos o si hay problemas en la transacción
 */
async function reassignDNIByAdmin(dni, newUid, adminUid) {
  const db = (0, _firestore.getFirestore)();
  
  // Verificar si el administrador tiene permisos
  const adminRef = (0, _firestore.doc)(db, 'Administradores', adminUid);
  const adminSnap = await (0, _firestore.getDoc)(adminRef);
  if (!adminSnap.exists()) {
    throw new Error('admin-permissions-required');
  }

  const clienteRef = (0, _firestore.doc)(db, 'Clientes', dni);
  const perfilRefNew = (0, _firestore.doc)(db, 'Perfiles', newUid);

  await (0, _firestore.runTransaction)(db, async (tx) => {
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
      const perfilRefOld = (0, _firestore.doc)(db, 'Perfiles', oldUid);
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
async function getCustomerByDNI(dni) {
  const db = (0, _firestore.getFirestore)();
  const clienteRef = (0, _firestore.doc)(db, 'Clientes', dni);
  const clienteSnap = await (0, _firestore.getDoc)(clienteRef);
  
  if (!clienteSnap.exists()) {
    return null;
  }
  
  return clienteSnap.data();
}

/**
 * Libera un DNI eliminando completamente el documento (solo para administradores)
 * @param {string} dni DNI a liberar
 * @param {string} adminUid UID del administrador que realiza la liberación
 * @returns {Promise<Object>} Objeto con el resultado de la operación
 * @throws Error si el administrador no tiene permisos, el DNI no existe, o hay otros problemas
 */
async function releaseDNIByAdmin(dni, adminUid) {
  const db = (0, _firestore.getFirestore)();
  
  // Verificar si el administrador tiene permisos
  const adminRef = (0, _firestore.doc)(db, 'Administradores', adminUid);
  const adminSnap = await (0, _firestore.getDoc)(adminRef);
  if (!adminSnap.exists()) {
    throw new Error('admin-permissions-required');
  }

  const clienteRef = (0, _firestore.doc)(db, 'Clientes', dni);
  
  await (0, _firestore.runTransaction)(db, async (tx) => {
    const clienteSnap = await tx.get(clienteRef);
    
    if (!clienteSnap.exists()) {
      throw new Error('dni-not-found');
    }

    const currentData = clienteSnap.data();
    const oldUid = currentData.uid;

    // Si el DNI pertenecía a alguien, limpiamos su perfil
    if (oldUid) {
      const perfilRefOld = (0, _firestore.doc)(db, 'Perfiles', oldUid);
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
    const auditRef = (0, _firestore.doc)((0, _firestore.collection)(db, 'Alertas'));
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