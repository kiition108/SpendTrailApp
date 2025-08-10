import React, { useState, useContext } from 'react';
import { View, TextInput, Button } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Register" onPress={() => register(email, password)} />
      <Button title="Go to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}
