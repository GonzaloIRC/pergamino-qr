
## Resumen de entorno

node: v22.17.1

npm: 10.9.2


## Dependencias clave (package.json)

expo: ^54.0.10

react-native: 0.79.5

react: 19.0.0

expo-camera: ~17.0.8

firebase: ^12.2.1

@react-navigation/native: ^6.1.18

react-native-reanimated: ~3.17.4


## Expo config

app.config.ts encontrado ✅


## Babel/Metro

babel.config.js ✅

metro.config.js ✅


## .env.local flags

EXPO_PUBLIC_USE_EMULATORS: definido ✅

EXPO_PUBLIC_FIREBASE_PROJECT_ID: definido ✅

QR_TTL_SECONDS: faltante ⚠️

SCAN_COOLDOWN_MS: faltante ⚠️


## Patrones de riesgo/cobertura en código

expo-barcode-scanner:
No encontrado ✅

CameraView (expo-camera):
No encontrado ⚠️ (debería existir)

Duplicados Firebase (initializeApp/getApp/getApps):
No se ven duplicados evidentes

Parser QR (BNF:/APP:):
No encontrado ⚠️


## Modelos esperados (archivos comunes)

src/services/firebaseClient.ts ❌

src/services/firebaseClient.js ✅

src/screens/ScannerScreen.tsx ❌

src/screens/Admin/* ❌

src/components/QrDynamicCard.tsx ❌

scripts/seedBeneficioDemo.js ✅


## Resultado

Genera este archivo para diagnóstico inicial. Revisa también REPORT/*.txt si corriste el paso 0.
