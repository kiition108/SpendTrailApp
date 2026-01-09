import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getQueuedTransactions, processQueue, clearQueue, getQueueStats } from '../services/transactionQueue';
import { clearAllNotifications } from '../services/notificationService';

export default function NotificationsScreen({ navigation }) {
    const [queue, setQueue] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, oldestItem: null });
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadQueue();
        }, [])
    );

    const loadQueue = async () => {
        try {
            const [queueData, queueStats] = await Promise.all([
                getQueuedTransactions(),
                getQueueStats(),
            ]);

            setQueue(queueData);
            setStats(queueStats);
        } catch (error) {
            console.error('Load queue error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSyncAll = async () => {
        if (queue.length === 0) {
            Alert.alert('No Transactions', 'No pending transactions to sync');
            return;
        }

        Alert.alert(
            'Sync Transactions',
            `Sync ${queue.length} pending transactions?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sync',
                    onPress: async () => {
                        setSyncing(true);
                        try {
                            const result = await processQueue();

                            if (result.success) {
                                Alert.alert(
                                    'Success!',
                                    `Synced ${result.processed} transactions${result.failed > 0 ? `. ${result.failed} failed` : ''}`,
                                    [{ text: 'OK', onPress: () => loadQueue() }]
                                );
                            } else {
                                Alert.alert('Error', result.error || 'Failed to sync transactions');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to sync: ' + error.message);
                        } finally {
                            setSyncing(false);
                        }
                    },
                },
            ]
        );
    };

    const handleClearAll = async () => {
        Alert.alert(
            'Clear Queue',
            'Remove all pending transactions? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await clearQueue();
                        await clearAllNotifications();
                        loadQueue();
                    },
                },
            ]
        );
    };

    const renderQueueItem = ({ item }) => {
        const { smsData, queuedAt } = item;
        const time = new Date(queuedAt).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        });

        return (
            <View style={styles.queueItem}>
                <View style={styles.queueIcon}>
                    <Ionicons name="mail" size={24} color="#667eea" />
                </View>
                <View style={styles.queueContent}>
                    <Text style={styles.queueSender}>{smsData.sender}</Text>
                    <Text style={styles.queueMessage} numberOfLines={2}>
                        {smsData.message}
                    </Text>
                    <Text style={styles.queueTime}>{time}</Text>
                </View>
                <Ionicons name="time-outline" size={20} color="#999" />
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Pending Transactions</Text>
                <Text style={styles.headerSubtitle}>{stats.total} queued for sync</Text>
            </LinearGradient>

            {queue.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No Pending Transactions</Text>
                    <Text style={styles.emptySubtext}>
                        All detected transactions have been synced
                    </Text>
                </View>
            ) : (
                <>
                    {/* Action Buttons */}
                    <View style={styles.actionBar}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.syncButton]}
                            onPress={handleSyncAll}
                            disabled={syncing}
                        >
                            <Ionicons name="sync" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>
                                {syncing ? 'Syncing...' : `Sync All (${queue.length})`}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.clearButton]}
                            onPress={handleClearAll}
                            disabled={syncing}
                        >
                            <Ionicons name="trash-outline" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>Clear</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Queue List */}
                    <FlatList
                        data={queue}
                        renderItem={renderQueueItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={() => {
                                setRefreshing(true);
                                loadQueue();
                            }} />
                        }
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    actionBar: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    syncButton: {
        backgroundColor: '#4caf50',
    },
    clearButton: {
        backgroundColor: '#ff3b30',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    queueItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    queueIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f0ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    queueContent: {
        flex: 1,
    },
    queueSender: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    queueMessage: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    queueTime: {
        fontSize: 12,
        color: '#999',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
});
