import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import API from "../services/api";
import { formatFullTransactionList } from "../utils/transactionFormatter";
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export default function CompleteUserTransactionsScreen({ navigation }) {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTxns = async () => {
      try {
        const res = await API.get('/transactions/user');
        setTransactions(formatFullTransactionList(res.data.transactions));
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxns();
  }, []);

  const getIconBackgroundColor = (category) => {
    const colors = {
      Food: '#FFE5E5',
      Transport: '#E5F3FF',
      Shopping: '#FFF5E5',
      Entertainment: '#F5E5FF',
      Bills: '#E5FFF5',
      Health: '#FFE5F5',
      default: '#F0F0F0',
    };
    return colors[category] || colors.default;
  };

  const getIconColor = (category) => {
    const colors = {
      Food: '#FF6B6B',
      Transport: '#4ECDC4',
      Shopping: '#FFB84D',
      Entertainment: '#A461D8',
      Bills: '#43C6AC',
      Health: '#FD79A8',
      default: '#999',
    };
    return colors[category] || colors.default;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading transactions...</Text>
      </View>
    );
  }



  const filteredTransactions = transactions.filter(txn =>
    txn.merchant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    txn.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.gradientColors}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>All Transactions</Text>
        <Text style={styles.headerSubtitle}>{transactions.length} total transactions</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#667eea" style={styles.searchIcon} />
          <TextInput
            placeholder="Search transactions..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color={theme.textTertiary} />
          <Text style={[styles.emptyText, { color: theme.text }]}>No transactions yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Start tracking your expenses</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredTransactions.map((txn, index) => (
            <TouchableOpacity
              key={txn.id}
              style={[
                styles.transactionCard,
                { backgroundColor: theme.backgroundCard },
                index === filteredTransactions.length - 1 && styles.lastCard
              ]}
              onPress={() => navigation.navigate('TransactionDetail', { transaction: txn })}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                { backgroundColor: getIconBackgroundColor(txn.category) }
              ]}>
                <Ionicons
                  name={txn.icon}
                  size={24}
                  color={getIconColor(txn.category)}
                />
              </View>

              <View style={styles.txnInfo}>
                <Text style={[styles.txnTitle, { color: theme.text }]}>{txn.merchant || txn.category}</Text>
                <View style={styles.txnMetaRow}>
                  <Ionicons name="pricetag-outline" size={12} color={theme.textTertiary} />
                  <Text style={[styles.txnCategory, { color: theme.textSecondary }]}>{txn.category}</Text>
                  <Text style={[styles.txnDot, { color: theme.textTertiary }]}>•</Text>
                  <Ionicons name="calendar-outline" size={12} color={theme.textTertiary} />
                  <Text style={[styles.txnDate, { color: theme.textSecondary }]}>{txn.date}</Text>
                </View>
              </View>

              <View style={styles.amountContainer}>
                <Text style={[
                  styles.txnAmount,
                  { color: txn.amount > 0 ? '#43C6AC' : '#FF6B6B' }
                ]}>
                  {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount)}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginTop: 20,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#333',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lastCard: {
    marginBottom: 0,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  txnInfo: {
    flex: 1,
  },
  txnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  txnMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txnCategory: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  txnDot: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 6,
  },
  txnDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  txnAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
