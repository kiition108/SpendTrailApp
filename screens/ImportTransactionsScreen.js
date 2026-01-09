import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import API from '../services/api';

export default function ImportTransactionsScreen({ navigation }) {
    const [file, setFile] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [importing, setImporting] = useState(false);
    const [parsing, setParsing] = useState(false);

    /**
     * Parse CSV content into transaction objects
     */
    const parseCSV = (csvText) => {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

        const transactions = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());

            if (values.length < headers.length) continue; // Skip invalid rows

            const txn = {};
            headers.forEach((header, index) => {
                txn[header] = values[index];
            });

            // Map CSV fields to our schema
            const transaction = {
                amount: parseFloat(txn.amount || txn.Amount || 0),
                merchant: txn.merchant || txn.Merchant || txn.description || 'Unknown',
                category: txn.category || txn.Category || 'Other',
                note: txn.note || txn.Note || txn.description || '',
                paymentMethod: (txn.paymentmethod || txn.payment_method || txn.PaymentMethod || 'other').toLowerCase(),
                timestamp: txn.date || txn.Date || txn.timestamp || new Date().toISOString(),
                source: 'import',
            };

            // Add location if provided
            if (txn.lat && txn.lng) {
                transaction.location = {
                    lat: parseFloat(txn.lat),
                    lng: parseFloat(txn.lng),
                    address: txn.address || '',
                    city: txn.city || '',
                    country: txn.country || '',
                };
            }

            transactions.push(transaction);
        }

        return transactions;
    };

    /**
     * Pick CSV file
     */
    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const selectedFile = result.assets[0];
            setFile(selectedFile);

            // Read and parse CSV
            setParsing(true);
            try {
                const response = await fetch(selectedFile.uri);
                const csvText = await response.text();
                const parsed = parseCSV(csvText);

                if (parsed.length === 0) {
                    Alert.alert('Error', 'No valid transactions found in CSV');
                    setFile(null);
                    return;
                }

                setTransactions(parsed);
                Alert.alert('Success', `Parsed ${parsed.length} transactions from CSV`);
            } catch (error) {
                Alert.alert('Error', 'Failed to parse CSV file: ' + error.message);
                setFile(null);
            } finally {
                setParsing(false);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick file: ' + error.message);
        }
    };

    /**
     * Import transactions to backend
     */
    const handleImport = async () => {
        if (transactions.length === 0) {
            Alert.alert('Error', 'No transactions to import');
            return;
        }

        Alert.alert(
            'Confirm Import',
            `Import ${transactions.length} transactions?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Import',
                    onPress: async () => {
                        setImporting(true);
                        try {
                            const response = await API.post('/transactions/import', transactions);
                            Alert.alert(
                                'Success!',
                                `${response.data.length} transactions imported successfully`,
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => navigation.goBack(),
                                    },
                                ]
                            );
                            setFile(null);
                            setTransactions([]);
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.error || error.message);
                        } finally {
                            setImporting(false);
                        }
                    },
                },
            ]
        );
    };

    /**
     * Clear selected file
     */
    const handleClear = () => {
        setFile(null);
        setTransactions([]);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Import Transactions</Text>
                <Text style={styles.headerSubtitle}>Upload CSV file to bulk import</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Instructions */}
                <View style={styles.instructionsCard}>
                    <Ionicons name="information-circle" size={24} color="#667eea" />
                    <View style={styles.instructionsContent}>
                        <Text style={styles.instructionsTitle}>CSV Format Required</Text>
                        <Text style={styles.instructionsText}>
                            Your CSV file should have headers: amount, merchant, category, date
                            {'\n'}Optional: paymentMethod, note, lat, lng, address
                        </Text>
                    </View>
                </View>

                {/* Sample CSV */}
                <View style={styles.sampleCard}>
                    <Text style={styles.sampleTitle}>📄 Sample CSV Format:</Text>
                    <View style={styles.codeBlock}>
                        <Text style={styles.codeText}>
                            amount,merchant,category,date,paymentMethod{'\n'}
                            450.50,Swiggy,Food,2026-01-09,upi{'\n'}
                            1200,Amazon,Shopping,2026-01-08,card{'\n'}
                            -5000,Salary,Income,2026-01-01,other
                        </Text>
                    </View>
                </View>

                {/* File Picker */}
                {!file ? (
                    <TouchableOpacity style={styles.uploadCard} onPress={handlePickFile} disabled={parsing}>
                        <View style={styles.uploadIcon}>
                            <Ionicons name="cloud-upload-outline" size={48} color="#667eea" />
                        </View>
                        <Text style={styles.uploadTitle}>
                            {parsing ? 'Parsing CSV...' : 'Select CSV File'}
                        </Text>
                        <Text style={styles.uploadSubtitle}>
                            Tap to browse for CSV file
                        </Text>
                        {parsing && <ActivityIndicator color="#667eea" style={{ marginTop: 10 }} />}
                    </TouchableOpacity>
                ) : (
                    <View style={styles.fileCard}>
                        <View style={styles.fileHeader}>
                            <Ionicons name="document-text" size={24} color="#4caf50" />
                            <View style={styles.fileInfo}>
                                <Text style={styles.fileName}>{file.name}</Text>
                                <Text style={styles.fileSize}>
                                    {transactions.length} transactions ready to import
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleClear}>
                                <Ionicons name="close-circle" size={24} color="#ff3b30" />
                            </TouchableOpacity>
                        </View>

                        {/* Preview */}
                        <View style={styles.previewSection}>
                            <Text style={styles.previewTitle}>Preview (First 3):</Text>
                            {transactions.slice(0, 3).map((txn, index) => (
                                <View key={index} style={styles.previewItem}>
                                    <Text style={styles.previewAmount}>
                                        {txn.amount < 0 ? '+' : '-'}₹{Math.abs(txn.amount)}
                                    </Text>
                                    <Text style={styles.previewMerchant}>{txn.merchant}</Text>
                                    <Text style={styles.previewCategory}>{txn.category}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Import Button */}
                        <TouchableOpacity
                            style={styles.importButton}
                            onPress={handleImport}
                            disabled={importing}
                        >
                            <LinearGradient
                                colors={['#4caf50', '#45a049']}
                                style={styles.buttonGradient}
                            >
                                {importing ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="download" size={20} color="#fff" />
                                        <Text style={styles.buttonText}>
                                            Import {transactions.length} Transactions
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Tips */}
                <View style={styles.tipsCard}>
                    <Text style={styles.tipsTitle}>💡 Tips:</Text>
                    <Text style={styles.tipText}>• Amounts should be positive for expenses, negative for income</Text>
                    <Text style={styles.tipText}>• Date format: YYYY-MM-DD or ISO 8601</Text>
                    <Text style={styles.tipText}>• Payment methods: cash, card, upi, wallet, other</Text>
                    <Text style={styles.tipText}>• Category should match existing categories</Text>
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
    instructionsCard: {
        flexDirection: 'row',
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        gap: 12,
    },
    instructionsContent: {
        flex: 1,
    },
    instructionsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    instructionsText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    sampleCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sampleTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    codeBlock: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#667eea',
    },
    codeText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#333',
        lineHeight: 18,
    },
    uploadCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderStyle: 'dashed',
        marginBottom: 20,
    },
    uploadIcon: {
        marginBottom: 16,
    },
    uploadTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    uploadSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    fileCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    fileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    fileSize: {
        fontSize: 13,
        color: '#4caf50',
        marginTop: 2,
    },
    previewSection: {
        marginBottom: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
    },
    previewItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    previewAmount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        width: 80,
    },
    previewMerchant: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    previewCategory: {
        fontSize: 13,
        color: '#667eea',
        fontWeight: '500',
    },
    importButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    tipsCard: {
        backgroundColor: '#fff3cd',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    tipsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#856404',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: '#856404',
        marginBottom: 4,
        lineHeight: 18,
    },
});
