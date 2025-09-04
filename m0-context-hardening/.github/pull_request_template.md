<!--
  Plantilla de Pull Request para el proyecto Pergamino‑QR.
  Completa todas las secciones antes de solicitar revisión.  Los PRs deben
  crearse en orden (M0 → M1 → M2 → M3) y cada módulo requiere validar
  funcionalidades y seguridad en un dispositivo físico usando el cliente de
  desarrollo (no emulador, salvo que se indique).  El objetivo es mantener
  trazabilidad y minimizar errores en producción.
-->

### Resumen del Cambio

Describe brevemente qué problema resuelve este PR y en qué módulo se encuadra.

### Checklist General

- [ ] Ejecuté `npm ci` y `npx expo-doctor` y no hay errores críticos.
- [ ] No se introducen secretos ni claves en el repositorio.
- [ ] Se actualizó `AGENT_AUDIT.md` y, si aplica, `PROJECT_CONTEXT.md`.
- [ ] Se añadieron/actualizaron los scripts de semillas y se probaron correctamente.
- [ ] Las reglas e índices de Firestore están actualizados y se cargaron en emuladores.
- [ ] Todas las variables de entorno requeridas se documentan en `.env.example`.
- [ ] El PR incluye notas de riesgo y mitigaciones si corresponde.

### Checklist por Módulo

#### M0 — Security Hardening
- [ ] Se corrigieron las reglas de Firestore para restringir el acceso a usuarios autenticados.
- [ ] Se añadieron los índices obligatorios (`Historial`, `BeneficioSeriales`).
- [ ] Se eliminó cualquier credencial embebida y se refactorizó la inicialización de Firebase.
- [ ] Se creó/actualizó `.env.example` con todas las variables necesarias.

#### M1 — Base + Roles + E2E
- [ ] Autenticación mínima implementada (Email/Password o Anonymous).
- [ ] Escáner QR usa `expo-camera` con debounce y bloqueo de sesión.
- [ ] Transacciones de canje de seriales y acumulación registran en `Historial`.
- [ ] Alta y búsqueda de clientes por DNI funcionan en tiempo real.
- [ ] Seeds ejecutadas (`seedBeneficioDemo.js`) y verificación en Firestore de seriales activos.
- [ ] Diseño base y pantalla de bienvenida implementados según la paleta Pergamino.
- [ ] E2E probadas en dispositivo físico; se escaneó `BNF:SER-0001` y `APP:{dni}:{nonce}`.

#### M2 — Dual + Consola Admin + Ajustes
- [ ] Tarjeta in‑app con QR dinámico y TTL configurado.
- [ ] Consola Admin con CRUD de clientes, beneficios, sucursales y ajustes.
- [ ] Generación/importación/exportación de seriales (CSV y PDF si aplica).
- [ ] Seeds de beneficios y sucursales ejecutadas.
- [ ] E2E probadas en dispositivo físico; se verificó auto‑lock y actualización de mensajes.

#### M3 — Growth + Anti‑Fraude + Analítica
- [ ] Implementación de referidos y recompensa asociada.
- [ ] Límites semanales y cooldown de canjes con detección de multi‑cuentas.
- [ ] Dashboard de analítica con exportación CSV; NPS post‑consumo.
- [ ] Cola offline de canje y reconciliación sin duplicados.
- [ ] Scripts de migración (`migrate_codigos_a_seriales.js`) y automations implementados.
- [ ] E2E probadas en dispositivo físico; se valida referidos, límites y reintentos offline.

### Evidencia de Pruebas

Adjunta capturas de pantalla o describe los pasos de prueba manual que realizaste.  Incluye cualquier salida relevante de la consola.

### Riesgos y Mitigaciones

Enumera cualquier riesgo introducido por este cambio y cómo se mitigará.

### Notas Adicionales

Incluye cualquier contexto adicional o dependencia con otros PRs.