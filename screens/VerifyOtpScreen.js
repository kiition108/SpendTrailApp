import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function VerifyOtpScreen({ route, navigation }) {
    const { verifyOtp, resendOtp } = useContext(AuthContext);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const email = route.params?.email;

    useEffect(() => {
        if (!email) {
            Alert.alert('Error', 'Email not provided');
            navigation.goBack();
        }
    }, [email]);

    const handleVerify = async () => {
        if (!otp || otp.length < 4) {
            Alert.alert('Error', 'Please enter valid OTP');
            return;
        }
        setLoading(true);
        const res = await verifyOtp(email, otp);
        setLoading(false);
        if (res.success) {
            // Success response usually means token is set and AppNavigator will switch stack
            // If not, we can navigate to Login
            Alert.alert('Success', 'Email verified successfully!');
        } else {
            Alert.alert('Verification Failed', res.message);
        }
    };

    const handleResend = async () => {
        const res = await resendOtp(email);
        if (res.success) {
            Alert.alert('Sent', 'OTP resent successfully');
        } else {
            Alert.alert('Error', res.message);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
                <View style={styles.content}>
                    <View style={styles.card}>
                        <Text style={styles.title}>Verify Email</Text>
                        <Text style={styles.subtitle}>Enter the code sent to {email}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="OTP Code"
                            placeholderTextColor="#ccc"
                            keyboardType="number-pad"
                            maxLength={6}
                            value={otp}
                            onChangeText={setOtp}
                        />

                        <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.buttonGradient}
                            >
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify</Text>}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleResend} style={styles.resendLink}>
                            <Text style={styles.resendText}>Resend OTP</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 10 }}>
                            <Text style={{ color: '#999' }}>Back to Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1, justifyContent: 'center', padding: 20 },
    content: { alignItems: 'center' },
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
    input: {
        width: '100%',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 15,
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: 5,
        fontWeight: 'bold',
        color: '#333'
    },
    button: { width: '100%', borderRadius: 10, overflow: 'hidden', marginBottom: 15 },
    buttonGradient: { padding: 15, alignItems: 'center' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    resendLink: { padding: 10 },
    resendText: { color: '#667eea', fontWeight: 'bold' }
});
