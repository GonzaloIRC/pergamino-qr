#!/bin/bash
# Script para preparar la sincronización segura con GitHub
# Guarda archivos sensibles y luego los restaura después de sincronizar

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorio de backups
BACKUP_DIR="__backups__/secure"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Función para respaldar archivos sensibles
backup_sensitive_files() {
  echo -e "${YELLOW}Respaldando archivos sensibles...${NC}"
  
  # Lista de archivos sensibles a respaldar
  FILES_TO_BACKUP=(
    ".env"
    ".env.local"
    ".env.development"
    ".env.staging"
    ".env.production"
    "firebase/firebaseConfig.js"
    # Añade más archivos sensibles aquí
  )
  
  # Respaldar cada archivo si existe
  for file in "${FILES_TO_BACKUP[@]}"; do
    if [ -f "$file" ]; then
      cp "$file" "$BACKUP_DIR/$(basename $file).backup"
      echo -e "  ${GREEN}Respaldado:${NC} $file"
    fi
  done
}

# Función para restaurar archivos sensibles
restore_sensitive_files() {
  echo -e "${YELLOW}Restaurando archivos sensibles...${NC}"
  
  # Restaurar cada archivo respaldado
  for backup_file in "$BACKUP_DIR"/*.backup; do
    if [ -f "$backup_file" ]; then
      original_name=$(basename "$backup_file" .backup)
      original_path=$(echo "$backup_file" | sed "s|$BACKUP_DIR/||" | sed "s|\.backup$||")
      
      # Crear directorios si no existen
      mkdir -p $(dirname "$original_path")
      
      # Restaurar el archivo
      cp "$backup_file" "$original_path"
      echo -e "  ${GREEN}Restaurado:${NC} $original_path"
    fi
  done
}

# Basado en los argumentos, ejecutar la acción correspondiente
case "$1" in
  "backup")
    backup_sensitive_files
    ;;
  "restore")
    restore_sensitive_files
    ;;
  *)
    echo -e "${YELLOW}Uso:${NC}"
    echo -e "  $0 ${GREEN}backup${NC}   - Respalda archivos sensibles antes de sincronizar"
    echo -e "  $0 ${GREEN}restore${NC}  - Restaura archivos sensibles después de sincronizar"
    ;;
esac