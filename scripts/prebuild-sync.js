#!/usr/bin/env node
/**
 * prebuild-sync.js - Script para sincronizar configuración entre app.config.ts y carpetas nativas
 * Debe ejecutarse en el pipeline de CI/CD antes de la compilación
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Sincronizando configuración de app.config.ts con carpetas nativas...');

try {
  // Verificar que estamos en la raíz del proyecto
  if (!fs.existsSync('app.config.ts')) {
    console.error('❌ Error: Este script debe ejecutarse desde la raíz del proyecto');
    process.exit(1);
  }

  // Ejecutar expo prebuild para sincronizar configuración
  console.log('📦 Ejecutando expo prebuild...');
  execSync('npx expo prebuild --clean', { stdio: 'inherit' });

  console.log('✅ Configuración sincronizada correctamente');
} catch (error) {
  console.error('❌ Error al sincronizar configuración:', error.message);
  process.exit(1);
}
