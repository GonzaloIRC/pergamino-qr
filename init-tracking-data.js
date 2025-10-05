// Script para crear datos de prueba para tablas de seguimiento
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, addDoc, Timestamp } from "firebase/firestore";
import { firebaseConfig } from "./firebase/firebaseConfig";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Crear una tabla de seguimiento de ejemplo
const createTrackingTable = async () => {
    try {
        // Tabla de seguimiento de inventario
        const inventoryTableId = "inventario";
        await setDoc(doc(db, "trackingTables", inventoryTableId), {
            id: inventoryTableId,
            name: "Inventario",
            createdAt: Timestamp.now(),
            createdBy: "admin",
            columns: [
                { field: "producto", label: "Producto", type: "text", required: true },
                { field: "cantidad", label: "Cantidad", type: "number", required: true },
                { field: "precio", label: "Precio Unitario", type: "number", required: true },
                { field: "categoria", label: "Categoría", type: "text" },
                { field: "disponible", label: "Disponible", type: "boolean" }
            ],
            systemColumns: [
                { field: "createdAt", label: "Fecha de creación", type: "timestamp" },
                { field: "updatedAt", label: "Última actualización", type: "timestamp" },
                { field: "createdBy", label: "Creado por", type: "user" }
            ]
        });
        console.log(`Tabla de inventario creada: ${inventoryTableId}`);

        // Tabla de seguimiento de visitas
        const visitsTableId = "visitas";
        await setDoc(doc(db, "trackingTables", visitsTableId), {
            id: visitsTableId,
            name: "Registro de Visitas",
            createdAt: Timestamp.now(),
            createdBy: "admin",
            columns: [
                { field: "nombre", label: "Nombre", type: "text", required: true },
                { field: "motivo", label: "Motivo", type: "text", required: true },
                { field: "area", label: "Área", type: "text" },
                { field: "autorizado", label: "Autorizado", type: "boolean" }
            ],
            systemColumns: [
                { field: "createdAt", label: "Fecha de entrada", type: "timestamp" },
                { field: "updatedAt", label: "Fecha de salida", type: "timestamp" },
                { field: "createdBy", label: "Registrado por", type: "user" }
            ]
        });
        console.log(`Tabla de visitas creada: ${visitsTableId}`);

        // Agregar algunos datos de ejemplo a la tabla de inventario
        const inventoryItems = [
            {
                producto: "Café Pergamino",
                cantidad: 150,
                precio: 25000,
                categoria: "Grano",
                disponible: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                createdBy: "admin"
            },
            {
                producto: "Café Tostado",
                cantidad: 75,
                precio: 38000,
                categoria: "Procesado",
                disponible: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                createdBy: "admin"
            },
            {
                producto: "Café Verde",
                cantidad: 200,
                precio: 20000,
                categoria: "Grano",
                disponible: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                createdBy: "admin"
            }
        ];

        const inventoryCollection = collection(db, `tracking_${inventoryTableId}`);
        for (const item of inventoryItems) {
            await addDoc(inventoryCollection, item);
        }
        console.log(`${inventoryItems.length} productos de inventario agregados`);

        // Agregar algunos datos de ejemplo a la tabla de visitas
        const visitsItems = [
            {
                nombre: "Juan Pérez",
                motivo: "Entrega de insumos",
                area: "Almacén",
                autorizado: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                createdBy: "admin"
            },
            {
                nombre: "María Gómez",
                motivo: "Inspección de calidad",
                area: "Producción",
                autorizado: true,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                createdBy: "admin"
            },
            {
                nombre: "Carlos Rodríguez",
                motivo: "Mantenimiento",
                area: "Máquinas",
                autorizado: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                createdBy: "admin"
            }
        ];

        const visitsCollection = collection(db, `tracking_${visitsTableId}`);
        for (const item of visitsItems) {
            await addDoc(visitsCollection, item);
        }
        console.log(`${visitsItems.length} registros de visitas agregados`);

        console.log("Datos de prueba creados exitosamente");

    } catch (error) {
        console.error("Error creando datos de prueba:", error);
    }
};

// Ejecutar el script
createTrackingTable()
    .then(() => console.log("Script completado"))
    .catch(error => console.error("Error en script:", error));