# PROJECT_CONTEXT.md — Snapshot real
Generado: 2025-09-04T01:27:53.398Z

## Git
- Default branch: `main`
- Branches (top):
  - chore/agent-scaffold
  - feature/firebase-seed-setup
  - fix/compat-expo
  - fix/m0-repair
  - fix/m0-repair-new
  - fix/phase1-base
  - main
  - pr-1
  - origin
  - origin/chore/agent-scaffold
  - origin/fix/compat-expo
  - origin/fix/m0-repair
  - origin/fix/phase1-base
  - origin/main
  - origin/pr-1
- Últimos commits:
  - 720f18a Merge: Incorporar cambios de seguridad de M0
  - f47c3c0 Merge pull request #2 from GonzaloIRC/fix/m0-repair
  - 7f20281 Merge origin/main y resolver conflictos en AnonymousLogin.js
  - b048e9c fix: Corregir manejo de roles y mejorar navegación por pestañas
  - a8f0963 fix: Navegación automática a MainTabs después de inicio de sesión exitoso
  - 92a45c7 fix: Mejorar manejo de errores de autenticación y registrar usuario automáticamente cuando sea necesario
  - 353f30f fix: Reemplazado login anónimo por email/password para resolver error auth/admin-restricted-operation
  - 57b9341 M1 scaffold: docs, indexes, seed demo, config, expo-doctor audit
  - eb8f12b M0 repair: corregir imports de Firebase en componentes de pantalla
  - a990c57 M0 repair: configuración correcta de babel.config.js
- Remotes:
  - origin	https://github.com/GonzaloIRC/pergamino-qr (fetch)
  - origin	https://github.com/GonzaloIRC/pergamino-qr (push)

## Archivos clave (según Megaprompt)
- Presentes: `DECISIONES.md`, `AGENT_AUDIT.md`, `agent-context/AGENT_CONTEXT.md`, `agent-context/DOCS/version-matrix.md`, `agent-context/DOCS/constraints.md`, `firestore.rules`, `firestore.indexes.json`, `firebase.json`, `app.config.ts`, `babel.config.js`, `SCRIPTS/seedBeneficioDemo.js`, `README.md`, `CHANGELOG.md`
- Faltantes: ninguno

## Scanner / QR
- expo-camera: ENCONTRADO
- expo-barcode-scanner: no
- *-interface: no
- Payload BNF: no 
- Payload APP: no 

## package.json
- engines.node: `20.x` (esperado 20.x)
- scripts.start: `expo start --dev-client` (esperado: "expo start --dev-client")

## Firestore
### Reglas
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthed() { return request.auth != null; }

    // Ajustes (lectura; escritura solo admin roles en M2+)
    match /Ajustes/{doc} {
      allow read: if isAuthed();
      allow write: if false;
    }

    // Clientes (ID = DNI): lectura/escritura autenticada en M1, roles en M2+
    match /Clientes/{dni} {
      allow read, write: if isAuthed();
    }

    // Beneficios: lectura autenticada; escritura en Admin (M2+)
    match /Beneficios/{id} {
      allow read: if isAuthed();
      allow write: if false;
    }

    // BeneficioSeriales (docId = serial): lectura autenticada; canje por transacción en backend/app
    match /BeneficioSeriales/{serial} {
      allow read: if isAuthed();
      allow write: if isAuthed(); // restringir por rol/claim en M2+
    }

    // Historial: lectura/escritura autenticada
    match /Historial/{id} {
      allow read, write: if isAuthed();
    }

    // Denegado por defecto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

```
### Índices
```
{
  "indexes": [
    {
      "collectionGroup": "Historial",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "dni",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "fecha",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "BeneficioSeriales",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "beneficioId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "estado",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "creado",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Entornos y secretos
- `.env.example`: presente
- Posibles secretos versionados (heurística): (.env.example) (.env.local) (.github\pull_request_template.md) (.gitignore) (AGENT_AUDIT.md)
- Archivos sensibles rastreados: ninguno

> **Nota:** Para PRs y Issues remotos es necesario acceso por red a GitHub; este script solo inspecciona el repo local.

