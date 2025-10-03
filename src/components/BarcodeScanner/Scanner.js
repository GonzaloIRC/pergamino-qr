import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function Scanner({ onClose, onBarcode }) {
  const [permission, requestPermission] = useCameraPermissions();
  const lastReadRef = useRef(0);
  const [enabled, setEnabled] = useState(true);

  if (!permission || !permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Permiso de cámara</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Conceder permiso</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose}>
          <Text>Cerrar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleScan = ({ data, type, cornerPoints, bounds }) => {
    const now = Date.now();
    if (!enabled || now - lastReadRef.current < 1200) return; // throttle ~1.2s
    lastReadRef.current = now;
    onBarcode?.({ data, type, cornerPoints, bounds, ts: new Date().toISOString(), device: 'android' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={enabled ? handleScan : undefined}
      />
      <View style={styles.overlay}>
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setEnabled((e) => !e)}>
          <Text>{enabled ? 'Pausar' : 'Reanudar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={onClose}>
          <Text style={styles.btnText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: '700' },
  btn: { backgroundColor: '#111', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 },
  btnGhost: { backgroundColor: '#fff' },
  btnText: { color: '#fff', fontWeight: '700' },
  overlay: {
    position: 'absolute', bottom: 24, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'
  }
});
