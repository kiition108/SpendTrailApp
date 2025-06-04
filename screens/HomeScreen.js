import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Button, StyleSheet } from 'react-native';
import API from '../services/api';
import TransactionCard from '../components/TransactionCard';

export default function HomeScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    API.get('/transactions')
      .then(res => setTransactions(res.data))
      .catch(() => alert('Failed to load transactions'));
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Add Transaction" onPress={() => navigation.navigate('AddTransaction')} />
      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TransactionCard transaction={item} onPress={() => navigation.navigate('TransactionDetail', { transaction: item })} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 }
});
