import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import API from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function MapViewScreen({ navigation }) {
  const [userLocation, setUserLocation] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTxns, setFilteredTxns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'];

  useEffect(() => {
    (async () => {
      try {
        // 1. Get Location Permission
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Permission to access location was denied');
          setLoading(false);
          return;
        }

        // 2. Get Current Location
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation(loc.coords);

        // 3. Fetch Transactions
        const res = await API.get('/transactions/user');
        const allTxns = res.data.transactions;

        // Filter transactions specifically with coordinates
        const validTxns = allTxns.filter(txn => {
          const hasCoords = txn.location &&
            (txn.location.lat || txn.location.latitude) &&
            (txn.location.lng || txn.location.longitude || txn.location.lon);
          return hasCoords;
        }).map(txn => {
          // Normalize coordinates
          return {
            ...txn,
            latitude: parseFloat(txn.location.lat || txn.location.latitude),
            longitude: parseFloat(txn.location.lng || txn.location.longitude || txn.location.lon)
          };
        });

        console.log('Valid transactions for map:', validTxns.length);
        setTransactions(validTxns);
        setFilteredTxns(validTxns);
      } catch (err) {
        console.error('Error loading map data:', err);
        Alert.alert('Error', 'Failed to load map data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setFilteredTxns(transactions);
    } else {
      setFilteredTxns(transactions.filter(txn => txn.category === selectedCategory));
    }
  }, [selectedCategory, transactions]);

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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food': return 'fast-food';
      case 'Transport': return 'car';
      case 'Shopping': return 'cart';
      case 'Entertainment': return 'film';
      case 'Bills': return 'receipt';
      case 'Health': return 'medkit';
      default: return 'ellipsis-horizontal';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading Map & Transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation ? userLocation.latitude : 28.6139,
          longitude: userLocation ? userLocation.longitude : 77.2090,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {filteredTxns.map((txn, index) => (
          <Marker
            key={txn.id || index}
            coordinate={{
              latitude: txn.latitude,
              longitude: txn.longitude,
            }}
          >
            <View style={[styles.markerContainer, { backgroundColor: getCategoryColor(txn.category) }]}>
              <Ionicons name={getCategoryIcon(txn.category)} size={16} color="white" />
            </View>
            <Callout>
              <View style={styles.calloutContainer}>
                <View style={[styles.calloutHeader, { backgroundColor: getCategoryColor(txn.category) }]}>
                  <Text style={styles.calloutTitle}>{txn.category}</Text>
                </View>
                <View style={styles.calloutContent}>
                  <Text style={styles.merchantText}>{txn.merchant || 'Merchant'}</Text>
                  <Text style={[
                    styles.amountText,
                    { color: txn.amount < 0 ? '#43C6AC' : '#FF6B6B' }
                  ]}>
                    {txn.amount < 0 ? '+' : '-'}₹{Math.abs(txn.amount)}
                  </Text>
                  <Text style={styles.dateText}>
                    {new Date(txn.timestamp || txn.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}

      </MapView>

      {/* Category Filter Chips */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          <TouchableOpacity
            style={[
              styles.chip,
              selectedCategory === null && styles.activeChip
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.chipText, selectedCategory === null && styles.activeChipText]}>All</Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                selectedCategory === cat && styles.activeChip
              ]}
              onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              <View style={[styles.dot, { backgroundColor: getCategoryColor(cat) }]} />
              <Text style={[styles.chipText, selectedCategory === cat && styles.activeChipText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  categoriesContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    height: 50,
  },
  chipsScroll: {
    paddingHorizontal: 15,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeChip: {
    backgroundColor: '#333',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeChipText: {
    color: '#fff',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  // Custom Callout Styles
  calloutContainer: {
    width: 180,
    minHeight: 80,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#e0e0e0',
    borderWidth: 0.5,
  },
  customCalloutWrapper: {
    width: 180,
    marginBottom: 5,
  },
  calloutHeader: {
    padding: 8,
    alignItems: 'center',
  },
  calloutTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  calloutContent: {
    padding: 10,
    alignItems: 'center',
  },
  merchantText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 10,
    color: '#888',
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
