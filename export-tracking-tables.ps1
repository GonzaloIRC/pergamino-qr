# Script para exportar datos de tablas de seguimiento a CSV
# Este script utiliza caracteres ASCII para evitar problemas de codificación

# Colores para mensajes
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Red = [System.ConsoleColor]::Red
$Cyan = [System.ConsoleColor]::Cyan

# Función para mostrar mensajes
function Write-ColorMessage {
    param(
        [string] $Message,
        [System.ConsoleColor] $Color = [System.ConsoleColor]::White
    )
    Write-Host $Message -ForegroundColor $Color
}

# Función para mostrar título
function Write-Title {
    param(
        [string] $Title
    )
    Write-ColorMessage "" 
    Write-ColorMessage "----------------------------------------" $Cyan
    Write-ColorMessage " $Title " $Cyan
    Write-ColorMessage "----------------------------------------" $Cyan
}

# Cabecera
Write-Title "PERGAMINO APP - EXPORTACIÓN DE TABLAS DE SEGUIMIENTO"
Write-ColorMessage ""

# Verificar Node.js
Write-ColorMessage "Verificando Node.js..." $Yellow
try {
    $nodeVersion = node --version
    Write-ColorMessage "[OK] Node.js instalado: $nodeVersion" $Green
} catch {
    Write-ColorMessage "[X] Error: Node.js no está instalado o no está en el PATH." $Red
    Write-ColorMessage "Por favor, instala Node.js desde https://nodejs.org/" $Red
    exit 1
}

# Crear carpeta de exportación si no existe
$exportFolder = ".\exports"
if (-not (Test-Path $exportFolder)) {
    New-Item -Path $exportFolder -ItemType Directory | Out-Null
    Write-ColorMessage "[OK] Carpeta de exportación creada: $exportFolder" $Green
} else {
    Write-ColorMessage "[OK] Carpeta de exportación encontrada: $exportFolder" $Green
}

# Verificar script de exportación
$exportScript = ".\export-tracking-tables.js"
if (-not (Test-Path $exportScript)) {
    Write-ColorMessage "[!] Advertencia: No se encontró el script de exportación." $Yellow
    Write-ColorMessage "    Creando script básico de exportación..." $Yellow
    
    # Crear script básico de exportación
    @"
// Script para exportar tablas de seguimiento a CSV
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "./firebase/firebaseConfig";
import fs from 'fs';
import path from 'path';

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para convertir datos a CSV
const convertToCSV = (data) => {
    // Obtener todas las claves posibles
    const allKeys = new Set();
    data.forEach(item => {
        Object.keys(item).forEach(key => allKeys.add(key));
    });
    
    // Convertir Set a Array y ordenar
    const headers = Array.from(allKeys).sort();
    
    // Crear la fila de encabezados
    let csvContent = headers.join(',') + '\\n';
    
    // Agregar cada fila
    data.forEach(item => {
        const row = headers.map(key => {
            const value = item[key];
            
            // Manejar diferentes tipos de datos
            if (value === undefined || value === null) {
                return '';
            } else if (typeof value === 'object') {
                if (value.toDate) {
                    // Es un timestamp
                    return value.toDate().toISOString();
                } else {
                    // Es otro tipo de objeto, convertir a JSON
                    return JSON.stringify(value).replace(/"/g, '""');
                }
            } else if (typeof value === 'string') {
                // Escapar comillas y encerrar en comillas si contiene coma
                const escaped = value.replace(/"/g, '""');
                return escaped.includes(',') ? `"${escaped}"` : escaped;
            } else {
                // Números, booleanos, etc.
                return String(value);
            }
        });
        
        csvContent += row.join(',') + '\\n';
    });
    
    return csvContent;
};

// Exportar tablas de seguimiento
const exportTrackingTables = async () => {
    try {
        // Obtener la lista de tablas de seguimiento
        const tablesCollection = collection(db, "trackingTables");
        const tablesSnapshot = await getDocs(tablesCollection);
        
        if (tablesSnapshot.empty) {
            console.log("No se encontraron tablas de seguimiento.");
            return;
        }
        
        // Crear carpeta de exportación si no existe
        const exportFolder = path.join(process.cwd(), 'exports');
        if (!fs.existsSync(exportFolder)) {
            fs.mkdirSync(exportFolder);
        }
        
        // Fecha actual para el nombre de archivo
        const dateStr = new Date().toISOString().replace(/:/g, '-').split('.')[0];
        
        // Exportar cada tabla
        const tables = [];
        for (const tableDoc of tablesSnapshot.docs) {
            const tableData = tableDoc.data();
            tables.push(tableData);
            
            // Obtener los registros de esta tabla
            const recordsCollection = collection(db, `tracking_${tableData.id}`);
            const recordsSnapshot = await getDocs(recordsCollection);
            
            if (!recordsSnapshot.empty) {
                // Convertir a array de objetos
                const records = recordsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // Convertir a CSV
                const csvContent = convertToCSV(records);
                
                // Guardar archivo CSV
                const fileName = `${tableData.id}_${dateStr}.csv`;
                const filePath = path.join(exportFolder, fileName);
                fs.writeFileSync(filePath, csvContent);
                
                console.log(`Tabla ${tableData.name} exportada a ${fileName}`);
            } else {
                console.log(`Tabla ${tableData.name} no tiene registros para exportar.`);
            }
        }
        
        // Crear un resumen de las tablas
        const tablesCSV = convertToCSV(tables);
        const tablesFilePath = path.join(exportFolder, `tables_summary_${dateStr}.csv`);
        fs.writeFileSync(tablesFilePath, tablesCSV);
        
        console.log("Exportación completada exitosamente.");
        
    } catch (error) {
        console.error("Error exportando tablas:", error);
    }
};

// Ejecutar la exportación
exportTrackingTables()
    .then(() => console.log("Proceso de exportación finalizado"))
    .catch(error => console.error("Error en el proceso de exportación:", error));
"@ | Out-File -FilePath $exportScript -Encoding UTF8
    
    Write-ColorMessage "[OK] Script de exportación creado: $exportScript" $Green
} else {
    Write-ColorMessage "[OK] Script de exportación encontrado: $exportScript" $Green
}

# Ejecutar la exportación
Write-Title "INICIAR EXPORTACIÓN"
Write-ColorMessage "Deseas exportar todas las tablas de seguimiento? (s/n)" $Yellow
$response = Read-Host

if ($response -eq 's' -or $response -eq 'S') {
    Write-ColorMessage "Exportando tablas de seguimiento..." $Yellow
    try {
        npx babel-node $exportScript
        Write-ColorMessage "[OK] Exportación completada. Verifica la carpeta $exportFolder" $Green
    } catch {
        Write-ColorMessage "[X] Error durante la exportación: $_" $Red
    }
} else {
    Write-ColorMessage "Exportación cancelada por el usuario." $Yellow
}

# Mensaje final
Write-Title "PROCESO COMPLETADO"
Write-ColorMessage ""
Write-ColorMessage "Tablas exportadas en formato CSV:" $Yellow
Write-ColorMessage "Ubicación: $exportFolder" $Yellow
Write-ColorMessage ""
Write-ColorMessage "Para más información sobre el módulo de tablas de seguimiento, consulta:" $Yellow
Write-ColorMessage "./docs/TRACKING_TABLE_MODULE.md" $Yellow
Write-ColorMessage ""