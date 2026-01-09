// App Configuration from Environment Variables
import Constants from 'expo-constants';

// Access environment variables via Constants.expoConfig.extra
const extra = Constants.expoConfig?.extra || {};

export const SMS_WEBHOOK_KEY = extra.smsWebhookKey || 'ajwfkhwajhfihqwiorhfowiqhrfiowehkjdgaskjdgkjas';
export const API_BASE_URL = extra.apiBaseUrl || 'http://192.168.31.2:8000/api/v1';
export const NODE_ENV = extra.nodeEnv || 'development';

export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    TIMEOUT: 10000,
};

// Other app constants
export const APP_VERSION = '1.0.0';
