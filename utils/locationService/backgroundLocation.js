// location/backgroundLocation.js
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    console.log('Background location update:', locations);
    // Optionally: Send to backend or save locally
  }
});

export const startBackgroundLocation = async () => {
  try {
    // First, request foreground permission
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      console.log('❌ Foreground location permission denied');
      return { success: false, error: 'Foreground permission denied' };
    }

    // Then, request background permission (optional for our app)
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus !== 'granted') {
      console.log('⚠️ Background location permission not granted - using foreground only');
      Alert.alert(
        'Background Location',
        'Background location is optional. You can still use all app features with foreground location only.',
        [{ text: 'OK' }]
      );
      return { success: false, error: 'Background permission denied' };
    }

    // Only start if background permission granted
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced, // Changed from High to save battery
      timeInterval: 60000, // 1 minute
      distanceInterval: 100, // 100 meters (increased to save battery)
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'SpendTrail',
        notificationBody: 'Tracking location for transaction tagging',
      },
    });

    console.log('✅ Background location started');
    return { success: true };
  } catch (error) {
    console.error('Error starting background location:', error);
    return { success: false, error: error.message };
  }
};

export const stopBackgroundLocation = async () => {
  try {
    const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('✅ Background location stopped');
    }
  } catch (error) {
    console.error('Error stopping background location:', error);
  }
};

/**
 * Check if background location is supported and enabled
 */
export const isBackgroundLocationEnabled = async () => {
  try {
    const { status } = await Location.getBackgroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    return false;
  }
};
