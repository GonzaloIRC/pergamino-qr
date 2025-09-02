import React from 'react';
import { View, Text, Button } from 'react-native';

export default function Landing({ navigation }) {
  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', gap:12, padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:'700' }}>Pergamino App</Text>
      <Button title="Iniciar sesión" onPress={() => navigation.navigate('Login')} />
      <Button title="Registrarme" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}
