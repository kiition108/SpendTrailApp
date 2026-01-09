import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Simple notification badge manager without expo-notifications
 * Uses AsyncStorage to track pending count
 */

/**
 * Get badge count
 */
export const getBadgeCount = async () => {
    try {
        const count = await AsyncStorage.getItem('pendingTransactionCount');
        return parseInt(count || '0', 10);
    } catch (error) {
        return 0;
    }
};

/**
 * Update badge count
 */
export const updateBadgeCount = async (count) => {
    try {
        await AsyncStorage.setItem('pendingTransactionCount', count.toString());
    } catch (error) {
        console.error('Update badge error:', error);
    }
};

/**
 * Clear badge count
 */
export const clearAllNotifications = async () => {
    try {
        await AsyncStorage.setItem('pendingTransactionCount', '0');
    } catch (error) {
        console.error('Clear notifications error:', error);
    }
};

/**
 * Show transaction notification (simplified - just updates count)
 */
export const showTransactionNotification = async (transaction) => {
    try {
        const currentCount = await getBadgeCount();
        await updateBadgeCount(currentCount + 1);

        console.log(`📱 Transaction queued: ${transaction.merchant || transaction.category}`);
    } catch (error) {
        console.error('Show notification error:', error);
    }
};

/**
 * Show bulk sync notification
 */
export const showBulkSyncNotification = async (count) => {
    console.log(`📊 ${count} transactions ready to sync`);
};

/**
 * Show sync completion notification
 */
export const showSyncCompleteNotification = async (count) => {
    console.log(`✅ Synced ${count} transactions`);
    await clearAllNotifications();
};

/**
 * Request notification permissions (placeholder)
 */
export const requestNotificationPermissions = async () => {
    return { granted: true };
};

/**
 * Configure notification categories (placeholder)
 */
export const configureNotificationCategories = async () => {
    // No-op for now
};

/**
 * Handle notification response (placeholder)
 */
export const handleNotificationResponse = (response) => {
    return { action: 'open_app', data: response };
};

// Note: For full push notifications with action buttons, you'll need:
// 1. npm install expo-notifications@latest --legacy-peer-deps
// 2. Custom development build (not Expo Go)
// 3. Uncomment advanced notification code from NOTIFICATIONS_GUIDE.md
