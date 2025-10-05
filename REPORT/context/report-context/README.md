## Recolección de Información del Proyecto Pergamino App

Este directorio contiene información recolectada automáticamente sobre la estructura y configuración del proyecto Pergamino App, incluyendo:

- Información de Git (remotes, status, branches, commits recientes)
- Estructura de archivos
- Versiones de Node.js y NPM
- Configuración de paquetes
- Presencia de archivos sensibles
- Datos sobre el monorepo (si existe)

### Contenido del Directorio

- `git_remotes.txt`: Información de los repositorios remotos
- `git_status.txt`: Estado actual del repositorio
- `git_branches.txt`: Lista de ramas
- `git_log_last60.txt`: Últimos 60 commits
- `top60_bigfiles.txt`: 60 archivos más grandes del proyecto
- `suspects_backup_like.txt`: Archivos que podrían ser backups o temporales
- `root_listing.txt`: Listado de archivos en el directorio raíz
- `signals_sensitive_names_only.txt`: Nombres de archivos potencialmente sensibles

### Información de Monorepo

Si se detecta una estructura de monorepo, se incluye:

- `node_version_mobile.txt`: Versión de Node.js en la app móvil
- `npm_version_mobile.txt`: Versión de NPM en la app móvil
- `package_mobile.json`: Contenido del package.json de la app móvil
- `node_version_web.txt`: Versión de Node.js en la app web
- `npm_version_web.txt`: Versión de NPM en la app web
- `package_web.json`: Contenido del package.json de la app web

### Tablas de Seguimiento

Esta información es útil para entender la implementación del módulo de tablas de seguimiento y su estado actual.