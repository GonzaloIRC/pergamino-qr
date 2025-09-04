# Descripción
<!-- ¿Qué problema resuelve este PR? Resumen corto de cambios. -->

## Checklist general
- [ ] Sin secretos en repo (`.env`, service accounts, keys)
- [ ] `babel.config.js` con reanimated **al final**
- [ ] `app.config.ts` único (sin duplicar `app.json`)
- [ ] `firestore.rules` y `firestore.indexes.json` actualizados
- [ ] `README`/`CHANGELOG` y `AGENT_AUDIT` actualizados

## Checklist M0 — Security Hardening
- [ ] Reglas Firestore sin `allow true`; requieren auth
- [ ] Índices compuestos `Historial` / `BeneficioSeriales`
- [ ] `src/services/firebase/app.js` solo `EXPO_PUBLIC_*` + emuladores opcionales
- [ ] `.env.example` normalizado con flags runtime
- [ ] README actualizado (Expo Dev Client; **solo** `expo-camera`)

### M1 — Base + Roles + E2E
- [ ] `expo-camera` como único escáner (NO `expo-barcode-scanner`)
- [ ] QrScanner: debounce 1500ms, lock sesión, torch, entrada manual
- [ ] Flujos: `BNF:{serial}` → transacción + `Historial("canje")`; `APP:{dni}:{nonce}` → `Historial("acumulacion")`
- [ ] Seeds `SCRIPTS/seedBeneficioDemo.js` (idempotente: `SER-0001..`)
- [ ] Clientes: alta/búsqueda/lista en vivo
- [ ] E2E device con `npx expo start --dev-client`

### M2 — Dual + Consola Admin + Ajustes
- [ ] Tarjeta in-app con QR dinámico (TTL)
- [ ] Consola Admin: Clientes, Beneficios (CRUD + emisiones/import/export), Sucursales, Historial, Ajustes (branding/mensajes/flags)
- [ ] Seeds mínimas Beneficios/Sucursales

### M3 — Growth + Anti-fraude + Offline + Analítica
- [ ] Referidos + recompensas
- [ ] Límite semanal / cooldown / serial asignado a DNI / anti multi‑cuenta (alerta)
- [ ] Dashboard + export CSV, NPS pos-consumo
- [ ] Offline queue (canje) + reconciliación
- [ ] Automations (scaffold), MIGRATIONS + script

## Comandos útiles
```bash
npm ci
npx expo-doctor
npx expo start --dev-client
node scripts/seedBeneficioDemo.js
node scripts/context-scan.js
```
- [ ] `babel.config.js` con `react-native-reanimated/plugin` al final
- [ ] `app.config.ts` única fuente de config (sin `app.json`)
- [ ] Seed `scripts/seedBeneficioDemo.js` idempotente (SER-0001..SER-0020)

## Checklist M1 — Base + Roles + E2E
- [ ] Auth anónima o Email/Password (SDK modular)
- [ ] Escáner QR (expo-camera) con debounce/linterna/entrada manual
- [ ] Transacción canje `BNF:{serial}` + `Historial`
- [ ] Acumulación `APP:{dni}:{nonce}` + `Historial`
- [ ] CRM básico por DNI (único) con `onSnapshot`
- [ ] Seeds y docs actualizados

## Checklist M2 — Dual + Consola Admin + Ajustes
- [ ] QR dinámico in-app (`APP:{dni}:{nonce}` TTL)
- [ ] Consola Admin (CRUD, emisión masiva, CSV/PDF, campañas, sucursales)
- [ ] Seeds extra (Beneficios, Sucursales)
- [ ] Ajustes runtime (debounce, cooldown, límites, radio, mantenimiento)

## Checklist M3 — Growth
- [ ] Referidos (códigos únicos)
- [ ] Anti-fraude (límites/semana, cooldown, asignación serial)
- [ ] Analítica/dashboard + export CSV + NPS
- [ ] Offline queue
- [ ] Automations + migración `migrate_codigos_a_seriales.js`
- [ ] ESLint/Prettier/Jest/i18n/A11y
>>>>>>> origin/main
