// src/components/PINAccess.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const PINAccess = ({ navigation }) => {
  const [pin, setPin] = useState('');

  const handleAccess = () => {
    if (pin === '1234') {
      navigation.navigate('ValidarQR');
    } else {
      Alert.alert('Acceso denegado', 'PIN incorrecto');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ingresa PIN de acceso</Text>
      <TextInput
        secureTextEntry
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
      />
      <Button title="Ingresar" onPress={handleAccess} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  label: { fontSize: 18, marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20,
    borderRadius: 5, fontSize: 18
  }
});

export default PINAccess;
