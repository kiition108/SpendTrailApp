// utils/location.js
import * as Location from 'expo-location';

export const getCurrentCoordinates = async () => {
  try {
    const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      return {
        error: 'Location permission denied',
        canAskAgain,
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  } catch (error) {
    console.error('Location error:', error.message);
    return {
      error: 'Unexpected error getting location',
    };
  }
};
