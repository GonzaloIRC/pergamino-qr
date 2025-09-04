# Descripción
<!-- Qué incluye este PR -->

## Checklist M0 — Security Hardening
- [ ] Reglas Firestore sin `allow true`; requieren auth
- [ ] Índices compuestos `Historial` / `BeneficioSeriales`
- [ ] `src/services/firebase/app.js` solo `EXPO_PUBLIC_*` + emuladores opcionales
- [ ] `.env.example` normalizado con flags runtime
- [ ] README actualizado (Expo Dev Client; **solo** `expo-camera`)
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
