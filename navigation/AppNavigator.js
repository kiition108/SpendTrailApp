import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Image, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import TransactionDetailScreen from '../screens/TransactionDetailScreen';
import CompleteUserTransactionsScreen from '../screens/CompleteUserTransactionsScreen';
import MapViewScreen from '../screens/MapViewScreen';

import CategoriesScreen from '../screens/CategoriesScreen';
import ReportsScreen from '../screens/ReportsScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import SmsTestScreen from '../screens/SmsTestScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ImportTransactionsScreen from '../screens/ImportTransactionsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.backgroundCard,
        },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({ navigation }) => ({
              headerStyle: {
                backgroundColor: theme.backgroundCard,
              },
              headerTintColor: theme.text,
              headerShadowVisible: false,
              headerLeft: () => (
                <Image
                  source={require('../assets/splash-icon.png')}
                  style={{ width: 40, height: 40, resizeMode: 'contain', marginLeft: 8 }}
                />
              ),
              headerTitle: '',
              headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginRight: 8 }}>
                  <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Ionicons name="settings-outline" size={24} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                    <Ionicons name="notifications-outline" size={24} color={theme.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Logout',
                        'Are you sure you want to logout?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Logout', style: 'destructive', onPress: () => logout() }
                        ]
                      );
                    }}
                  >
                    <Ionicons name="log-out-outline" size={24} color={theme.error} />
                  </TouchableOpacity>
                </View>
              ),
            })}
          />
          <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
          <Stack.Screen
            name="CompleteUserTrxn"
            component={CompleteUserTransactionsScreen}
            options={{
              title: user?.name ? `${user.name}'s Transactions` : 'All Transactions',
            }}
          />
          <Stack.Screen
            name="TransactionDetail"
            component={TransactionDetailScreen}
            options={({ route }) => ({
              title: route.params?.transaction?.merchant || route.params?.transaction?.category || 'Transaction',
            })}
          />
          <Stack.Screen name="MapView" component={MapViewScreen} />
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="Reports" component={ReportsScreen} />
          <Stack.Screen name="SmsTest" component={SmsTestScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ImportTransactions" component={ImportTransactionsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />



        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OTPVerification" component={VerifyOtpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}
