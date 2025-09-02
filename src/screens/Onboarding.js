import React from 'react'; import { View, Text, Button } from 'react-native';
export default function Onboarding({navigation}){ return <View style={{padding:24}}><Text>Onboarding</Text><Button title="Ir a Login" onPress={()=>navigation.replace('Login')}/></View>; }
