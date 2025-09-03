import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import Scanner from '../components/BarcodeScanner/Scanner';

export default function WaiterDashboard() {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ flex:1 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Mesero</Text>
      <Button title="Abrir escáner" onPress={() => setOpen(true)} />
      {open ? (
        <View style={{ flex: 1 }}>
          <Scanner
            onClose={() => setOpen(false)}
            onBarcode={(payload) => {
              setOpen(false);
              Alert.alert('Lectura', JSON.stringify(payload));
              // TODO: guardar visita/puntos
            }}
          />
        </View>
      ) : (
        <View style={{ padding:16, gap:12 }}>
          <Text style={{ fontSize:18, fontWeight:'700' }}>Mesero</Text>
          <Button title="Abrir escáner" onPress={() => setOpen(true)} />
        </View>
      )}
    </View>
  );
}
