import React, { useCallback, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

/**
 * Por qué: componente autocontenido para escanear QR/EAN13/Code128 con expo-camera.
 * - Usa onBarcodeScanned (evento correcto en SDK 53).
 * - Throttle simple para evitar disparos múltiples.
 */
export default function Scanner({ onClose, onScan }) {
  const [perm, requestPermission] = useCameraPermissions();
  const lastHandledAtRef = useRef(0);

  const handleScan = useCallback(
    (e) => {
      const now = Date.now();
      if (now - lastHandledAtRef.current < 1200) return; // por qué: evitar lecturas duplicadas rápidas
      lastHandledAtRef.current = now;
      const payload = {
        data: e?.data ?? '',
        type: e?.type ?? 'unknown',
        raw: e?.raw ?? null,
        cornerPoints: e?.cornerPoints ?? null,
        boundingBox: e?.boundingBox ?? null,
        ts: new Date().toISOString(),
      };
      try { onScan?.(payload); } catch {}
    },
    [onScan]
  );

  if (!perm) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Preparando cámara…</Text>
      </View>
    );
  }

  if (!perm.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Se requiere permiso de cámara</Text>
        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Permitir cámara</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose}>
          <Text style={styles.btnGhostText}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128'] }}
        onBarcodeScanned={handleScan}
      />

      {/* Overlay superior con botón cerrar */}
      <View style={styles.overlayTop} pointerEvents="box-none">
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Cerrar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  btn: { backgroundColor: '#111', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16 },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#111' },
  btnGhostText: { color: '#111', fontSize: 16 },
  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0.15)' },
  closeBtn: { alignSelf: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6 },
  closeText: { color: '#fff', fontWeight: '600' },
});
