import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import API from '../services/api';

/**
 * Convert transactions array to CSV format
 */
export const transactionsToCSV = (transactions) => {
    if (!transactions || transactions.length === 0) {
        return null;
    }

    // CSV Headers
    const headers = [
        'id',
        'amount',
        'merchant',
        'category',
        'subCategory',
        'paymentMethod',
        'date',
        'note',
        'source',
        'lat',
        'lng',
        'address',
        'city',
        'country',
    ];

    // Create CSV content
    let csv = headers.join(',') + '\n';

    transactions.forEach((txn) => {
        const row = [
            txn._id || txn.id || '',
            txn.amount || 0,
            `"${(txn.merchant || '').replace(/"/g, '""')}"`, // Escape quotes
            txn.category || '',
            txn.subCategory || '',
            txn.paymentMethod || '',
            txn.timestamp || txn.date || txn.createdAt || '',
            `"${(txn.note || '').replace(/"/g, '""')}"`, // Escape quotes
            txn.source || '',
            txn.location?.lat || '',
            txn.location?.lng || '',
            `"${(txn.location?.address || '').replace(/"/g, '""')}"`,
            txn.location?.city || '',
            txn.location?.country || '',
        ];

        csv += row.join(',') + '\n';
    });

    return csv;
};

/**
 * Fetch all transactions and export to CSV
 */
export const exportTransactionsToCSV = async () => {
    try {
        // Fetch all user transactions
        const response = await API.get('/transactions/user');
        const transactions = response.data.transactions;

        if (!transactions || transactions.length === 0) {
            return {
                success: false,
                error: 'No transactions to export',
            };
        }

        // Convert to CSV
        const csvContent = transactionsToCSV(transactions);
        if (!csvContent) {
            return {
                success: false,
                error: 'Failed to generate CSV',
            };
        }

        // Create filename with timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `SpendTrail_Transactions_${timestamp}.csv`;
        const fileUri = FileSystem.documentDirectory + filename;

        // Write CSV to file
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        // Check if sharing is available
        const isSharingAvailable = await Sharing.isAvailableAsync();

        if (isSharingAvailable) {
            // Share the file
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Export Transactions',
                UTI: 'public.comma-separated-values-text',
            });
        }

        return {
            success: true,
            filename,
            fileUri,
            count: transactions.length,
        };
    } catch (error) {
        console.error('Export error:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message,
        };
    }
};

/**
 * Export transactions for a specific date range
 */
export const exportTransactionsByDateRange = async (startDate, endDate) => {
    try {
        // Fetch transactions with date filter
        const response = await API.get('/transactions/user', {
            params: {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            },
        });

        const transactions = response.data.transactions;

        if (!transactions || transactions.length === 0) {
            return {
                success: false,
                error: 'No transactions found for the selected date range',
            };
        }

        // Convert to CSV
        const csvContent = transactionsToCSV(transactions);
        if (!csvContent) {
            return {
                success: false,
                error: 'Failed to generate CSV',
            };
        }

        // Create filename with date range
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];
        const filename = `SpendTrail_${start}_to_${end}.csv`;
        const fileUri = FileSystem.documentDirectory + filename;

        // Write CSV to file
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        // Share the file
        const isSharingAvailable = await Sharing.isAvailableAsync();
        if (isSharingAvailable) {
            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                dialogTitle: 'Export Transactions',
                UTI: 'public.comma-separated-values-text',
            });
        }

        return {
            success: true,
            filename,
            fileUri,
            count: transactions.length,
        };
    } catch (error) {
        console.error('Export error:', error);
        return {
            success: false,
            error: error.response?.data?.error || error.message,
        };
    }
};
