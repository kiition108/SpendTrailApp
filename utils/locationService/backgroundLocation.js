// location/backgroundLocation.js
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

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
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission required', 'Background location permission not granted');
    return;
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 60000, // 1 minute
    distanceInterval: 50, // 50 meters
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'SpendTrail',
      notificationBody: 'Tracking your location for transaction tagging...',
    },
  });
};

export const stopBackgroundLocation = async () => {
  const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
};
