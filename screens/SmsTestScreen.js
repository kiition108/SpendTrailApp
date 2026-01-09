import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import API from '../services/api';
import { getCurrentCoordinates } from '../utils/location';
import { SMS_WEBHOOK_KEY } from '../config/constants';

export default function SmsTestScreen({ navigation }) {
    const [message, setMessage] = useState('');
    const [sender, setSender] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Sample SMS messages for quick testing
    const sampleMessages = [
        {
            label: 'Debit Transaction',
            message: 'Rs 450.00 debited from A/c XX1234 on 09-Jan-26 to Swiggy via UPI. Avl Bal: Rs 5,234.50',
            sender: 'VM-HDFC'
        },
        {
            label: 'Credit Transaction',
            message: 'Rs 1,250.50 credited to A/c XX5678 on 09-Jan-26 via UPI from John Doe. Avl Bal: Rs 8,432.10',
            sender: 'VM-ICICI'
        },
        {
            label: 'Food Purchase',
            message: 'INR 385 spent at Dominos Pizza via card XX9876 on 09-Jan-26. Available limit: Rs 45,000',
            sender: 'VM-SBI'
        },
        {
            label: 'UPI Payment',
            message: 'You paid Rs.299.00 to Amazon Pay via UPI on 09-Jan-26 at 6:30 PM',
            sender: 'VM-PAYTM'
        },
    ];

    const handleSendSms = async () => {
        if (!message.trim()) {
            Alert.alert('Error', 'Please enter an SMS message');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            // Get current location
            const location = await getCurrentCoordinates();

            const payload = {
                message: message.trim(),
                sender: sender.trim() || 'TEST-SENDER',
                receivedAt: new Date().toISOString(),
                lat: location?.lat || null,
                lng: location?.lng || null,
            };

            console.log('Sending SMS webhook:', payload);

            // Include the API key in headers
            const response = await API.post('/smswebhook', payload, {
                headers: {
                    'x-api-key': SMS_WEBHOOK_KEY,
                }
            });

            setResult({
                success: true,
                data: response.data,
                status: response.status
            });

            Alert.alert('Success', 'SMS parsed successfully!');
        } catch (error) {
            console.error('SMS webhook error:', error);
            setResult({
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status
            });
            Alert.alert('Error', error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadSample = (sample) => {
        setMessage(sample.message);
        setSender(sample.sender);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>SMS Webhook Tester</Text>
                <Text style={styles.headerSubtitle}>Test transaction parsing from SMS</Text>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Sample Messages */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Test Samples</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {sampleMessages.map((sample, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.sampleChip}
                                onPress={() => loadSample(sample)}
                            >
                                <Text style={styles.sampleLabel}>{sample.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Input Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>SMS Message *</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Enter SMS message to parse..."
                        placeholderTextColor="#999"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Sender (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., VM-HDFC, VM-ICICI"
                        placeholderTextColor="#999"
                        value={sender}
                        onChangeText={setSender}
                    />
                </View>

                {/* Send Button */}
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendSms}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.buttonGradient}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="send" size={20} color="#fff" />
                                <Text style={styles.buttonText}>Parse SMS</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Result Display */}
                {result && (
                    <View style={styles.resultSection}>
                        <View style={[styles.resultHeader, result.success ? styles.successHeader : styles.errorHeader]}>
                            <Ionicons
                                name={result.success ? 'checkmark-circle' : 'close-circle'}
                                size={24}
                                color="#fff"
                            />
                            <Text style={styles.resultTitle}>
                                {result.success ? 'Parse Successful' : 'Parse Failed'}
                            </Text>
                        </View>

                        <View style={styles.resultContent}>
                            {result.success ? (
                                <>
                                    <Text style={styles.resultLabel}>Transaction Created:</Text>
                                    <View style={styles.resultData}>
                                        <Text style={styles.resultText}>
                                            Amount: {result.data.transaction?.amount < 0 ? '+' : '-'}₹{Math.abs(result.data.transaction?.amount)}
                                        </Text>
                                        <Text style={styles.resultText}>Merchant: {result.data.transaction?.merchant}</Text>
                                        <Text style={styles.resultText}>Category: {result.data.transaction?.category}</Text>
                                        <Text style={styles.resultText}>Type: {result.data.transaction?.source}</Text>
                                        {result.data.duplicate && (
                                            <Text style={styles.duplicateText}>⚠️ Duplicate Detected</Text>
                                        )}
                                    </View>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.resultLabel}>Error Details:</Text>
                                    <View style={styles.resultData}>
                                        <Text style={styles.errorText}>
                                            {typeof result.error === 'string' ? result.error : result.error?.error || 'Unknown error'}
                                        </Text>
                                        <Text style={styles.statusText}>Status: {result.status}</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                )}

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Ionicons name="information-circle" size={20} color="#667eea" />
                    <Text style={styles.infoText}>
                        This screen simulates SMS webhook calls to test transaction parsing.
                        Location data is automatically included from your current position.
                    </Text>
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
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    sampleChip: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    sampleLabel: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: '500',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    textArea: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    sendButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
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
    resultSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        gap: 10,
    },
    successHeader: {
        backgroundColor: '#4caf50',
    },
    errorHeader: {
        backgroundColor: '#f44336',
    },
    resultTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultContent: {
        padding: 15,
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 10,
    },
    resultData: {
        gap: 8,
    },
    resultText: {
        fontSize: 14,
        color: '#333',
    },
    errorText: {
        fontSize: 14,
        color: '#f44336',
    },
    statusText: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
    duplicateText: {
        fontSize: 14,
        color: '#ff9800',
        fontWeight: 'bold',
        marginTop: 5,
    },
    infoSection: {
        flexDirection: 'row',
        backgroundColor: '#e3f2fd',
        padding: 15,
        borderRadius: 12,
        gap: 10,
        marginBottom: 20,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
});
