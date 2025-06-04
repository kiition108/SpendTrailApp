import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import API from '../services/api';

export default function AddTransactionScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');

  const handleSave = () => {
    API.post('/transactions', {
      amount: parseFloat(amount),
      merchant,
      category: 'Uncategorized',
    })
      .then(() => {
        Alert.alert('Saved', 'Transaction added');
        navigation.goBack();
      })
      .catch(() => Alert.alert('Error', 'Failed to save transaction'));
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Amount" keyboardType="numeric" style={styles.input} value={amount} onChangeText={setAmount} />
      <TextInput placeholder="Merchant" style={styles.input} value={merchant} onChangeText={setMerchant} />
      <Button title="Save Transaction" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, marginVertical: 8, padding: 10, borderRadius: 5 }
});
