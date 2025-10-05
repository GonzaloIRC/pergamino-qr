#!/usr/bin/env node
/**
 * preflight.js - Script de verificación del entorno y proyecto
 * 
 * Realiza verificaciones para asegurar que el entorno de desarrollo
 * está correctamente configurado y el proyecto puede compilarse.
 * 
 * Opciones:
 *   --with-e2e       Ejecuta pruebas E2E después de las verificaciones básicas
 *   --no-emulators   Omite el inicio de emuladores de Firebase para pruebas
 * 
 * Uso:
 *   node preflight.js
 *   node preflight.js --with-e2e
 *   node preflight.js --no-emulators
 *   node preflight.js --with-e2e --no-emulators
 */

const { execSync, spawn } = require('child_process');
const { exit } = require('process');
const readline = require('readline');

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Analizar argumentos
const args = process.argv.slice(2);
const withE2E = args.includes('--with-e2e');
const noEmulators = args.includes('--no-emulators');
const useEmulators = !noEmulators;

// Configuración
const config = {
    nodeVersion: null,
    npmVersion: null,
    e2eStatus: 'No ejecutado',
    startTime: new Date(),
    emulatorsProcess: null
};

/**
 * Ejecuta un comando y maneja errores
 * @param {string} cmd - Comando a ejecutar
 * @param {string} errorMsg - Mensaje de error si falla
 * @param {boolean} captureOutput - Si debe capturar la salida
 * @returns {string|null} - Salida del comando o null
 */
function runCommand(cmd, errorMsg, captureOutput = false) {
    try {
        console.log(`${colors.cyan}>>${colors.reset} ${cmd}`);
        const output = execSync(cmd, {
            encoding: 'utf8',
            stdio: captureOutput ? 'pipe' : 'inherit'
        });
        return captureOutput ? output.trim() : null;
    } catch (error) {
        console.error(`${colors.red}Error: ${errorMsg}${colors.reset}`);
        if (error.stdout) console.error(error.stdout.toString());
        if (error.stderr) console.error(error.stderr.toString());
        exit(1);
    }
}

/**
 * Inicia un proceso en segundo plano
 * @param {string} cmd - Comando a ejecutar
 * @param {Array<string>} args - Argumentos del comando
 * @param {string} name - Nombre descriptivo del proceso
 * @returns {ChildProcess} - El proceso iniciado
 */
function startBackgroundProcess(cmd, args, name) {
    console.log(`${colors.cyan}>>${colors.reset} Iniciando ${name} (background)`);

    const process = spawn(cmd, args, {
        detached: true,
        stdio: 'ignore',
        shell: true
    });

    process.unref();
    return process;
}

/**
 * Muestra un mensaje de éxito
 * @param {string} message - Mensaje a mostrar
 */
function showSuccess(message) {
    console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

/**
 * Realiza las verificaciones básicas del entorno
 */
function runBasicChecks() {
    console.log(`\n${colors.cyan}${colors.bright}== Preflight: entorno y proyecto ==${colors.reset}\n`);

    // 1) Node/NPM
    console.log(`${colors.cyan}>> Verificando Node.js y npm${colors.reset}`);
    config.nodeVersion = runCommand('node -v', 'Node no disponible', true);
    config.npmVersion = runCommand('npm -v', 'npm no disponible', true);
    console.log(`${colors.green}Node: ${config.nodeVersion}${colors.reset}`);
    console.log(`${colors.green}NPM: ${config.npmVersion}${colors.reset}`);

    // 2) Expo doctor
    console.log(`${colors.cyan}>> Verificando configuración de Expo${colors.reset}`);
    try {
        runCommand('npx expo-doctor', 'expo-doctor falló');
    } catch (error) {
        console.log(`${colors.yellow}Advertencia: Intentando comando alternativo...${colors.reset}`);
        runCommand('npx expo-cli doctor', 'No se pudo verificar la configuración de Expo');
    }

    // 3) Lint + Typecheck
    runCommand('npm run -ws lint', 'lint falló');
    runCommand('npm run -ws typecheck', 'typecheck falló');

    // 4) Build admin-web
    runCommand('npm run --workspace apps/admin-web build', 'build admin-web falló');
}

/**
 * Inicia los emuladores de Firebase
 */
function startEmulators() {
    if (useEmulators) {
        config.emulatorsProcess = startBackgroundProcess('npx', ['firebase', 'emulators:start'], 'Firebase emulators');
        console.log(`${colors.yellow}Esperando 6 segundos para inicio de emuladores...${colors.reset}`);
        execSync('sleep 6');
    }
}

/**
 * Ejecuta pruebas E2E
 */
async function runE2ETests() {
    if (withE2E) {
        console.log(`${colors.cyan}>> Ejecutando pruebas E2E (serial, workers=1)${colors.reset}`);

        try {
            runCommand('npx playwright install --with-deps', 'No se pudo instalar Playwright');
            runCommand('npx playwright test --workers=1', 'Algunas pruebas E2E fallaron');

            config.e2eStatus = 'Exitoso';
            showSuccess('Todas las pruebas E2E pasaron correctamente');
        } catch (error) {
            config.e2eStatus = 'Fallido';
            console.error(`${colors.red}❌ Algunas pruebas E2E fallaron. Revisa el reporte para más detalles.${colors.reset}`);
            console.log(`${colors.yellow}   Puedes ver el reporte HTML con: npx playwright show-report${colors.reset}`);
        }
    }
}

/**
 * Muestra el resumen de la ejecución
 */
function showSummary() {
    const endTime = new Date();
    const duration = (endTime - config.startTime) / 1000;

    console.log(`\n${colors.cyan}${colors.bright}== Resumen de preflight ==${colors.reset}`);
    console.log(`Fecha: ${endTime.toISOString().replace('T', ' ').slice(0, 19)}`);
    console.log(`Duración: ${duration.toFixed(1)} segundos`);
    console.log(`Node: ${config.nodeVersion}`);
    console.log(`NPM: ${config.npmVersion}`);
    console.log(`E2E: ${config.e2eStatus}`);
    console.log(`Emuladores: ${useEmulators ? 'Iniciados' : 'Omitidos'}`);
    console.log('');
    showSuccess('Preflight OK');
    console.log(`${colors.green}El proyecto está listo para desarrollo/integración.${colors.reset}`);
}

/**
 * Función principal
 */
async function main() {
    try {
        // Mostrar información de uso
        console.log(`${colors.bright}Preflight${colors.reset} - Verificación de entorno y proyecto`);
        console.log(`Opciones: ${withE2E ? '--with-e2e ' : ''}${noEmulators ? '--no-emulators' : ''}\n`);

        // Ejecutar verificaciones
        runBasicChecks();
        startEmulators();
        await runE2ETests();
        showSummary();
    } catch (error) {
        console.error(`\n${colors.red}${colors.bright}Error en preflight:${colors.reset} ${error.message}`);
        exit(1);
    }
}

// Ejecutar el programa
main();