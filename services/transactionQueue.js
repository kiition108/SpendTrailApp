import AsyncStorage from '@react-native-async-storage/async-storage';
import API from './api';
import { SMS_WEBHOOK_KEY } from '../config/constants';
import { showTransactionNotification, showSyncCompleteNotification, updateBadgeCount } from './notificationService';

const QUEUE_KEY = 'transaction_queue';

/**
 * Get pending transactions from queue
 */
export const getQueuedTransactions = async () => {
    try {
        const queue = await AsyncStorage.getItem(QUEUE_KEY);
        return queue ? JSON.parse(queue) : [];
    } catch (error) {
        console.error('Get queue error:', error);
        return [];
    }
};

/**
 * Add transaction to queue
 */
export const queueTransaction = async (smsData) => {
    try {
        const queue = await getQueuedTransactions();

        const queueItem = {
            id: Date.now().toString(),
            smsData,
            queuedAt: new Date().toISOString(),
            status: 'pending',
        };

        queue.push(queueItem);
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

        // Update badge count
        await updateBadgeCount(queue.length);

        // Show notification
        const previewAmount = smsData.message.match(/(?:Rs|INR|₹)[\s\.]*([0-9,]+(?:\.\d{1,2})?)/i);
        const amount = previewAmount ? parseFloat(previewAmount[1].replace(/,/g, '')) : 0;

        await showTransactionNotification({
            merchant: smsData.sender,
            amount: amount,
            category: 'Pending',
        });

        console.log(`✅ Transaction queued. Total pending: ${queue.length}`);
        return { success: true, queueLength: queue.length };
    } catch (error) {
        console.error('Queue transaction error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Process all queued transactions
 */
export const processQueue = async () => {
    try {
        const queue = await getQueuedTransactions();

        if (queue.length === 0) {
            console.log('No queued transactions to process');
            return { success: true, processed: 0 };
        }

        console.log(`📤 Processing ${queue.length} queued transactions...`);

        const results = [];
        const failedItems = [];

        for (const item of queue) {
            try {
                // Send to webhook
                const response = await API.post('/smswebhook', item.smsData, {
                    headers: { 'x-api-key': SMS_WEBHOOK_KEY },
                });

                results.push({
                    id: item.id,
                    success: true,
                    data: response.data,
                });
            } catch (error) {
                console.error(`Failed to process ${item.id}:`, error.message);
                failedItems.push(item);
                results.push({
                    id: item.id,
                    success: false,
                    error: error.message,
                });
            }
        }

        // Update queue with only failed items
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(failedItems));
        await updateBadgeCount(failedItems.length);

        const successCount = results.filter(r => r.success).length;

        // Show completion notification
        if (successCount > 0) {
            await showSyncCompleteNotification(successCount);
        }

        console.log(`✅ Processed ${successCount} transactions, ${failedItems.length} failed`);

        return {
            success: true,
            processed: successCount,
            failed: failedItems.length,
            results,
        };
    } catch (error) {
        console.error('Process queue error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Clear all queued transactions
 */
export const clearQueue = async () => {
    try {
        await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([]));
        await updateBadgeCount(0);
        console.log('✅ Queue cleared');
        return { success: true };
    } catch (error) {
        console.error('Clear queue error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get queue statistics
 */
export const getQueueStats = async () => {
    try {
        const queue = await getQueuedTransactions();
        const pending = queue.filter(item => item.status === 'pending').length;
        const oldestItem = queue.length > 0 ? queue[0].queuedAt : null;

        return {
            total: queue.length,
            pending,
            oldestItem,
        };
    } catch (error) {
        console.error('Get queue stats error:', error);
        return { total: 0, pending: 0, oldestItem: null };
    }
};
