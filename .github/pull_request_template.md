
## Descripción
<!-- ¿Qué problema resuelve este PR? Resumen corto de cambios. -->

## Checklist general
- [ ] Sin secretos en repo (`.env`, service accounts, keys)
- [ ] `babel.config.js` con reanimated **al final**
- [ ] `app.config.ts` único (sin duplicar `app.json`)
- [ ] `firestore.rules` y `firestore.indexes.json` actualizados
- [ ] `README`/`CHANGELOG` y `AGENT_AUDIT` actualizados

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
node SCRIPTS/seedBeneficioDemo.js
node SCRIPTS/context-scan.js
```
