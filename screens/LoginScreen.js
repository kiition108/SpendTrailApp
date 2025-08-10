import React, { useState, useContext } from 'react';
import { View, TextInput, Button } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  console.log(email)
  console.log(password)
  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      
      <Button title="Login" onPress={() => login(email, password)} />
      <Button title="Go to Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
}
