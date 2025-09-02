// src/mesero/RegistrarConsumo.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { db } from '../services/firebaseClient';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const RegistrarConsumo = ({ navigation, route }) => {
  const { cliente, clienteId } = route.params || {};
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: '',
    cantidad: '1'
  });
  const [loading, setLoading] = useState(false);

  // Lista de productos predefinidos (esto podría venir de Firebase)
  const productosMenu = [
    { nombre: 'Café Americano', precio: 8000 },
    { nombre: 'Café con Leche', precio: 9000 },
    { nombre: 'Cappuccino', precio: 10000 },
    { nombre: 'Latte', precio: 11000 },
    { nombre: 'Croissant', precio: 6000 },
    { nombre: 'Tostada', precio: 5000 },
    { nombre: 'Sandwich', precio: 12000 },
    { nombre: 'Ensalada', precio: 15000 },
  ];

  const agregarProducto = (producto = null) => {
    let productoAAgregar;
    
    if (producto) {
      // Producto del menú
      productoAAgregar = {
        ...producto,
        cantidad: 1,
        id: Date.now()
      };
    } else {
      // Producto personalizado
      if (!nuevoProducto.nombre.trim() || !nuevoProducto.precio) {
        Alert.alert('Error', 'Completa el nombre y precio del producto');
        return;
      }
      
      productoAAgregar = {
        nombre: nuevoProducto.nombre,
        precio: parseFloat(nuevoProducto.precio),
        cantidad: parseInt(nuevoProducto.cantidad) || 1,
        id: Date.now()
      };
      
      setNuevoProducto({ nombre: '', precio: '', cantidad: '1' });
    }
    
    setProductos(prev => [...prev, productoAAgregar]);
  };

  const eliminarProducto = (id) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  const calcularTotal = () => {
    return productos.reduce((total, producto) => {
      return total + (producto.precio * producto.cantidad);
    }, 0);
  };

  const calcularPuntos = (total) => {
    // 1 punto por cada $1000 gastados
    return Math.floor(total / 1000);
  };

  const registrarConsumo = async () => {
    if (productos.length === 0) {
      Alert.alert('Error', 'Agrega al menos un producto');
      return;
    }

    setLoading(true);
    try {
      const total = calcularTotal();
      const puntosGanados = calcularPuntos(total);

      // Registrar el consumo
      const consumoData = {
        clienteId: clienteId || cliente.id,
        clienteNombre: cliente.nombre,
        clienteDni: cliente.dni,
        productos: productos,
        total: total,
        puntosGanados: puntosGanados,
        fecha: serverTimestamp(),
        mesero: 'Mesero Actual' // Aquí podrías agregar el nombre del mesero logueado
      };

      await addDoc(collection(db, 'consumos'), consumoData);

      // Actualizar puntos del cliente
      const nuevosPuntos = (cliente.puntos || 0) + puntosGanados;
      await updateDoc(doc(db, 'clientes', clienteId || cliente.id), {
        puntos: nuevosPuntos
      });

      // Registrar movimiento de tipo 'consumo'
      const { collection, addDoc, serverTimestamp } = require('firebase/firestore');
      const movimientosRef = collection(db, 'clientes', clienteId || cliente.id, 'movimientos');
      await addDoc(movimientosRef, {
        tipo: 'consumo',
        descripcion: `Cliente realizó un consumo. Total: $${total}, Puntos ganados: ${puntosGanados}`,
        monto: total,
        puntosGanados: puntosGanados,
        fecha: serverTimestamp(),
      });

      Alert.alert(
        'Consumo Registrado',
        `Total: $${total.toLocaleString()}\nPuntos ganados: ${puntosGanados}\nPuntos totales: ${nuevosPuntos}`,
        [
          {
            text: 'Continuar',
            onPress: () => navigation.navigate('Inicio')
          }
        ]
      );
    } catch (error) {
      console.error('Error al registrar consumo:', error);
      Alert.alert('Error', 'No se pudo registrar el consumo. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const renderProductoMenu = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => agregarProducto(item)}
    >
      <Text style={styles.menuItemNombre}>{item.nombre}</Text>
      <Text style={styles.menuItemPrecio}>${item.precio.toLocaleString()}</Text>
    </TouchableOpacity>
  );

  const renderProductoSeleccionado = ({ item }) => (
    <View style={styles.productoSeleccionado}>
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre}>{item.nombre}</Text>
        <Text style={styles.productoPrecio}>
          ${item.precio.toLocaleString()} x {item.cantidad}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.eliminarButton}
        onPress={() => eliminarProducto(item.id)}
      >
        <Text style={styles.eliminarText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registrar Consumo</Text>
        <Text style={styles.subtitle}>
          Cliente: {cliente?.nombre} - DNI: {cliente?.dni}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Menú Rápido</Text>
        <FlatList
          data={productosMenu}
          renderItem={renderProductoMenu}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.menuList}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Producto Personalizado</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre del producto"
          value={nuevoProducto.nombre}
          onChangeText={(text) => setNuevoProducto(prev => ({ ...prev, nombre: text }))}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.inputSmall]}
            placeholder="Precio"
            value={nuevoProducto.precio}
            onChangeText={(text) => setNuevoProducto(prev => ({ ...prev, precio: text }))}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.inputSmall]}
            placeholder="Cantidad"
            value={nuevoProducto.cantidad}
            onChangeText={(text) => setNuevoProducto(prev => ({ ...prev, cantidad: text }))}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => agregarProducto()}
        >
          <Text style={styles.addButtonText}>Agregar Producto</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productos Seleccionados</Text>
        {productos.length > 0 ? (
          <FlatList
            data={productos}
            renderItem={renderProductoSeleccionado}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noProductos}>No hay productos seleccionados</Text>
        )}
      </View>

      {productos.length > 0 && (
        <View style={styles.totalSection}>
          <Text style={styles.totalText}>
            Total: ${calcularTotal().toLocaleString()}
          </Text>
          <Text style={styles.puntosText}>
            Puntos a ganar: {calcularPuntos(calcularTotal())}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.registerButton, loading && styles.buttonDisabled]}
          onPress={registrarConsumo}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Registrando...' : 'Registrar Consumo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#8B4513',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  menuList: {
    flexGrow: 0,
  },
  menuItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  menuItemNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuItemPrecio: {
    fontSize: 12,
    color: '#8B4513',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputSmall: {
    flex: 0.45,
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  productoSeleccionado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 5,
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productoPrecio: {
    fontSize: 14,
    color: '#666',
  },
  eliminarButton: {
    backgroundColor: '#dc3545',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eliminarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noProductos: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  totalSection: {
    margin: 15,
    padding: 15,
    backgroundColor: '#8B4513',
    borderRadius: 10,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  puntosText: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  buttonContainer: {
    padding: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  registerButton: {
    backgroundColor: '#007AFF',
  },
  backButton: {
    backgroundColor: '#666',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegistrarConsumo;
