import { db } from './firebaseClient';
import { doc, collection, addDoc, getDoc, query, where, getDocs, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { getSettings } from './settings';

/**
 * Registra un nuevo referido en el sistema
 * @param {string} referrerId - ID del usuario que refiere
 * @param {string} referredId - ID del usuario referido
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function registerReferral(referrerId, referredId) {
  if (!referrerId || !referredId || referrerId === referredId) {
    return { success: false, message: 'IDs de usuarios inválidos' };
  }

  try {
    // Verificar que ambos usuarios existen
    const referrerDoc = await getDoc(doc(db, 'Perfiles', referrerId));
    const referredDoc = await getDoc(doc(db, 'Perfiles', referredId));

    if (!referrerDoc.exists()) {
      return { success: false, message: 'El usuario que refiere no existe' };
    }

    if (!referredDoc.exists()) {
      return { success: false, message: 'El usuario referido no existe' };
    }

    // Verificar que el usuario no haya sido referido antes
    const existingReferrals = await getDocs(
      query(collection(db, 'Referidos'), where('referredId', '==', referredId))
    );

    if (!existingReferrals.empty) {
      return { success: false, message: 'El usuario ya ha sido referido anteriormente' };
    }

    // Obtener la bonificación por referidos de la configuración
    const settings = getSettings();
    const pointsPerReferral = settings.POINTS_PER_REFERRAL || 10;

    // Registrar el referido
    const referralData = {
      referrerId,
      referredId,
      timestamp: serverTimestamp(),
      status: 'active',
      pointsAwarded: pointsPerReferral
    };

    await addDoc(collection(db, 'Referidos'), referralData);

    // Actualizar los puntos del usuario que refiere
    await updateDoc(doc(db, 'Perfiles', referrerId), {
      'stats.totalReferrals': increment(1),
      'points.total': increment(pointsPerReferral),
      'points.referrals': increment(pointsPerReferral),
      'points.lastUpdated': serverTimestamp()
    });

    // Registrar en el historial
    await addDoc(collection(db, 'Historial'), {
      tipo: 'referido',
      userId: referrerId,
      referredId,
      points: pointsPerReferral,
      ts: serverTimestamp()
    });

    return { 
      success: true, 
      message: `Referido registrado correctamente. ${pointsPerReferral} puntos otorgados.`,
      pointsAwarded: pointsPerReferral
    };
  } catch (error) {
    console.error('Error registrando referido:', error);
    return { success: false, message: 'Error al registrar referido: ' + error.message };
  }
}

/**
 * Obtiene los referidos de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Lista de referidos
 */
export async function getUserReferrals(userId) {
  if (!userId) return [];

  try {
    const referralsQuery = query(
      collection(db, 'Referidos'),
      where('referrerId', '==', userId)
    );

    const snapshot = await getDocs(referralsQuery);
    const referrals = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const referredProfile = await getDoc(doc(db, 'Perfiles', data.referredId));
      
      referrals.push({
        id: doc.id,
        ...data,
        referredName: referredProfile.exists() ? referredProfile.data().displayName : 'Usuario',
        timestamp: data.timestamp?.toDate?.() || new Date()
      });
    }

    return referrals.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error obteniendo referidos:', error);
    return [];
  }
}

/**
 * Genera un código de referido para compartir
 * @param {string} userId - ID del usuario
 * @returns {string} - Código de referido
 */
export function generateReferralCode(userId) {
  if (!userId) return '';
  
  // Crear un código usando el userId y una cadena aleatoria
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REF-${userId.substring(0, 4)}-${randomStr}`;
}
