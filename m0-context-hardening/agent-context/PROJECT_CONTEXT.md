# Snapshot de Contexto del Proyecto

Este archivo es generado automáticamente por el script `SCRIPTS/context-scan.js` y documenta el estado
real del repositorio en el momento en el que se ejecuta el análisis.  Incluye información
acerca de ramas, pull requests, archivos clave presentes/faltantes, dependencias críticas,
reglas e índices de Firestore, componentes de escáner y referencias a los payloads de códigos QR.

Ejecuta el siguiente comando desde la raíz del proyecto para generar o actualizar este
informe:

```bash
node SCRIPTS/context-scan.js
```

El script leerá el contenido del repositorio local, evaluará la conformidad con las
políticas definidas en `DECISIONES.md` y en el MegaPrompt y escribirá en este archivo
un resumen estructurado del contexto.  Si necesitas personalizar el análisis (por
ejemplo, para incluir reglas adicionales) puedes modificar `context-scan.js` según tus
necesidades.