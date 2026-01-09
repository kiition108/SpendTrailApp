// SMS Listener Service for Auto Transaction Detection
// NOTE: Requires custom development build or bare React Native

import * as Location from 'expo-location';
import API from '../services/api';
import { SMS_WEBHOOK_KEY } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Known bank sender IDs (add more as needed)
const BANK_SENDER_IDS = [
    'VM-HDFC', 'HDFCBK', 'HDFC',
    'VM-ICICI', 'ICICIB', 'ICICI',
    'VM-SBI', 'SBIPSG', 'SBI',
    'VM-AXIS', 'AXISBK', 'AXIS',
    'VM-KOTAK', 'KOTAKB', 'KOTAK',
    'VM-IDFC', 'IDFC',
    'YESBNK', 'YESBANK',
    'VM-PAYTM', 'PAYTMB', 'PAYTM',
    'PHONEPE', 'PHONPE',
    'GPAY', 'GOOGLEPAY',
    'AMAZONPAY', 'AMZN',
];

// Transaction keywords to detect financial SMS
const TRANSACTION_KEYWORDS = [
    'debited', 'credited', 'spent', 'paid', 'received',
    'Rs', 'INR', '₹', 'amount', 'balance',
    'UPI', 'card', 'account', 'transaction',
    'withdrawn', 'deposited', 'refund', 'cashback'
];

/**
 * Check if SMS is from a bank
 */
export const isBankSMS = (sender) => {
    if (!sender) return false;
    const upperSender = sender.toUpperCase();
    return BANK_SENDER_IDS.some(bankId => upperSender.includes(bankId));
};

/**
 * Check if SMS contains transaction keywords
 */
export const isTransactionSMS = (message) => {
    if (!message) return false;
    const lowerMessage = message.toLowerCase();

    // Must contain at least one amount and one transaction keyword
    const hasAmount = /(?:Rs\.?|INR\.?|₹)[\s]*[0-9,]+/.test(message);
    const hasKeyword = TRANSACTION_KEYWORDS.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
    );

    return hasAmount && hasKeyword;
};

/**
 * Check if SMS auto-sync is enabled
 */
export const isAutoSyncEnabled = async () => {
    try {
        const enabled = await AsyncStorage.getItem('smsAutoSyncEnabled');
        return enabled === 'true';
    } catch (error) {
        console.error('Error checking auto-sync status:', error);
        return false;
    }
};

/**
 * Enable/Disable SMS auto-sync
 */
export const setAutoSyncEnabled = async (enabled) => {
    try {
        await AsyncStorage.setItem('smsAutoSyncEnabled', enabled ? 'true' : 'false');
        return true;
    } catch (error) {
        console.error('Error setting auto-sync status:', error);
        return false;
    }
};

/**
 * Get current location coordinates
 */
const getCurrentLocation = async () => {
    try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
            return { lat: null, lng: null };
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        return {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
        };
    } catch (error) {
        console.error('Location error:', error);
        return { lat: null, lng: null };
    }
};

/**
 * Send SMS to webhook for processing
 */
export const sendSMSToWebhook = async (message, sender, receivedAt = new Date()) => {
    try {
        // Check if auto-sync is enabled
        const syncEnabled = await isAutoSyncEnabled();
        if (!syncEnabled) {
            console.log('SMS auto-sync is disabled, skipping...');
            return { success: false, reason: 'Auto-sync disabled' };
        }

        // Validate SMS is from bank and contains transaction
        if (!isBankSMS(sender)) {
            console.log('SMS not from recognized bank, skipping...');
            return { success: false, reason: 'Not a bank SMS' };
        }

        if (!isTransactionSMS(message)) {
            console.log('SMS does not contain transaction keywords, skipping...');
            return { success: false, reason: 'Not a transaction SMS' };
        }

        // Get location
        const { lat, lng } = await getCurrentLocation();

        // Prepare payload
        const payload = {
            message: message.trim(),
            sender: sender.trim(),
            receivedAt: receivedAt.toISOString(),
            lat,
            lng,
        };

        console.log('📤 Sending SMS to webhook:', { sender, preview: message.substring(0, 50) + '...' });

        // Send to backend
        const response = await API.post('/smswebhook', payload, {
            headers: {
                'x-api-key': SMS_WEBHOOK_KEY,
            },
        });

        console.log('✅ SMS processed successfully:', response.data);
        return { success: true, data: response.data };

    } catch (error) {
        console.error('❌ Error sending SMS to webhook:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message
        };
    }
};

/**
 * Handle incoming SMS (called by SMS listener)
 */
export const handleIncomingSMS = async (sms) => {
    try {
        const { body, address, timestamp } = sms;

        console.log('📨 New SMS received:', {
            sender: address,
            preview: body?.substring(0, 30) + '...'
        });

        const result = await sendSMSToWebhook(
            body,
            address,
            timestamp ? new Date(timestamp) : new Date()
        );

        return result;
    } catch (error) {
        console.error('Error handling incoming SMS:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Request SMS permissions
 */
export const requestSMSPermission = async () => {
    try {
        // This will be implemented using native modules
        // For now, return true (actual implementation depends on react-native-android-sms-listener)
        return { granted: true };
    } catch (error) {
        console.error('Error requesting SMS permission:', error);
        return { granted: false, error: error.message };
    }
};
