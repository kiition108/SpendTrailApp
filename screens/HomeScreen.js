import React, { useEffect, useState, useCallback} from 'react';
import { View, FlatList,Image, Text, Button, StyleSheet,ScrollView,TouchableOpacity } from 'react-native';
import API from '../services/api';
import TransactionCard from '../components/TransactionCard';
import { startBackgroundLocation,stopBackgroundLocation } from '../utils/locationService/backgroundLocation';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-svg-charts';
import { useFocusEffect } from '@react-navigation/native';
import { RefreshControl } from 'react-native';
import { formatTransactionList } from '../utils/transactionFormatter';


export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [summary,setSummary]= useState([]);
  


  const SparklineChart = ({ data }) => {
  const chartData = data.map(d => d.amount); // flatten to numbers
  return (
    <LineChart
      style={{ height: 40 }}
      data={chartData}
      svg={{ stroke: '#4caf50' }}
      contentInset={{ top: 5, bottom: 5 }}
    />
  );
};

const WeeklyBarChart = ({ data }) => {
  const chartData = data.map(d => ({ value: d.amount })); // convert to { value }
  return (
    <BarChart
      style={{ height: 40 }}
      data={chartData}
      yAccessor={({ item }) => item.value}
      svg={{ fill: '#2196f3' }}
      contentInset={{ top: 5, bottom: 5 }}
      spacingInner={0.2}
    />
  );
};

  useEffect(() => {
    const startTracking = async () => {
      try {
        await startBackgroundLocation();
        console.log('📍 Background location started');
      } catch (err) {
        Alert.alert('Location Error', 'Unable to start background tracking');
        console.error('🔴', err.message);
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
    <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text>Loading summary...</Text>
    </View>
  );
}

  if (!summary || !summary.today || !summary.week) {
    return (
      <View style={styles.container}>
        <Text>Loading summary...</Text>
      </View>
    );
  }
  return (
    <ScrollView style={styles.container}
    refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={() => {
      setRefreshing(true);
      fetchData();
    }} />
    }>
      <View style={styles.header}>
        <Text style={styles.title}><Image source={require('../assets/splash-icon.png')}
      style={{ width: 20, height: 40 }}></Image> SpendTrail</Text>
        <Ionicons name="notifications-outline" size={24} />
      </View>

      {/* Summary Cards */}
    
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardScroll}>
        {/* Sparkline Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Today’s Spend</Text>
          <Text style={styles.cardAmount}>₹{summary.today.total}</Text>
          <Text style={styles.cardSub}>{summary.today.count} txns</Text>
          <SparklineChart data={summary.today.chart} />
        </View>

        {/* Bar Chart Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>This Week</Text>
          <Text style={styles.cardAmount}>₹{summary.week.total}</Text>
          <Text style={styles.cardSub}>{summary.week.count} txns</Text>
          <WeeklyBarChart data={summary.week.chart} />
        </View>
      </ScrollView>
      

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('AddTransaction')}><Ionicons name="add-circle-outline" size={24} /><Text>Add Txn</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('MapView')}><Ionicons name="location-outline" size={24} /><Text>Map View</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}><FontAwesome5 name="chart-pie" size={20} /><Text>Categories</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}><MaterialIcons name="bar-chart" size={24} /><Text>Reports</Text></TouchableOpacity>
      </View>

      {/* Recent Transactions */}
      <Text style={styles.sectionTitle}>🔍 Recent Transactions</Text>
      {transactions.map((txn) => (
      <View key={txn.id} style={styles.transactionItem}>
        <Ionicons name={txn.icon} size={24} />
        <View style={styles.txnInfo}>
        <Text style={styles.txnTitle}>{txn.merchant || txn.category}</Text>
        <Text style={styles.txnSub}>{txn.category} • {txn.date}</Text>
        </View>
        <Text style={[styles.txnAmount, { color: txn.amount < 0 ? 'red' : 'green' }]}>
          ₹{txn.amount}
        </Text>
      </View>
      ))}

      {/* View All */}
      <TouchableOpacity style={styles.viewAll} onPress={()=> navigation.navigate('CompleteUserTrxn')}>
        <Text style={{ color: '#0066cc' }}>[View All ➔]</Text>
      </TouchableOpacity>
    </ScrollView>


  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },

  cardScroll: { flexDirection: 'row', marginBottom: 16 },
  summaryCard: {
    backgroundColor: '#f0f4ff',
    padding: 16,
    borderRadius: 10,
    marginRight: 12,
    width: 180,
  },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardAmount: { fontSize: 20, fontWeight: 'bold', marginVertical: 4 },
  cardSub: { fontSize: 14, color: '#555' },
  chart: {
    height: 50,
    marginTop: 10,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionBtn: {
    alignItems: 'center',
  },

  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  txnInfo: { flex: 1, marginLeft: 10 },
  txnTitle: { fontWeight: 'bold' },
  txnSub: { fontSize: 12, color: '#666' },
  txnAmount: { fontWeight: 'bold', color: 'red' },

  viewAll: { alignItems: 'center', marginTop: 10 },
});
