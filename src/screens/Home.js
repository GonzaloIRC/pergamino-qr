import React from 'react';
import { View, Text, Button, StatusBar, Alert } from 'react-native';

export default function Home({ navigation }){
  return (
    <View style={{ flex:1, padding:24, gap:12, alignItems:'stretch', justifyContent:'center' }}>
      <StatusBar />
      <Text style={{ fontSize:24, fontWeight:'700', textAlign:'center', marginBottom:12 }}>Pergamino App</Text>
      <Button title='Registrarme (Cliente)' onPress={() => navigation.navigate('RegisterClient')} />
      <Button title='Registrarme (Mesero)' onPress={() => navigation.navigate('RegisterMesero')} />
      <Button title='Registrarme (Admin)' onPress={() => navigation.navigate('RegisterAdmin')} />
      <Button title='Abrir Escáner (Mesero)' onPress={() => navigation.navigate('Scanner')} />
      <Button title='Ver guardados' onPress={() => Alert.alert('Info','WIP')} />
      <Button title='Generar QR' onPress={() => Alert.alert('Info','WIP')} />
    </View>
  );
}
