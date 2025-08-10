// utils/geocode.js
import axios from 'axios';

export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'SpendTrail/1.0 (your-email@example.com)' },
    });

    const data = response.data; // ✅ Axios gives data directly
    console.log(data)
    return {
      lat:data?.lat,
      lng:data?.lon,
      address: data.display_name || '',
      city: data.address?.city || data.address?.town || data.address?.village || data.address?.state||'',
      country: data.address?.country || '',
      placeName: data.name || data.address?.attraction || data.address?.suburb|| '',
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error.message);
    return {
      address: '',
      city: '',
      country: '',
      placeName: '',
    };
  }
}
