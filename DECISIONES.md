# DECISIONES – Pergamino App (actualizado 2025-09-02)

> **Política Operativa (persistente)**
> - Usar el **modo Agente ≤ 5 corridas** (ideal **3**): Fase 1 (base), Fase 2 (dual + marketing), Fase 3 (pro).  
> - Antes de cambiar código: **Auditoría rápida** (matriz de versiones, `expo doctor`, verificar `expo-camera` y ausencia de `expo-barcode-scanner`/`*-interface`).  
> - **Gates E2E**: seed de datos, flujos de escaneo/registro/canje, pruebas manuales guiadas.  
> - **Sin secretos** en repo (`EXPO_PUBLIC_*`, `.env`).  
> - Si hay conflicto con la maqueta previa/VS, **sobrescribir con la solución más estable** y documentar.

---

## A. Arquitectura y entorno
1. **Expo SDK**: Mantener **53 (Managed)** como base **confirmado**. Solo actualizaremos si **amerita** por estabilidad/seguridad.  
2. **Escáner**: **expo-camera** como opción **recomendada**. Si no fuese viable, se cambiará por la **alternativa más apta**.  
3. **Gestor de paquetes**: **npm** por defecto (compatible con Expo 53). *Reevaluar si un requerimiento exige otro gestor.*  
4. **Matriz Android/Build** (**aceptado**): **compile/target 35**, **minSdk 24**, **Gradle 8.13**, **AGP 8.8.2**, **Kotlin 2.0.21**, **JDK 21 (jbr)**.  
   - Mantener fijas para evitar errores de compilación; se revisan en cada Fase.  
5. **`index.js` mínimo** con `registerRootComponent(App)` (**aceptado**). Mantener sin lógica extra.  
6. **Prebuild limpio** solo si se añaden librerías nativas nuevas (**aceptado**).  
7. **CI GitHub Actions** (**aceptado**): Node 20, `npm ci`, lint/test y `expo doctor` en cada PR.

> **Eject Gate** (solo si es imprescindible salir de Managed): requisito nativo sin plugin viable (p. ej., Smart Tap/SDK POS), alternativa JS no posible, POC validada.

## B. Modelo de tarjeta (dual)
8. **Dual**: **Wallet (Apple/Google)** + **tarjeta in‑app** (**sí**).  
9. **Add to Wallet (scaffolding)** (**sí**): guardar `passId` en `Clientes` (sin proveedor aún).  
10. **Tarjeta in‑app con QR dinámico** (dni+nonce, expira 60–120 s) (**sí**).  
11. **Actualización del pase Wallet** tras transacción (**sí**). **Proveedor**: _“en construcción / próximamente”_. Usar gratuito si existe.

## C. Flujos de mesero
12. **Home → Escanear** listo (cámara on-ready) (**sí**).  
13. **Ficha cliente**: puntos, beneficios, movimientos (**sí**).  
14. **Acumular** consumo: sumar puntos/visitas (**sí**).  
15. **Canjear** beneficio: confirmar + escribir **Historial** (**sí**).  
16. **Búsqueda manual (fallback)** (**sí**): barra para DNI/email/código cuando el QR no esté disponible.

## D. Un‑solo‑uso y seguridad de canje
17. Marcar `usado=true` en **codigos** al primer canje (**sí**).  
18. Bloquear reuso y alertar “Código ya utilizado” (**sí**).  
19. **Historial** con logs (usuario, timestamp, sucursal) (**sí**).

## E. Clientes/CRM
20. **Clientes** con **DNI como ID**; campos: nombre, email, teléfono, puntos, walletActivo, fechaRegistro (**sí**).  
21. **RegisterClient** con validación de **DNI único** (**sí**).  
22. **Búsqueda por DNI** y **lista en vivo (`onSnapshot`)** (**sí**).

## F. Campañas/Beneficios
23. **Beneficios**: título, costo puntos, vigencia, sucursal/reglas simples (**sí**).  
24. **Bonos** automáticos: bienvenida, cumpleaños, win‑back (7–30 días) (**sí**).  
25. **Menú oculto / perks exclusivos** por gasto en 90 días (**sí**).  
26. **Referidos**: código y recompensa a referidor + referido (**sí**).

## G. Geolocalización y notificaciones
27. **Geo‑avisos**: radio **1.000 m** por sucursal (**sí**).  
28. **Push in‑app** + **avisos Wallet** (cuando aplique) (**sí**).  
29. Guardar **coords/geohash** en **Sucursales** y trazar eventos en Historial (**sí**).

## H. Anti‑fraude y límites (parámetros iniciales)
30. **Límite por beneficio/usuario** (**sí**) → **3 por semana** _(ajustable)_.  
31. **Cooldown** entre canjes (**sí**) → **10 minutos** _(ajustable)_.  
32. **Detección multi‑cuentas** (**sí**) → señales: teléfono/email repetidos; bloqueo temporal y alerta admin.

## I. Analítica y reportes
33. **Dashboard** (visitas, ARPU, frecuencia, canjes; export CSV) (**sí**).  
34. **Objetivo**: acercar métricas a **+53% gasto** / **+40% visitas** (benchmark de lealtad) (**sí**).  
35. **Feedback pos‑consumo** (NPS privado desde recibo) (**sí**).

## J. Integraciones
36. **POS**: fase inicial manual/CSV (**sí**).  
37. **Reservas/CRM externo** (futuro) (**sí**).

## K. Legal y datos
38. Claves reales fuera del repo (`.env`, `EXPO_PUBLIC_*`) (**sí**).  
39. **Reglas Firestore mínimas** (auth para writes, sin exponer datos sensibles) (**sí**).  
40. **Privacidad/Términos** visibles en la app (**sí**).

## L. Operación y soporte
41. **Checklist de tienda** (iconos, permisos, privacy, QA) (**sí**).  
42. **Procedimiento de rollback** si un PR rompe algo (**sí**).  
43. **Backups periódicos** (export Firestore/Storage) (**sí**).

---

## Feature flags y parámetros
- `wallet.enabled = false` (scaffolding listo; proveedor “próximamente”).  
- **QR dinámico**: nonce válido **90 s** (rango 60–120 s).  
- **Límites**: 3 canjes/semana/beneficio; **cooldown 10 min**.  
- **Geo-avisos**: 1.000 m por sucursal (Pergamino / Andiamo).  
- **CI**: workflow básico activo en PRs.

## Plan de corridas del Agente (≤ 5; ideal 3)
1. **Fase 1 (base)**: compat Expo 53; **QrScanner** (un‑solo‑uso + Historial); **RegisterClient** (DNI único); **RoleBasedNavigator + PIN 1234**; **seed**; **README + CHANGELOG**; **PR**.  
2. **Fase 2 (dual + marketing)**: Tarjeta in‑app (QR dinámico); **Wallet scaffolding** (flag apagado); **Geo‑avisos**; **Beneficios/Bonos** MVP.  
3. **Fase 3 (pro)**: **Referidos**; **Anti‑fraude** (límites+cooldown); **Analítica** (dashboard + CSV); **Feedback** pos‑consumo.  
4–5. **Contingencia**: hardening o integración Wallet/POS si es imprescindible.
