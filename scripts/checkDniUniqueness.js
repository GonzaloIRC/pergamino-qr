// Script para verificar si un usuario puede registrarse con el mismo DNI
// Ubicación: scripts/checkDniUniqueness.js

const { registerUser, isDniUnique, initializeFirebase } = require('./registerUser');
const { getFirestore } = require('firebase/firestore');

// Función para probar la unicidad del DNI
async function testDniUniqueness() {
  console.log('🔍 Probando sistema de validación de DNI único...');
  
  // Inicializar Firebase
  const app = initializeFirebase();
  const db = getFirestore(app);
  
  // DNI de prueba
  const testDni = '87654321';
  
  try {
    // 1. Verificar si el DNI ya está registrado
    console.log(`🔍 Verificando si el DNI ${testDni} está registrado...`);
    const dniIsUnique = await isDniUnique(db, testDni);
    
    if (dniIsUnique) {
      console.log(`✅ El DNI ${testDni} no está registrado. Procediendo con el registro...`);
      
      // 2. Registrar un usuario con ese DNI
      const result1 = await registerUser({
        email: 'test1@example.com',
        password: 'Test123!',
        name: 'Usuario de Prueba 1',
        dni: testDni
      });
      
      if (result1) {
        console.log('✅ Primer usuario registrado exitosamente');
        
        // 3. Intentar registrar otro usuario con el mismo DNI
        console.log('🔄 Intentando registrar un segundo usuario con el mismo DNI...');
        const result2 = await registerUser({
          email: 'test2@example.com',
          password: 'Test123!',
          name: 'Usuario de Prueba 2',
          dni: testDni
        });
        
        if (!result2) {
          console.log('✅ PRUEBA EXITOSA: El sistema impidió el registro duplicado del DNI');
          return true;
        } else {
          console.error('❌ PRUEBA FALLIDA: El sistema permitió registrar el mismo DNI dos veces');
          return false;
        }
      } else {
        console.error('❌ No se pudo registrar el primer usuario para la prueba');
        return false;
      }
    } else {
      console.log(`ℹ️ El DNI ${testDni} ya está registrado. Prueba con otro DNI o limpia la base de datos.`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    return false;
  }
}

// Ejecutar la prueba si se llama directamente
if (require.main === module) {
  testDniUniqueness().then(success => {
    if (success) {
      console.log('✅ Verificación de unicidad de DNI completada exitosamente');
      process.exit(0);
    } else {
      console.error('❌ La verificación de unicidad de DNI no fue exitosa');
      process.exit(1);
    }
  }).catch(error => {
    console.error('❌ Error durante la verificación:', error);
    process.exit(1);
  });
}

module.exports = { testDniUniqueness };