import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, FlatList, Image, Text, Button, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import API from '../services/api';
import TransactionCard from '../components/TransactionCard';
import { startBackgroundLocation, stopBackgroundLocation } from '../utils/locationService/backgroundLocation';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { RefreshControl } from 'react-native';
import { formatTransactionList } from '../utils/transactionFormatter';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sentry from '@sentry/react-native';


export default function HomeScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState([]);





  useEffect(() => {
    const startTracking = async () => {
      try {
        const result = await startBackgroundLocation();
        if (result.success) {
          console.log('✅ Background location started');
        } else {
          console.log('ℹ️ Background location not started:', result.error);
          // Don't show alert - it's optional and already handled in backgroundLocation.js
        }
      } catch (err) {
        console.error('Background location error:', err.message);
        // Silent fail - background location is optional
      }
    };

    startTracking();

    return () => {
      stopBackgroundLocation();
      console.log('📍 Background location stopped');
    };
  }, []);

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const [txnRes, summaryRes] = await Promise.all([
        API.get('/transactions/user'),
        API.get('/transactions/summary'),
      ]);
      setTransactions(formatTransactionList(txnRes.data.transactions));
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('🔴 Fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Loading summary...</Text>
      </View>
    );
  }

  if (!summary || !summary.today || !summary.week) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading summary...</Text>
      </View>
    );
  }
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          fetchData();
        }} />
      }>

      {/* Summary Cards */}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
        {/* Sparkline Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>Today's Spend</Text>
          <Text style={[styles.cardAmount, { color: theme.text }]}>₹{summary.today.total}</Text>
          <Text style={[styles.cardSub, { color: theme.textTertiary }]}>{summary.today.count} txns</Text>
        </View>

        {/* Bar Chart Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.backgroundCard }]}>
          <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>This Week</Text>
          <Text style={[styles.cardAmount, { color: theme.text }]}>₹{summary.week.total}</Text>
          <Text style={[styles.cardSub, { color: theme.textTertiary }]}>{summary.week.count} txns</Text>
        </View>
      </ScrollView>


      {/* Action Buttons */}
      <View style={styles.actionRowContainer}>
        <View style={[styles.actionRow, { backgroundColor: theme.backgroundCard }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddTransaction')}>
            <View style={[styles.actionIconContainer, { backgroundColor: theme.primary }]}>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionText, { color: theme.text }]}>Add Txn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MapView')}>
            <View style={[styles.actionIconContainer, { backgroundColor: theme.info }]}>
              <Ionicons name="location-outline" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionText, { color: theme.text }]}>Map</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Categories')}>
            <View style={[styles.actionIconContainer, { backgroundColor: theme.warning }]}>
              <FontAwesome5 name="chart-pie" size={20} color="#fff" />
            </View>
            <Text style={[styles.actionText, { color: theme.text }]}>Categories</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Reports')}>
            <View style={[styles.actionIconContainer, { backgroundColor: theme.primaryDark }]}>
              <MaterialIcons name="bar-chart" size={24} color="#fff" />
            </View>
            <Text style={[styles.actionText, { color: theme.text }]}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>🔍 Recent Transactions</Text>
      {transactions.map((txn) => {
        const getCategoryColor = (category) => {
          const colors = {
            Food: '#FF6B6B',
            Transport: '#4ECDC4',
            Shopping: '#FFB84D',
            Entertainment: '#A461D8',
            Bills: '#43C6AC',
            Health: '#FD79A8',
            default: '#667eea',
          };
          return colors[category] || colors.default;
        };

        const getCategoryBg = (category) => {
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

        return (
          <View key={txn.id} style={[styles.transactionItem, { backgroundColor: theme.backgroundCard }]}>
            <View style={[styles.txnIconContainer, { backgroundColor: getCategoryBg(txn.category) }]}>
              <Ionicons name={txn.icon} size={24} color={getCategoryColor(txn.category)} />
            </View>
            <View style={styles.txnInfo}>
              <Text style={[styles.txnTitle, { color: theme.text }]}>{txn.merchant || txn.category}</Text>
              <Text style={[styles.txnSub, { color: theme.textSecondary }]}>{txn.category} • {txn.date}</Text>
            </View>
            <Text style={[styles.txnAmount, { color: txn.amount > 0 ? theme.success : theme.error }]}>
              {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount)}
            </Text>
          </View>
        );
      })}

      {/* View All */}
      <TouchableOpacity onPress={() => navigation.navigate('CompleteUserTrxn')}>
        <LinearGradient
          colors={theme.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.viewAllBtn}
        >
          <Text style={styles.viewAllText}>View All Transactions</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>


  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },

  cardScroll: { flexDirection: 'row', marginBottom: 20 },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginRight: 12,
    width: 200,
    minHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
    color: '#333',
  },
  cardSub: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 8,
  },



  actionRowContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    width: Dimensions.get('window').width - 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  txnIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txnInfo: { flex: 1, marginLeft: 12 },
  txnTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  txnSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  txnAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  viewAllBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#667eea',
    paddingVertical: 14,
    borderRadius: 30,
    marginHorizontal: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  viewAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

