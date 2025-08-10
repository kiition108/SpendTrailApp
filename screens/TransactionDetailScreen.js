import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TransactionDetailScreen({ route }) {
  const { transaction } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{transaction.merchant}</Text>
      <Text>Amount: ₹{transaction.amount}</Text>
      <Text>Category: {transaction.category}</Text>
      <Text>Date: {new Date(transaction.timestamp).toLocaleDateString()}</Text>
      <Text>Address: {transaction.location?.address}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 }
});
