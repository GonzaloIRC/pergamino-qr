
# AGENT_AUDIT.md — Auditoría viva (M0→M1→M2→M3)

## 1) Reglas de Oro — Checklist
- [x] Expo 53 / RN 0.79.5 / Android compile/target 35 / Gradle 8.13 / AGP 8.8.2 / Kotlin 2.0.21 / JDK 21 (jbr)
- [x] Único escáner: expo-camera (ausente: expo-barcode-scanner & *-interface)
- [x] `.env` + variables `EXPO_PUBLIC_*` (sin secretos en repo, bucket legacy soportado temporalmente)
- [x] Config **única** en `app.config.ts` (sin duplicados en `app.json`)
- [x] `babel.config.js` con `"react-native-reanimated/plugin"` al **final**
- [x] Node **20.x** en `engines` y CI
- [x] Firestore: reglas dev seguras + **índices obligatorios** (`Historial` y `BeneficioSeriales`)
- [x] Seeds: `SCRIPTS/seedBeneficioDemo.js` idempotente (docId=serial)

## 2) Expo Doctor — Evidencia (pegar salida)
### Estado inicial (2025-09-04)
> ```bash
> npx expo-doctor
> ```
>
> ```text
> env: load .env.local
> env: export EXPO_PUBLIC_USE_EMULATORS EXPO_PUBLIC_FIREBASE_PROJECT_ID EXPO_PUBLIC_FIREBASE_API_KEY 
> EXPO_PUBLIC_FIREBASE_APP_ID EXPO_PUBLIC_FIREBASE_SENDER_ID EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN EXPO_PUBLIC_FIREBASE_BUCKET                                           15/17 checks passed. 2 checks failed. Possible issues detected:
> Use the --verbose flag to see more details about passed checks.
> 
> ✖ Check for app config fields that may not be synced in a non-CNG project
> This project contains native project folders but also has native configuration properties in app.config.ts, indicating it is configured to use Prebuild. When the android/ios folders are present, if you don't run prebuild in your build pipeline, the following properties will not be synced: scheme.
> 
> 
> ✖ Check that packages match versions required by installed Expo SDK
> CommandError: "jest" is added as a dependency in your project's package.json but it doesn't seem to be installed. Run "npm install", or the equivalent for your package manager, and try again.       
> 
> Advice:
> Use 'npx expo install --check' to review and upgrade your dependencies.
> To ignore specific packages, add them to "expo.install.exclude" in package.json. Learn more: https://expo.fyi/dependency-validation                                                                   
> 2 checks failed, indicating possible issues with the project.
> ```

### Estado después de las correcciones
> ```bash
> npx expo-doctor
> ```
>
> ```text
> env: load .env.local
> env: export EXPO_PUBLIC_USE_EMULATORS EXPO_PUBLIC_FIREBASE_PROJECT_ID EXPO_PUBLIC_FIREBASE_API_KEY 
> EXPO_PUBLIC_FIREBASE_APP_ID EXPO_PUBLIC_FIREBASE_SENDER_ID EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN EXPO_PUBLIC_FIREBASE_BUCKET                                           16/17 checks passed. 1 checks failed. Possible issues detected:
> Use the --verbose flag to see more details about passed checks.
> 
> ✖ Check for app config fields that may not be synced in a non-CNG project
> This project contains native project folders but also has native configuration properties in app.config.ts, indicating it is configured to use Prebuild. When the android/ios folders are present, if you don't run prebuild in your build pipeline, the following properties will not be synced: scheme, orientation, userInterfaceStyle, ios, android, plugins.                                           
> 
> 1 check failed, indicating possible issues with the project.
> ```

### Estado final (2025-09-04)
> ```bash
> npx expo-doctor
> ```
>
> ```text
> env: load .env.local
> env: export EXPO_PUBLIC_USE_EMULATORS EXPO_PUBLIC_FIREBASE_PROJECT_ID EXPO_PUBLIC_FIREBASE_API_KEY 
> EXPO_PUBLIC_FIREBASE_APP_ID EXPO_PUBLIC_FIREBASE_SENDER_ID EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN EXPO_PUBLIC_FIREBASE_BUCKET                                           16/17 checks passed. 1 checks failed. Possible issues detected:
> Use the --verbose flag to see more details about passed checks.
> 
> ✖ Check for app config fields that may not be synced in a non-CNG project
> This project contains native project folders but also has native configuration properties in app.config.ts, indicating it is configured to use Prebuild. When the android/ios folders are present, if you don't run prebuild in your build pipeline, the following properties will not be synced: scheme, orientation, userInterfaceStyle, ios, android, plugins.                                           
> 
> 1 check failed, indicating possible issues with the project.
> ```

## 3) Riesgos detectados (con 2 mitigaciones por ítem)
- Mismatch SDK/AGP/Gradle/Kotlin/JDK  
  Mitigación A: fijar versiones por matriz. Mitigación B: `expo install` en lugar de `--legacy-peer-deps`.
- Reanimated fuera de orden en Babel  
  Mitigación A: mover plugin a **última** posición. Mitigación B: `expo start -c` + cache reset.
- Paquetes nativos que imponen prebuild  
  Mitigación A: sustituir por alternativas managed o gating. Mitigación B: rama aparte con rollback simple.
- Config duplicada (`app.json` vs `app.config.ts`)  
  Mitigación A: consolidar y eliminar duplicado. Mitigación B: documentar en CHANGELOG + guardas en CI.
- Secrets en repo  
  Mitigación A: migrar a `.env` + `EXPO_PUBLIC_*`. Mitigación B: .gitignore + secret scanning, y rotación si expuestos.

## 4) Plan de PRs apilados
1) `fix/phase1-base`  ← desde `main`  
2) `feat/phase2-dual-admin`  ← desde `fix/phase1-base`  
3) `feat/phase3-growth`  ← desde `feat/phase2-dual-admin`  

## 5) COMPLETADO
✅ Salida `expo-doctor` añadida en sección 2.
✅ Snapshot `agent-context/PROJECT_CONTEXT.md` generado ejecutando `node SCRIPTS/context-scan-fix.js`.

## 6) Evaluación del estado actual (M0) - ACTUALIZADO
Basado en el snapshot, expo-doctor, y las correcciones implementadas:

### Aciertos:
- ✅ Node 20.x en engines correctamente configurado
- ✅ No se usa expo-barcode-scanner (prohibido), se usa expo-camera
- ✅ Reglas de Firestore implementadas con principio "denegar por defecto"
- ✅ Índices configurados correctamente para Historial y BeneficioSeriales
- ✅ No hay secretos versionados en el repositorio
- ✅ Script start configurado correctamente como "expo start --dev-client"
- ✅ Dependencias instaladas correctamente con --legacy-peer-deps
- ✅ Configuración de app.config.ts simplificada y actualizada

### Problemas resueltos:
- ✅ Instaladas dependencias Jest utilizando `npm install --legacy-peer-deps`
- ✅ Simplificada y actualizada la configuración en app.config.ts para evitar conflictos
- ✅ Eliminadas referencias a iconos y recursos que no existen

### Problemas pendientes:
- ⚠️ Proyecto contiene carpetas nativas (android), expo-doctor advierte que se debe ejecutar `npx expo prebuild` en el pipeline de CI/CD para mantener sincronizada la configuración

### Plan de acción para M1:
1. Incluir `npx expo prebuild` en el pipeline de CI/CD para sincronizar configuración
2. Crear los recursos gráficos (iconos, splash) necesarios para la app
3. Establecer proceso de auditoría periódica con expo-doctor
