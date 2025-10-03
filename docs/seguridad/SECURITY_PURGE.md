# Instrucciones para Purgar Archivos Sensibles

Se han encontrado archivos sensibles en el historial del repositorio. Para proteger las credenciales y secretos, es necesario purgar completamente estos archivos del historial de Git.

## Archivos detectados

- `.env` - Archivo de variables de entorno con posibles credenciales
- `gpt-context/tools/serviceAccount.json` - Archivo de credenciales de servicio de Google

## Instrucciones para la purga

### Opción 1: Usando git-filter-repo (recomendado)

1. Instalar git-filter-repo:
   ```bash
   pip install git-filter-repo
   ```

2. Clonar un repositorio fresco:
   ```bash
   git clone https://github.com/GonzaloIRC/pergamino-qr.git pergamino-clean
   cd pergamino-clean
   ```

3. Ejecutar el filtrado:
   ```bash
   git filter-repo --path .env --invert-paths --force
   git filter-repo --path gpt-context/tools/serviceAccount.json --invert-paths --force
   ```

4. Forzar la subida de los cambios:
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

### Opción 2: Usando git filter-branch

Si git-filter-repo no está disponible:

1. Abrir Git Bash (no PowerShell o CMD)
2. Ejecutar el siguiente comando:
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env gpt-context/tools/serviceAccount.json' --prune-empty --tag-name-filter cat -- --all
   ```

3. Forzar la subida de los cambios:
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

## Pasos posteriores a la purga

1. Todos los colaboradores deben clonar el repositorio nuevamente:
   ```bash
   git clone https://github.com/GonzaloIRC/pergamino-qr.git
   ```

2. Si alguien tiene cambios locales no enviados:
   ```bash
   # En su copia local anterior
   git checkout -b mis-cambios-pendientes
   git commit -am "Mis cambios pendientes"
   
   # Después de clonar el nuevo repositorio
   cd nuevo-clon-pergamino
   git checkout -b mis-cambios-pendientes
   git pull ../copia-anterior mis-cambios-pendientes --allow-unrelated-histories
   ```

## Prevención de futuras filtraciones

1. Se ha actualizado el archivo `.gitignore` para excluir archivos sensibles
2. Considere usar herramientas como git-secrets para prevenir commits con información sensible
3. Rote todas las credenciales que pudieron haber sido expuestas

## Importante

Si las credenciales fueron expuestas, **deben ser rotadas inmediatamente**, incluso si se purgan del historial de Git, ya que podrían haber sido vistas o copiadas.
