// App.js - Production Ready
import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens();

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Initialize Sentry BEFORE anything else
const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn || null;

// Sentry - ONLY in production builds
if (SENTRY_DSN && !__DEV__) {  // ← RESTORED: Only production
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: Constants.expoConfig?.extra?.nodeEnv || 'production',

    // Error tracking (ESSENTIAL - keep enabled)
    enableAutoSessionTracking: true,

    // Performance monitoring (REDUCED to save quota)
    tracesSampleRate: 0.1, // Only 10% of transactions (saves 90% of quota)

    // Session tracking (CONSERVATIVE settings)
    sessionTrackingIntervalMillis: 30000, // Check every 30s instead of 10s

    // Filter function
    beforeSend(event) {
      // Filter out common non-critical errors (optional)
      if (event.message && event.message.includes('Network request failed')) {
        // Skip network errors if too noisy (you can remove this)
        return null;
      }
      return event;
    },
  });

  // Make Sentry globally available for error boundary
  global.Sentry = Sentry;

  console.log('✅ Sentry initialized');
} else {
  console.log('⚠️ Sentry DSN not configured or in development mode');
}

import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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

function App() {
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
      <ThemeProvider>
        <AuthProvider>
          <RootNavigation />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// Wrap App with Sentry for automatic error tracking
export default SENTRY_DSN && !__DEV__ ? Sentry.wrap(App) : App;
