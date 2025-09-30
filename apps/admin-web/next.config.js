/**
 * Determinar qué archivo .env cargar basado en NODE_ENV
 */
const loadEnvConfig = () => {
  const { NODE_ENV } = process.env;
  
  // Si estamos en modo e2e, cargar .env.e2e
  if (NODE_ENV === 'e2e') {
    console.log('🧪 Cargando configuración para pruebas E2E con Firebase real (.env.e2e)');
    require('dotenv').config({ path: './.env.e2e' });
  }
  // En otros casos, Next.js cargará .env.local automáticamente
};

// Ejecutar configuración de entorno
loadEnvConfig();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify está habilitado por defecto en Next.js 15+
  outputFileTracingRoot: "C:\\Users\\k\\Documents\\Pergamino-app 2",
};

module.exports = nextConfig;