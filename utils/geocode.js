// utils/geocode.js
import * as Location from 'expo-location';

export async function reverseGeocode(lat, lng) {
  try {
    const result = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lng,
    });

    if (result.length > 0) {
      const data = result[0];
      // Construct address
      const addressParts = [data.name, data.street, data.district].filter(p => p);
      const address = addressParts.join(', ');

      return {
        lat: lat,
        lng: lng,
        address: address || '',
        city: data.city || data.subregion || '',
        country: data.country || '',
        placeName: data.name || '',
      };
    }

    return {
      lat: lat,
      lng: lng,
      address: '',
      city: '',
      country: '',
      placeName: '',
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error.message);
    return {
      lat: lat,
      lng: lng,
      address: '',
      city: '',
      country: '',
      placeName: '',
    };
  }
}
