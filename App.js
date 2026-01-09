// App.js - Production Ready
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();

import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, AuthContext } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import ErrorBoundary from './components/ErrorBoundary';
import { ActivityIndicator, View, LogBox, StatusBar } from 'react-native';

// Ignore specific warnings in production
if (!__DEV__) {
  LogBox.ignoreAllLogs();
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
}

// Ignore known warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Async Storage has been extracted',
]);

function RootNavigation() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' }}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize app-level services (analytics, crash reporting, etc.)
    if (!__DEV__) {
      // TODO: Initialize production services
      // Analytics.initialize();
      // CrashReporting.initialize();
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
    </ErrorBoundary>
  );
}
