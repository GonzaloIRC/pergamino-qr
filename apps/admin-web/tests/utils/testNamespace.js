/**
 * Configuración para aislar datos de pruebas en Firestore
 * 
 * Este script establece un namespace único para las pruebas basado
 * en el identificador del commit actual o un valor aleatorio para desarrollo local.
 * 
 * Uso: importar y utilizar TEST_NS como prefijo en las colecciones.
 */

const crypto = require('crypto');

// Obtener el hash del commit desde variables de entorno (en CI) o generar uno aleatorio
const getCommitHash = () => {
  if (process.env.GITHUB_SHA) {
    return process.env.GITHUB_SHA.substring(0, 7); // Primeros 7 caracteres del SHA
  }
  
  // En desarrollo local, generar un hash aleatorio
  return crypto.randomBytes(4).toString('hex');
};

// Crear un namespace para las pruebas
const TEST_NS = process.env.TEST_NS || `ci-${getCommitHash()}`;

console.log(`Usando namespace de pruebas: ${TEST_NS}`);

/**
 * Devuelve el nombre de la colección con el prefijo del namespace de pruebas
 * @param {string} collectionName - Nombre base de la colección
 * @returns {string} Nombre prefijado de la colección
 */
function getTestCollection(collectionName) {
  return `${TEST_NS}_${collectionName}`;
}

/**
 * Limpia todas las colecciones de prueba creadas con este namespace
 * @param {object} adminDb - Instancia de Firestore inicializada con Admin SDK
 */
async function cleanupTestData(adminDb) {
  try {
    console.log(`Iniciando limpieza de datos de prueba (namespace: ${TEST_NS})...`);
    
    const collectionsToClean = [
      'serials', 
      'roles', 
      'clients',
      'users',
      'historial'
    ];
    
    const deletePromises = collectionsToClean.map(async (collName) => {
      const fullCollName = getTestCollection(collName);
      const snapshot = await adminDb.collection(fullCollName).get();
      
      const batch = adminDb.batch();
      let deletedCount = 0;
      
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
        deletedCount++;
      });
      
      if (deletedCount > 0) {
        await batch.commit();
        console.log(`Eliminados ${deletedCount} documentos de ${fullCollName}`);
      } else {
        console.log(`No se encontraron documentos en ${fullCollName}`);
      }
    });
    
    await Promise.all(deletePromises);
    console.log('Limpieza de datos de prueba completada');
  } catch (error) {
    console.error('Error durante la limpieza de datos de prueba:', error);
  }
}

module.exports = {
  TEST_NS,
  getTestCollection,
  cleanupTestData
};