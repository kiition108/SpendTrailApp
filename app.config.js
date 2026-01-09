// Load environment variables
require('dotenv').config();

export default {
    expo: {
        name: "SpendTrailApp",
        slug: "SpendTrailApp",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            permissions: [
                "ACCESS_COARSE_LOCATION",
                "ACCESS_FINE_LOCATION",
                "ACCESS_BACKGROUND_LOCATION"
            ],
            package: "com.spendtrail.app",
            edgeToEdgeEnabled: true
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        plugins: [
            "expo-font"
        ],
        extra: {
            // Environment variables accessible via Constants.expoConfig.extra
            apiBaseUrl: process.env.API_BASE_URL,
            smsWebhookKey: process.env.SMS_WEBHOOK_KEY,
            nodeEnv: process.env.NODE_ENV || 'development',
            "eas": {
                "projectId": "eee67403-98f3-4e66-bc68-2b51c65ee8cd"
            }
        }
    }
};
