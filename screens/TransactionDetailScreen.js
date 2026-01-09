import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import API from '../services/api';

export default function TransactionDetailScreen({ route, navigation }) {
  const { transaction } = route.params;
  const [loading, setLoading] = useState(false);

  // Debug: Log transaction object to see available fields
  console.log('Transaction object:', transaction);
  console.log('Timestamp field:', transaction.timestamp);
  console.log('Date field:', transaction.date);
  console.log('CreatedAt field:', transaction.createdAt);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not available';

    let date;
    // Handle various date formats
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      console.log('Unknown date format:', timestamp);
      return 'Date format unknown';
    }

    if (isNaN(date.getTime())) {
      console.log('Invalid date value:', timestamp);
      return 'Date not available';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await API.delete(`/transactions/${transaction._id || transaction.id}`);
              Alert.alert('Success', 'Transaction deleted successfully');
              navigation.navigate('Home');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('AddTransaction', { transactionToEdit: transaction });
  };

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

  const categoryColor = getCategoryColor(transaction.category);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[categoryColor, categoryColor + 'CC']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>{transaction.amount < 0 ? '+' : '-'}₹</Text>
          <Text style={styles.amount}>{Math.abs(transaction.amount)}</Text>
        </View>
        <Text style={styles.headerSubtitle}>Transaction Details</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Merchant/Title Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="business" size={24} color={categoryColor} />
            <Text style={styles.cardTitle}>Merchant</Text>
          </View>
          <Text style={styles.cardValue}>{transaction.merchant || 'N/A'}</Text>
        </View>

        {/* Category Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="pricetag" size={24} color={categoryColor} />
            <Text style={styles.cardTitle}>Category</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
              {transaction.category}
            </Text>
          </View>
        </View>

        {/* Date & Time Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color={categoryColor} />
            <Text style={styles.cardTitle}>Date & Time</Text>
          </View>
          <Text style={styles.cardValue}>{formatDate(transaction.timestamp || transaction.date || transaction.createdAt)}</Text>
        </View>

        {/* Note Section (if exists) */}
        {transaction.note && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={24} color={categoryColor} />
              <Text style={styles.cardTitle}>Note</Text>
            </View>
            <Text style={styles.cardValue}>{transaction.note}</Text>
          </View>
        )}

        {/* Location Section */}
        {transaction.location && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location" size={24} color={categoryColor} />
              <Text style={styles.cardTitle}>Location</Text>
            </View>

            {transaction.location.address && (
              <View style={styles.locationRow}>
                <Ionicons name="navigate" size={16} color="#999" />
                <Text style={styles.locationText}>{transaction.location.address}</Text>
              </View>
            )}

            {transaction.location.city && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color="#999" />
                <Text style={styles.locationText}>
                  {transaction.location.city}
                  {transaction.location.country && `, ${transaction.location.country}`}
                </Text>
              </View>
            )}

            {transaction.location.placeName && (
              <View style={styles.locationRow}>
                <Ionicons name="pin" size={16} color="#999" />
                <Text style={styles.locationText}>{transaction.location.placeName}</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit} disabled={loading}>
            <LinearGradient
              colors={[categoryColor + '20', categoryColor + '10']}
              style={styles.actionGradient}
            >
              <Ionicons name="create-outline" size={24} color={categoryColor} />
              <Text style={[styles.actionText, { color: categoryColor }]}>Edit</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDelete} disabled={loading}>
            <LinearGradient
              colors={['#FF6B6B20', '#FF6B6B10']}
              style={styles.actionGradient}
            >
              <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
              {loading ? (
                <ActivityIndicator size="small" color="#FF6B6B" style={{ marginLeft: 8 }} />
              ) : (
                <>

                  <Text style={[styles.actionText, { color: '#FF6B6B' }]}>Delete</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  amount: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  cardValue: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#667eea',
  },
  categoryBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
