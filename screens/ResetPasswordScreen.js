import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';

export default function ResetPasswordScreen({ navigation, route }) {
    const { theme } = useTheme();
    const { email } = route.params || {};

    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!otp || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await API.post('/auth/reset-password', {
                email,
                otp,
                newPassword
            });

            Alert.alert(
                'Success',
                res.data.message || 'Password reset successful!',
                [
                    {
                        text: 'Login Now',
                        onPress: () => navigation.navigate('Login')
                    }
                ]
            );
        } catch (error) {
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to reset password. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.gradient}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    {/* Icon Section */}
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="key" size={60} color="#fff" />
                        </View>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>
                            Enter the OTP sent to your email and your new password
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={[styles.formContainer, { backgroundColor: theme.backgroundCard }]}>

                        {/* OTP Input */}
                        <Text style={[styles.label, { color: theme.text }]}>Verification Code</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} style={styles.inputIcon} />
                            <TextInput
                                placeholder="Enter 6-digit OTP"
                                placeholderTextColor={theme.textTertiary}
                                value={otp}
                                onChangeText={setOtp}
                                style={[styles.input, { color: theme.text }]}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                        </View>

                        {/* New Password Input */}
                        <Text style={[styles.label, { color: theme.text }]}>New Password</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.primary} style={styles.inputIcon} />
                            <TextInput
                                placeholder="Enter new password"
                                placeholderTextColor={theme.textTertiary}
                                secureTextEntry={!showPassword}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                style={[styles.input, { color: theme.text }]}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color={theme.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password Input */}
                        <Text style={[styles.label, { color: theme.text }]}>Confirm Password</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.primary} style={styles.inputIcon} />
                            <TextInput
                                placeholder="Confirm new password"
                                placeholderTextColor={theme.textTertiary}
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                style={[styles.input, { color: theme.text }]}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons
                                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color={theme.textSecondary}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.resetButton, { opacity: loading ? 0.6 : 1 }]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={[theme.primary, theme.primaryDark]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </Text>
                                {!loading && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.backToLogin}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Ionicons name="arrow-back" size={16} color={theme.primary} />
                            <Text style={[styles.backToLoginText, { color: theme.primary }]}>
                                Back to Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 60,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
    },
    resetButton: {
        marginTop: 20,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonGradient: {
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backToLogin: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        gap: 6,
    },
    backToLoginText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
