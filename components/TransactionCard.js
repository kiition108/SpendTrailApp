import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function TransactionCard({ transaction, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Text style={styles.merchant}>{transaction.merchant}</Text>
      <Text style={styles.amount}>₹{transaction.amount}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, backgroundColor: '#fff', borderRadius: 6, marginBottom: 10, elevation: 1 },
  merchant: { fontSize: 16, fontWeight: 'bold' },
  amount: { fontSize: 14, color: 'green' }
});
