# Auditoría inicial y plan de trabajo

Esta auditoría se basa en el estado del repositorio **pergamino‑qr** en la rama `main` al 02 de octubre de 2025. El proyecto contiene la aplicación móvil desarrollada con Expo y React Native; todavía no existe la aplicación web de administración, por lo que el análisis se centra en la app móvil, los scripts y las reglas de Firestore.

## Análisis de dependencias y versiones

El archivo `package.json` del proyecto móvil define las dependencias clave del ecosistema Expo 53 y React Native【26935810573452†L26-L50】. La siguiente tabla resume las versiones actuales y señala si cumplen con las restricciones indicadas en las reglas de operación:

| Componente/paquete | Versión actual | Observaciones (resumen) | Estado |
| --- | --- | --- | --- |
| **Node (engines)** | 20.x【26935810573452†L3-L5】 | Coincide con la matriz exigida; Node 20 es compatible con Expo 53. | ✅ |
| **Expo SDK** | 53.0.22【26935810573452†L26-L34】 | Expo 53 incluye React Native 0.79【143696423440154†L10-L18】 y habilita la nueva arquitectura por defecto. | ✅ |
| **React Native** | 0.79.5【26935810573452†L40-L44】 | Versión alineada con Expo 53 (RN 0.79). | ✅ |
| **React** | 19.0.0【26935810573452†L40-L44】 | Compatible con Expo 53. | ✅ |
| **React Native Reanimated** | ~3.17.4【26935810573452†L43-L47】 | Versiona ligeramente por debajo de 3.17.5; actualizar a 3.17.5 garantizará compatibilidad total con RN 0.79. | ⚠️ |
| **expo-camera** | ~16.1.11【26935810573452†L32-L35】 | Es el único escáner permitido; cumple la regla de no usar `expo-barcode-scanner`. | ✅ |
| **Firebase JS SDK** | ^12.2.1【26935810573452†L39-L40】 | Usa el SDK modular. Verificar que las importaciones sean modulares para evitar incluir todo `firebase/app`. | ⚠️ |
| **@react-navigation/bottom-tabs** | 6.5.20【26935810573452†L29-L31】 | Mantener versiones de navegación sincronizadas para evitar avisos de `peerDeps`. | ⚠️ |
| **react-native-paper** | ^5.14.5【26935810573452†L44-L45】 | Sin problemas de compatibilidad reportados con RN 0.79. | ✅ |
| **babel.config.js** | Plugin de Reanimated ubicado al final【292442436771930†L3-L7】 | Cumple con la guía (el plugin debe ser el último). | ✅ |
| **metro.config.js** | Usa `resolverMainFields` para priorizar `react-native`【656687544465304†L1-L6】 | Configuración recomendada para que Firebase utilice el bundler correcto. | ✅ |

## Scripts y utilidades

El proyecto define varios scripts en `package.json`【26935810573452†L7-L24】:

- **`npm run doctor`** ejecuta `expo-doctor` para verificar el entorno de Expo y las dependencias.
- **`start` / `start:clean` / `start:dev`** inician la aplicación con el Dev Client de Expo.
- **`emulators:start`** y **`emulators:export`** manejan emuladores de Firebase para pruebas locales.
- **`prebuild`** llama al script `scripts/prebuild-sync.js` para sincronizar la configuración cuando se generan proyectos nativos.
- El script **`scripts/seedBeneficioDemo.js`** siembra un beneficio demo y seriales; utiliza credenciales de servicio proporcionadas por variables de entorno y es idempotente【828119071030174†L21-L47】.

No existe actualmente un script dedicado a pruebas E2E (Playwright). Se sugiere añadir `"test:e2e": "playwright test --workers=1"` en el `package.json` del *admin‑web* cuando se cree esa aplicación.

## Resultado de Expo Doctor

En `AGENT_AUDIT.md` se documentan varias ejecuciones de `expo-doctor`. En el primer estado (04‑sep‑2025), dos chequeos fallaban debido a paquetes sin instalar y configuración de prebuild【861723971566133†L23-L35】. Tras instalar las dependencias y ajustar la configuración, sólo queda un aviso sobre campos del `app.config.ts` que podrían no sincronizarse si no se ejecuta `expo prebuild`【861723971566133†L49-L67】. Esto indica que la aplicación contiene carpetas nativas (`android`) y que las propiedades definidas en `app.config.ts` podrían no aplicarse si no se sincronizan en la tubería de CI/CD. Se recomienda ejecutar `npx expo prebuild` en el pipeline o eliminar las carpetas nativas si se utiliza únicamente Expo Go.

## Reglas e índices de Firestore

El archivo `firebase/firestore.rules` define reglas que permiten la lectura y escritura autenticada en la mayoría de las colecciones【409445334005985†L11-L33】:

- **Clientes** (`/Clientes/{dni}`): lectura y escritura permitidas para cualquier usuario autenticado【409445334005985†L11-L15】.
- **BeneficioSeriales**: lectura y escritura permitidas para usuarios autenticados【409445334005985†L23-L27】.
- **Historial**: lectura y escritura permitidas【409445334005985†L29-L33】.
- **Ajustes** y **Beneficios**: sólo lectura; escritura denegada【409445334005985†L5-L21】.

Los índices compuestos en `firestore.indexes.json` incluyen uno para ordenar el historial por `dni` y `fecha`, y otro para `BeneficioSeriales` por `beneficioId`, `estado` y `creado`【142024280283930†L1-L33】.

**Riesgos**: actualmente las reglas no verifican que la clave de documento (`dni` o `serial`) coincida con los datos enviados, lo que permite crear duplicados o sobrescribir registros. Tampoco restringen la creación de documentos por roles, por lo que cualquier usuario autenticado puede escribir en colecciones críticas.

## Hallazgos y priorización

La siguiente lista clasifica los hallazgos más relevantes, con un indicador de prioridad:

- ✅ **Compatibilidad de versiones:** el proyecto utiliza Expo 53 con React Native 0.79 y React 19; las versiones son coherentes con la matriz recomendada【26935810573452†L40-L44】【143696423440154†L10-L18】.
- ✅ **Configuración de Babel y Metro:** el plugin de Reanimated se ubica al final del array de plugins【292442436771930†L3-L7】 y el resolver de Metro prioriza `react-native`【656687544465304†L1-L6】.
- ✅ **`.gitignore` incluye variables de entorno y credenciales:** se excluyen `.env*`, `serviceAccount*.json` y `*credentials*.json`【845384983873693†L16-L23】, evitando exponer claves sensibles.
- ⚠️ **Reanimated**: la versión 3.17.4 está desfasada respecto a la recomendada 3.17.5; actualizarla reducirá riesgos de incompatibilidad con RN 0.79.
- ⚠️ **Reglas de Firestore permisivas:** permiten escritura para cualquier usuario autenticado en `Clientes`, `BeneficioSeriales` y `Historial`【409445334005985†L11-L33】. No se obliga a que el ID del documento (`dni`/`serial`) coincida con el dato, lo que facilita duplicados de DNI y seriales. Será necesario reforzar estas reglas en un PR posterior.
- ⚠️ **Prebuild pendiente en CI:** `expo-doctor` detecta que campos de `app.config.ts` no se sincronizan con los proyectos nativos si no se ejecuta `expo prebuild`【861723971566133†L49-L67】. Se debe añadir la ejecución de `npx expo prebuild` al workflow o eliminar las carpetas nativas si sólo se usa Expo Go.
- ⚠️ **Ausencia de aplicación web administrativa:** el repositorio no contiene un paquete `admin‑web`; deberá generarse en las siguientes fases (Next.js 14) con un `package.json` independiente y mantener versiones estables de Next/React.
- ❌ **Exclusión de keystores:** el `.gitignore` no contempla archivos `.jks` o `.keystore`; es imprescindible añadir patrones para excluir estos archivos y no exponer firmados.
- ❌ **Scripts de E2E ausentes:** no hay configuración de Playwright ni comandos `test:e2e`; esto debe abordarse antes de estabilizar el pipeline de CI/E2E.

## Correcciones rápidas y PRs sugeridos

1. **Actualizar `.gitignore`:** añadir patrones para excluir archivos de firmas de Android (`*.jks`, `*.keystore`) y respaldos de credenciales. Esto evita subir secretos al repositorio.
2. **Actualizar dependencias críticas:** elevar `react-native-reanimated` a la versión 3.17.5 (o la que fije Expo 53) y revisar que `@react-navigation` tenga versiones compatibles entre sí para evitar avisos de `peerDeps`.
3. **Sincronización de configuración nativa:** añadir la ejecución de `npx expo prebuild` en la pipeline de CI para mantener sincronizados `android/ios` con `app.config.ts`, o remover las carpetas nativas si se decide usar sólo Expo Go.
4. **Refuerzo de reglas de Firestore:** en un PR posterior, definir `Clientes/{dni}` con ID único (`dni`) y agregar validaciones de `request.resource.id == request.resource.data.dni` para evitar duplicados. También restringir la escritura de `Beneficios`, `BeneficioSeriales` y `Historial` mediante reclamaciones de rol.
5. **Preparar la aplicación web administrativa:** crear un nuevo paquete `admin‑web` basado en Next.js 14. Mantener las versiones estables (no actualizar Next ni Expo en el mismo PR) y añadir scripts E2E con Playwright, incluyendo `test:e2e` en su `package.json`.

Este reporte proporciona una visión global del estado actual del proyecto y sienta las bases para el Issue **“Audit & Plan”**. Las acciones propuestas se pueden abordar en PRs independientes según su prioridad.
