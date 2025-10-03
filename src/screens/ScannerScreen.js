import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import Scanner from '../components/BarcodeScanner/Scanner';

export default function ScannerScreen({ navigation }) {
  const [last, setLast] = useState(null);

  const handleBarcode = (payload) => {
    setLast(payload);
    // Aquí puedes guardar en Firestore si quieres
    // saveScan(payload)...
    Alert.alert('Leído', payload?.data ?? '(sin datos)');
  };

  return (
    <View style={{ flex: 1 }}>
      <Scanner
        onClose={() => navigation?.goBack?.() || null}
        onBarcode={handleBarcode}
      />
      {last ? (
        <View style={{ padding: 12, backgroundColor: '#fff' }}>
          <Text style={{ fontWeight: '700' }}>Última lectura:</Text>
          <Text numberOfLines={1}>{last.data}</Text>
        </View>
      ) : null}
    </View>
  );
}
