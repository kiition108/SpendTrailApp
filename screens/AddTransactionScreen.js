import React, { useEffect, useState } from 'react';
import { View,Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import API from '../services/api';
import { getCurrentCoordinates } from '../utils/location';
import { reverseGeocode } from '../utils/geocode';

export default function AddTransactionScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [coords, setCoords] = useState(null);
  const [locationDetails, setLocationDetails] = useState({
    address: '',
    city: '',
    country: '',
    placeName: '',
  });
  
  useEffect(() => {
    const fetchLocationAndAddress = async () => {
      const location = await getCurrentCoordinates();

      if (location?.error) {
        Alert.alert('Location Error', location.error);
        return;
      }

      setCoords(location);
      const geo = await reverseGeocode(location.lat, location.lng);
      setLocationDetails((prev) => ({
        ...prev,
        ...geo
      }));
    };

    fetchLocationAndAddress();
  }, []);
  const handleSave = () => {
    API.post('/transactions', {
      amount: parseFloat(amount),
      merchant,
      note,
      location:locationDetails,
      category: category||'Uncategorized',
    })
      .then(() => {
        Alert.alert('Saved', 'Transaction added');
        navigation.goBack();
      })
      .catch(() => Alert.alert('Error', 'Failed to save transaction'));
  };

  if (!coords || !locationDetails?.address) {
      return (
        <View style={styles.container}>
          <Text>Loading location...</Text>
        </View>
      );
    }

  return (
    <View style={styles.container}>
      <TextInput placeholder="Amount" keyboardType="numeric" style={styles.input} value={amount} onChangeText={setAmount} />
      <TextInput placeholder="Merchant" style={styles.input} value={merchant} onChangeText={setMerchant} />
      <TextInput placeholder="Category" style={styles.input} value={category} onChangeText={setCategory} />
      <TextInput placeholder="Description" style={styles.input} value={note} onChangeText={setNote} />
      <Text>Latitude: {coords?.lat}</Text>
      <Text>Longitude: {coords?.lng}</Text>
      <TextInput
        placeholder="Address"
        value={locationDetails.address}
        onChangeText={(text) => setLocationDetails({ ...locationDetails, address: text })}
      />
      <TextInput
        placeholder="Place Name"
        value={locationDetails.placeName}
        onChangeText={(text) => setLocationDetails({ ...locationDetails, placeName: text })}
      />
      
      <TextInput
        placeholder="City"
        value={locationDetails.city}
        onChangeText={(text) => setLocationDetails({ ...locationDetails, city: text })}
      />
      <TextInput
        placeholder="Country"
        value={locationDetails.country}
        onChangeText={(text) => setLocationDetails({ ...locationDetails, country: text })}
      />
      <Button title="Save Transaction" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, marginVertical: 8, padding: 10, borderRadius: 5 }
});
