// App Configuration from Environment Variables
import Constants from 'expo-constants';

// Access environment variables via Constants.expoConfig.extra
const extra = Constants.expoConfig?.extra || {};

// =============================================================================
// SECURITY: No sensitive fallbacks! Values MUST come from environment variables
// =============================================================================

// SMS Webhook Key - REQUIRED for SMS processing
// ⚠️ NO FALLBACK - Must be set via EAS secrets or .env
export const SMS_WEBHOOK_KEY = extra.smsWebhookKey;

if (!SMS_WEBHOOK_KEY && !__DEV__) {
    console.error('❌ SMS_WEBHOOK_KEY not configured! SMS features will not work.');
}

// API Base URL - Required for all API calls
// Fallback to localhost ONLY in development (never exposed in production)
export const API_BASE_URL = extra.apiBaseUrl || (__DEV__ ? 'http://192.168.31.2:8000/api/v1' : null);

if (!API_BASE_URL) {
    throw new Error(
        '❌ CRITICAL: API_BASE_URL not configured!\n\n' +
        'Production builds MUST have API_BASE_URL set via EAS secrets.\n' +
        'Run: eas secret:create --scope project --name API_BASE_URL --value "your-api-url"'
    );
}

// Node Environment
export const NODE_ENV = extra.nodeEnv || 'development';

// Sentry DSN - Public value, safe to have in config
export const SENTRY_DSN = extra.sentryDsn || null;

// =============================================================================
// API Configuration
// =============================================================================
export const API_CONFIG = {
    BASE_URL: API_BASE_URL,
    TIMEOUT: 10000,
};

// =============================================================================
// App Constants (Non-sensitive)
// =============================================================================
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'SpendTrail';

// Feature Flags (can be controlled via environment)
export const FEATURES = {
    SMS_AUTO_SYNC: !!SMS_WEBHOOK_KEY, // Only enable if key is configured
    BACKGROUND_LOCATION: true,
    OFFLINE_MODE: true,
};

// Development-only helpers
if (__DEV__) {
    console.log('📋 App Configuration:');
    console.log('  API_BASE_URL:', API_BASE_URL);
    console.log('  SMS_WEBHOOK_KEY:', SMS_WEBHOOK_KEY ? '✓ Configured' : '✗ Not configured');
    console.log('  SENTRY_DSN:', SENTRY_DSN ? '✓ Configured' : '✗ Not configured');
    console.log('  NODE_ENV:', NODE_ENV);
}
