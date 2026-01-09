import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { isAutoSyncEnabled, setAutoSyncEnabled } from '../services/smsService';
import { exportTransactionsToCSV } from '../utils/exportTransactions';

export default function SettingsScreen({ navigation }) {
    const [smsAutoSync, setSmsAutoSync] = useState(false);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const enabled = await isAutoSyncEnabled();
        setSmsAutoSync(enabled);
        setLoading(false);
    };

    const handleToggleSMSSync = async (value) => {
        if (value) {
            // Show explanation when enabling
            Alert.alert(
                'Enable SMS Auto-Sync?',
                'This will automatically detect transaction SMS from your banks and create transactions. Only transaction-related SMS will be processed.\n\nYou can disable this anytime.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Enable',
                        onPress: async () => {
                            const success = await setAutoSyncEnabled(true);
                            if (success) {
                                setSmsAutoSync(true);
                                Alert.alert('Enabled', 'SMS Auto-Sync is now active. Transaction SMS will be automatically processed.');
                            }
                        },
                    },
                ]
            );
        } else {
            const success = await setAutoSyncEnabled(false);
            if (success) {
                setSmsAutoSync(false);
                Alert.alert('Disabled', 'SMS Auto-Sync has been turned off.');
            }
        }
    };

    const handleExportTransactions = async () => {
        Alert.alert(
            'Export Transactions',
            'Export all your transactions to a CSV file?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Export',
                    onPress: async () => {
                        setExporting(true);
                        try {
                            const result = await exportTransactionsToCSV();

                            if (result.success) {
                                Alert.alert(
                                    'Success!',
                                    `Exported ${result.count} transactions to ${result.filename}`,
                                    [{ text: 'OK' }]
                                );
                            } else {
                                Alert.alert('Error', result.error || 'Failed to export transactions');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to export: ' + error.message);
                        } finally {
                            setExporting(false);
                        }
                    },
                },
            ]
        );
    };

    const openPermissionSettings = () => {
        Alert.alert(
            'SMS Permissions',
            'To enable SMS auto-sync, you need to grant SMS read permissions in your device settings.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open Settings',
                    onPress: () => {
                        Linking.openSettings();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <Text style={styles.headerSubtitle}>Configure your preferences</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* SMS Auto-Sync Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="mail" size={24} color="#667eea" />
                        <Text style={styles.sectionTitle}>SMS Auto-Sync</Text>
                    </View>

                    <View style={styles.settingCard}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Enable SMS Sync</Text>
                                <Text style={styles.settingDescription}>
                                    Automatically create transactions from bank SMS
                                </Text>
                            </View>
                            <Switch
                                value={smsAutoSync}
                                onValueChange={handleToggleSMSSync}
                                trackColor={{ false: '#e0e0e0', true: '#667eea' }}
                                thumbColor={smsAutoSync ? '#fff' : '#f4f3f4'}
                                disabled={loading}
                            />
                        </View>

                        {smsAutoSync && (
                            <View style={styles.enabledInfo}>
                                <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                                <Text style={styles.enabledText}>Active - Monitoring SMS messages</Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity style={styles.helpCard} onPress={openPermissionSettings}>
                        <Ionicons name="shield-checkmark-outline" size={20} color="#667eea" />
                        <View style={styles.helpContent}>
                            <Text style={styles.helpTitle}>SMS Permissions</Text>
                            <Text style={styles.helpText}>Manage SMS read permissions</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <View style={styles.infoCard}>
                        <Ionicons name="information-circle" size={20} color="#2196f3" />
                        <Text style={styles.infoText}>
                            Only transaction SMS from recognized banks (HDFC, ICICI, SBI, etc.) are
                            processed. Your privacy is protected - other messages are never sent to our
                            servers.
                        </Text>
                    </View>
                </View>

                {/* Test Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="flask" size={24} color="#667eea" />
                        <Text style={styles.sectionTitle}>Testing & Debug</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('SmsTest')}
                    >
                        <View style={styles.actionIcon}>
                            <Ionicons name="mail-outline" size={24} color="#667eea" />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Test SMS Parsing</Text>
                            <Text style={styles.actionDescription}>
                                Test how your bank SMS will be parsed
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('ImportTransactions')}
                    >
                        <View style={styles.actionIcon}>
                            <Ionicons name="cloud-upload-outline" size={24} color="#667eea" />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Import Transactions</Text>
                            <Text style={styles.actionDescription}>
                                Upload CSV file to bulk import transactions
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={handleExportTransactions}
                        disabled={exporting}
                    >
                        <View style={styles.actionIcon}>
                            <Ionicons name="cloud-download-outline" size={24} color="#4caf50" />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>
                                {exporting ? 'Exporting...' : 'Export Transactions'}
                            </Text>
                            <Text style={styles.actionDescription}>
                                Download all transactions as CSV file
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="information-circle" size={24} color="#667eea" />
                        <Text style={styles.sectionTitle}>About</Text>
                    </View>

                    <View style={styles.aboutCard}>
                        <Text style={styles.aboutLabel}>App Version</Text>
                        <Text style={styles.aboutValue}>1.0.0</Text>
                    </View>

                    <View style={styles.aboutCard}>
                        <Text style={styles.aboutLabel}>Build</Text>
                        <Text style={styles.aboutValue}>Development</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    settingCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 13,
        color: '#666',
    },
    enabledInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        gap: 8,
    },
    enabledText: {
        fontSize: 13,
        color: '#4caf50',
        fontWeight: '500',
    },
    helpCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        gap: 12,
    },
    helpContent: {
        flex: 1,
    },
    helpTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    helpText: {
        fontSize: 13,
        color: '#666',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        gap: 12,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f0ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    actionDescription: {
        fontSize: 13,
        color: '#666',
    },
    aboutCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    aboutLabel: {
        fontSize: 15,
        color: '#666',
    },
    aboutValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
});
