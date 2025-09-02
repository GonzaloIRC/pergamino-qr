import React from 'react'; import { View, Text, Button } from 'react-native';
export default function Landing({navigation}){ 
  return (
    <View style={{padding:24, gap:12}}>
      <Text style={{fontSize:22, fontWeight:'700'}}>Pergamino App</Text>
      <Button title="Soy cliente" onPress={()=>navigation.navigate('Login')} />
      <Button title="Soy mesero/admin" onPress={()=>navigation.navigate('Login')} />
      <Button title="Crear cuenta" onPress={()=>navigation.navigate('Register')} />
    </View>
  );
}
