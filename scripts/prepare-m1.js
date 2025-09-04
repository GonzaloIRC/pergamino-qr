/**
 * Script para preparar el entorno de desarrollo para M1
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparando entorno para Milestone 1...');

// Verificar dependencias
console.log('📦 Verificando dependencias...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias instaladas correctamente');
} catch (error) {
  console.error('❌ Error instalando dependencias:', error.message);
  process.exit(1);
}

// Verificar documentación
console.log('📝 Verificando documentación...');
const docsFolder = path.join(__dirname, '..', 'docs');
const requiredDocs = ['M1_ALCANCE.md', 'M1_PLAN_IMPLEMENTACION.md', 'M1_GUIA_TECNICA.md'];

if (!fs.existsSync(docsFolder)) {
  console.log('📁 Creando carpeta docs...');
  fs.mkdirSync(docsFolder, { recursive: true });
}

let allDocsExist = true;
for (const doc of requiredDocs) {
  const docPath = path.join(docsFolder, doc);
  if (!fs.existsSync(docPath)) {
    console.log(`❌ Falta documento: ${doc}`);
    allDocsExist = false;
  }
}

if (allDocsExist) {
  console.log('✅ Todos los documentos de M1 están presentes');
} else {
  console.log('⚠️ Faltan algunos documentos de M1. Ejecuta: npm run generate-docs');
}

// Verificar reglas de Firestore
console.log('🔒 Verificando reglas de seguridad...');
const rulesPath = path.join(__dirname, '..', 'firebase', 'firestore.rules');

if (!fs.existsSync(rulesPath)) {
  console.log('❌ No se encontraron las reglas de Firestore');
  console.log('⚠️ Necesitas crear las reglas de seguridad antes de continuar');
} else {
  console.log('✅ Reglas de Firestore encontradas');
}

// Comprobar configuración de ESLint
console.log('🧹 Verificando configuración de ESLint...');
const eslintPath = path.join(__dirname, '..', '.eslintrc.json');

if (!fs.existsSync(eslintPath)) {
  console.log('❌ No se encontró configuración de ESLint');
  console.log('⚠️ Se recomienda configurar ESLint para mantener la calidad del código');
} else {
  console.log('✅ Configuración de ESLint encontrada');
  try {
    console.log('🔍 Ejecutando lint...');
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Lint completado');
  } catch (error) {
    console.error('⚠️ Hay problemas de lint que deben corregirse:', error.message);
  }
}

console.log('\n🎯 Entorno para M1 preparado! Puedes comenzar a trabajar en las nuevas características.');
console.log('📚 Consulta la documentación en la carpeta docs/ para más información.');
