#!/bin/bash
# Script para preparar el entorno de desarrollo después de clonar el repo
# Crea los archivos de configuración necesarios a partir de los ejemplos

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para crear archivos a partir de ejemplos
copy_example_to_real() {
  local example_file=$1
  local real_file=$2
  
  if [ -f "$example_file" ]; then
    if [ ! -f "$real_file" ]; then
      cp "$example_file" "$real_file"
      echo -e "  ${GREEN}Creado:${NC} $real_file"
      return 0
    else
      echo -e "  ${YELLOW}El archivo $real_file ya existe${NC}"
      return 1
    fi
  else
    echo -e "  ${RED}No se encontró el archivo de ejemplo:${NC} $example_file"
    return 1
  fi
}

echo -e "${YELLOW}Configurando entorno de desarrollo...${NC}"

# Configuración de archivos de entorno
ENV_FILES=(
  ".env.example:.env.local"
  ".env.example:.env.development"
  ".env.example:.env.staging"
)

for env_pair in "${ENV_FILES[@]}"; do
  IFS=':' read -r example real <<< "$env_pair"
  copy_example_to_real "$example" "$real"
done

# Configuración de Firebase
FIREBASE_DIR="firebase"
if [ -d "$FIREBASE_DIR" ]; then
  copy_example_to_real "$FIREBASE_DIR/firebaseConfig.example.js" "$FIREBASE_DIR/firebaseConfig.js"
fi

echo -e "\n${GREEN}Configuracion inicial completada!${NC}"
echo -e "\n${YELLOW}IMPORTANTE:${NC} Recuerda editar los archivos creados con tus credenciales reales."