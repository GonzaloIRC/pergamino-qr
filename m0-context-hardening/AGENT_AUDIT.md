# Auditoría Inicial – Pergamino QR

Este documento recoge los hallazgos obtenidos durante la Fase A del proceso de
auditoría y preparación para el MegaPrompt.  Se contrasta el estado real del
repositorio con las **Reglas de Oro** y otros requisitos definidos en
`DECISIONES.md` y se proponen mitigaciones para cada riesgo identificado.

## Resumen de Reglas de Oro y Conformidad

| Regla / Parámetro                                      | Estado | Evidencia |
|--------------------------------------------------------|:------:|----------|
| **Expo SDK 53 / React Native 0.79.5**                 | ✅     | `package.json` declara `expo` 53.0.22 y `react-native` 0.79.5【15354452755536†L21-L32】 |
| **Android compile/target 35, Gradle 8.13, AGP 8.8.2**  | ⚠️     | No existen carpetas nativas; se desconoce si el proyecto se ha precompilado. Será verificado en PRs posteriores. |
| **Kotlin 2.0.21 / JDK 21 (jbr)**                       | ⚠️     | No aplicable al proyecto managed. |
| **Único escáner: `expo-camera` (prohibido `expo-barcode-scanner`)** | ✅ | `package.json` incluye `expo-camera` y no incluye `expo-barcode-scanner`【15354452755536†L15-L23】. Los componentes de escaneo en `src/components/BarcodeScanner/Scanner.js` y otros usan `CameraView` de `expo-camera`【670092090241804†L1-L21】. |
| **Variables `EXPO_PUBLIC_*` y `.env` sin secretos en repo** | ⚠️ | Existe `.env.example` con variables vacías【390657359864566†L0-L23】. Sin embargo, `src/services/firebase/app.js` contiene claves de respaldo (`apiKey`, `projectId`, etc.)【163964754271537†L11-L21】; esto constituye un secreto en el código. |
| **Configuración central en `app.config.ts`; ausencia de `app.json` duplicado** | ✅ | `app.config.ts` existe【284273921207780†L0-L37】 y no hay `app.json` en el repositorio (404). |
| **`babel.config.js` con plugin de Reanimated al final** | ✅ | El plugin `react-native-reanimated/plugin` aparece al final del array de plugins【107811851199102†L6-L8】. |
| **Node 20.x en engines y CI** | ✅ | `package.json` define "node": "20.x"【15354452755536†L4-L6】. |
| **Firestore dev mínima – reglas seguras** | ❌ | `firebase/firestore.rules` permite acceso total con `allow read, write: if true;`【738006234195842†L0-L8】. Esto es un riesgo crítico de seguridad. |
| **Índices obligatorios (`Historial` y `BeneficioSeriales`)** | ❌ | `firebase/firestore.indexes.json` está vacío【688579975757249†L0-L3】; faltan los índices requeridos. |
| **Ausencia de `expo-barcode-scanner` en la matriz de versiones** | ❌ | `agent-context/DOCS/version-matrix.md` lista `expo-barcode-scanner` como dependencia compatible【363306371494932†L15-L20】, lo cual contradice las políticas. |
| **Seeds idempotentes (`scripts/seedBeneficioDemo.js`)** | ✅ | Existe un script que crea un beneficio demo y seriales quemables con idempotencia【369838652763593†L0-L166】. |
| **Documentación y auditoría** | ⚠️ | `AGENT_AUDIT.md` previo tiene contenido desactualizado; se necesita actualizar con la nueva auditoría. |

### Leyenda
✅ Cumple / Presente   ❌ No cumple / Falta   ⚠️ Desconocido o requiere revisión adicional

## Riesgos Identificados y Mitigaciones

1. **Reglas de Firestore permisivas**
   - *Riesgo*: Las reglas actuales (`allow read, write: if true;`) permiten acceso total a cualquier documento, exponiendo toda la base de datos【738006234195842†L0-L8】.
   - *Mitigaciones*:
     1. Reemplazar las reglas por una configuración de desarrollo segura que solo permita acceso a usuarios autenticados.  Por ejemplo, utilizar funciones `isAuthed()` y limitar la escritura/canje de seriales a transacciones validadas.
     2. Incluir las reglas de Firestore en los PRs de M0 y documentar su uso en el README.

2. **Falta de índices compuestos en Firestore**
   - *Riesgo*: Las consultas sobre `Historial` y `BeneficioSeriales` pueden fallar o ser ineficientes debido a la ausencia de índices compuestos【688579975757249†L0-L3】.
   - *Mitigaciones*:
     1. Crear `firestore.indexes.json` con los índices requeridos: `Historial (dni ASC, fecha DESC)` y `BeneficioSeriales (beneficioId ASC, estado ASC, creado DESC)`.
     2. Verificar que estos índices se desplieguen junto con las reglas en los emuladores y en el proyecto de Firebase.

3. **Claves de Firebase embebidas en el código**
   - *Riesgo*: `src/services/firebase/app.js` define valores predeterminados para `apiKey`, `projectId`, etc., exponiendo credenciales reales del proyecto【163964754271537†L11-L21】.
   - *Mitigaciones*:
     1. Eliminar los valores de respaldo y requerir que todas las variables provengan de `process.env.EXPO_PUBLIC_*`.  Proveer un `.env.example` para desarrollo.
     2. Añadir un chequeo en la inicialización de Firebase que muestre un error claro si faltan variables, en lugar de usar credenciales por defecto.

4. **Dependencia listada de `expo-barcode-scanner` en la matriz de versiones**
   - *Riesgo*: Podría llevar a confusión e instalación innecesaria de un paquete prohibido【363306371494932†L15-L20】.
   - *Mitigaciones*:
     1. Actualizar `agent-context/DOCS/version-matrix.md` para remover la fila de `expo-barcode-scanner` o marcarla como obsoleta.
     2. Añadir notas en la documentación señalando que solo debe utilizarse `expo-camera` para escaneo de códigos.

5. **Readme desactualizado**
   - *Riesgo*: El README actual sugiere instalar `expo-barcode-scanner` y ejecutar `expo start` sin `--dev-client`【462322144018899†L41-L47】, lo cual contradice las prácticas recomendadas.
   - *Mitigaciones*:
     1. Actualizar el README para instruir la instalación mediante `expo install` y utilizar únicamente `expo-camera`.
     2. Añadir una sección que describa los flujos de semilla, configuraciones `.env` y el uso del cliente de desarrollo (`npx expo start --dev-client`).

6. **Ausencia de plantilla de Pull Request**
   - *Riesgo*: Las contribuciones pueden carecer de checklist de pruebas E2E, verificación de reglas/índices y auditoría.
   - *Mitigaciones*:
     1. Crear `.github/pull_request_template.md` con un checklist para cada módulo (M1/M2/M3), confirmando que se ejecutó `expo-doctor`, que las reglas e índices están correctos, y que se han probado los flujos en dispositivo físico.
     2. Asegurar que cada PR haga referencia a la auditoría y registre riesgos o excepciones.

## Próximos Pasos

1. **Generar `PROJECT_CONTEXT.md`** ejecutando `node SCRIPTS/context-scan.js` en la raíz del repo para obtener un snapshot detallado.
2. **Corregir M0 (security hardening)** creando una rama `fix/m0-security-hardening` que incluya:
   - Reglas seguras de Firestore y los índices obligatorios.
   - Plantilla de PR y `.env.example` si falta.
   - Eliminación de credenciales embebidas.
3. **Esperar aprobación del usuario** para continuar con M1 (`fix/phase1-base`).