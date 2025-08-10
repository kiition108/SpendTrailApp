import { FlatList, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import API from "../services/api";
import { formatFullTransactionList } from "../utils/transactionFormatter";

export default function CompleteUserTransactionsScreen({ navigation }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTxns = async () => {
      try {
        const res = await API.get('/transactions/user');
        setTransactions(formatFullTransactionList(res.data.transactions));
      } catch (err) {
        console.log(err);
      }
    };
    fetchTxns();
  }, []);

  return (
    <View style={styles.container}>
      {transactions.map((txn) => (
        <TouchableOpacity
          key={txn.id}
          style={styles.transactionItem}
          onPress={() => navigation.navigate('TransactionDetail', { transaction: txn })}
        >
          <Ionicons name={txn.icon} size={24} />
          <View style={styles.txnInfo}>
            <Text style={styles.txnTitle}>{txn.merchant || txn.category}</Text>
            <Text style={styles.txnSub}>{txn.category} • {txn.date}</Text>
          </View>
          <Text style={[styles.txnAmount, { color: txn.amount < 0 ? 'red' : 'green' }]}>
            ₹{txn.amount}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  txnInfo: { flex: 1, marginLeft: 12 },
  txnTitle: { fontSize: 16, fontWeight: 'bold' },
  txnSub: { fontSize: 12, color: '#888' },
  txnAmount: { fontSize: 16, fontWeight: 'bold' },
});
