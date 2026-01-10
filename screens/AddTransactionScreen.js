import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import API from '../services/api';
import { getCurrentCoordinates } from '../utils/location';
import { reverseGeocode } from '../utils/geocode';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

export default function AddTransactionScreen({ route, navigation }) {
  const { theme } = useTheme();
  const transactionToEdit = route.params?.transactionToEdit;

  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [tags, setTags] = useState('');
  const paymentMethods = ['cash', 'card', 'upi', 'wallet', 'other'];
  const [coords, setCoords] = useState(null);
  const [locationDetails, setLocationDetails] = useState({
    address: '',
    city: '',
    country: '',
    placeName: '',
  });
  const [loading, setLoading] = useStateAttribute(true);
  const [saving, setSaving] = useState(false);

  // Helper for loading state to avoid conflict with standard useState
  function useStateAttribute(initial) {
    return useState(initial);
  }

  // Popular categories
  const categories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Other'];

  useEffect(() => {
    const init = async () => {
      if (transactionToEdit) {
        setAmount(Math.abs(transactionToEdit.amount).toString());
        setMerchant(transactionToEdit.merchant || '');
        setCategory(transactionToEdit.category || '');

        setNote(transactionToEdit.note || '');
        setPaymentMethod(transactionToEdit.paymentMethod || 'cash');
        setTags(transactionToEdit.tags ? transactionToEdit.tags.join(', ') : '');

        if (transactionToEdit.location) {
          setLocationDetails(transactionToEdit.location);
          if (transactionToEdit.location.lat && transactionToEdit.location.lng) {
            setCoords({ lat: transactionToEdit.location.lat, lng: transactionToEdit.location.lng });
          }
        }
        setLoading(false);
      } else {
        // New Transaction - Fetch Location
        const location = await getCurrentCoordinates();

        if (location?.error) {
          Alert.alert('Location Error', location.error);
          setLoading(false);
          return;
        }

        setCoords(location);
        const geo = await reverseGeocode(location.lat, location.lng);
        setLocationDetails((prev) => ({
          ...prev,
          ...geo
        }));
        setLoading(false);
      }
    };

    init();
  }, [transactionToEdit]);

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        merchant,
        note,
        location: {
          ...locationDetails,
          lat: coords?.lat,
          lng: coords?.lng
        },
        category: category || 'Uncategorized',
        paymentMethod,
        tags: tags.split(',').map(tag => tag.trim()).filter(t => t),
        source: 'manual',
      };

      if (transactionToEdit) {
        await API.put(`/transactions/${transactionToEdit._id || transactionToEdit.id}`, payload);
        Alert.alert('Success', 'Transaction updated successfully');
      } else {
        await API.post('/transactions', payload);
        Alert.alert('Success', 'Transaction added successfully');
      }

      navigation.navigate('Home'); // Ensure we go back to Home to refresh or use a callback
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{transactionToEdit ? 'Loading details...' : 'Loading location...'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={theme.gradientColors}
        style={styles.header}
      >
        <Ionicons name={transactionToEdit ? "create" : "add-circle"} size={60} color="#fff" />
        <Text style={styles.headerTitle}>{transactionToEdit ? 'Edit Transaction' : 'New Transaction'}</Text>
        <Text style={styles.headerSubtitle}>{transactionToEdit ? 'Update details' : 'Track your expense'}</Text>
      </LinearGradient>

      <View style={styles.formSection}>
        {/* Amount Input - Prominent */}
        <View style={[styles.amountContainer, { backgroundColor: theme.backgroundCard }]}>
          <Text style={[styles.currencySymbol, { color: theme.primary }]}>₹</Text>
          <TextInput
            placeholder="0.00"
            placeholderTextColor={theme.textTertiary}
            keyboardType="numeric"
            style={[styles.amountInput, { color: theme.text }]}
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Merchant Input */}
        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundCard }]}>
          <Ionicons name="business-outline" size={20} color={theme.primary} style={styles.inputIcon} />
          <TextInput
            placeholder="Merchant / Store Name"
            placeholderTextColor={theme.textTertiary}
            style={[styles.input, { color: theme.text }]}
            value={merchant}
            onChangeText={setMerchant}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Payment Method */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Method</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {paymentMethods.map((pm) => (
              <TouchableOpacity
                key={pm}
                style={[
                  styles.categoryChip,
                  paymentMethod === pm && styles.categoryChipActive
                ]}
                onPress={() => setPaymentMethod(pm)}
              >
                <Text style={[
                  styles.categoryText,
                  paymentMethod === pm && styles.categoryTextActive
                ]}>
                  {pm.charAt(0).toUpperCase() + pm.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Note Input */}
        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundCard }]}>
          <Ionicons name="document-text-outline" size={20} color={theme.primary} style={styles.inputIcon} />
          <TextInput
            placeholder="Add a note (optional)"
            placeholderTextColor={theme.textTertiary}
            style={[styles.input, { color: theme.text }]}
            value={note}
            onChangeText={setNote}
            multiline
          />
        </View>

        {/* Tags Input */}
        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundCard }]}>
          <Ionicons name="pricetags-outline" size={20} color={theme.primary} style={styles.inputIcon} />
          <TextInput
            placeholder="Tags (comma separated)"
            placeholderTextColor={theme.textTertiary}
            style={[styles.input, { color: theme.text }]}
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {/* Location Details */}
        <View style={[styles.locationSection, { backgroundColor: theme.backgroundCard }]}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={20} color={theme.primary} />
            <Text style={[styles.locationTitle, { color: theme.text }]}>Location Details</Text>
          </View>

          {coords && (
            <View style={styles.coordsContainer}>
              <Text style={styles.coordsText}>
                📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </Text>
            </View>
          )}

          <View style={styles.locationInputContainer}>
            <Text style={styles.locationLabel}>Address</Text>
            <TextInput
              placeholder="Address"
              placeholderTextColor="#999"
              value={locationDetails.address}
              onChangeText={(text) => setLocationDetails({ ...locationDetails, address: text })}
              style={styles.locationInput}
            />
          </View>

          <View style={styles.locationRow}>
            <View style={[styles.locationInputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.locationLabel}>City</Text>
              <TextInput
                placeholder="City"
                placeholderTextColor="#999"
                value={locationDetails.city}
                onChangeText={(text) => setLocationDetails({ ...locationDetails, city: text })}
                style={styles.locationInput}
              />
            </View>
            <View style={[styles.locationInputContainer, { flex: 1 }]}>
              <Text style={styles.locationLabel}>Country</Text>
              <TextInput
                placeholder="Country"
                placeholderTextColor="#999"
                value={locationDetails.country}
                onChangeText={(text) => setLocationDetails({ ...locationDetails, country: text })}
                style={styles.locationInput}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={theme.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Save Transaction</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  formSection: {
    padding: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#667eea',
    marginRight: 10,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  locationSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  coordsContainer: {
    backgroundColor: '#f0f4ff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  coordsText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  locationInputContainer: {
    marginBottom: 15,
  },
  locationLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
    fontWeight: '600',
  },
  locationInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationRow: {
    flexDirection: 'row',
  },
  saveButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
