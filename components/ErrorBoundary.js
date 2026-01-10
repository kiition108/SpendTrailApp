import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // If Sentry is available, log the error
        if (global.Sentry) {
            global.Sentry.captureException(error, { contexts: { errorInfo } });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
                    <Text style={styles.title}>Oops! Something went wrong</Text>
                    <Text style={styles.message}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </Text>

                    {this.props.onReset && (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                this.setState({ hasError: false, error: null });
                                this.props.onReset?.();
                            }}
                        >
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    )}

                    {this.props.navigation && (
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={() => this.props.navigation.goBack()}
                        >
                            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Go Back</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#333',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: '#667eea',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 8,
        marginTop: 10,
        minWidth: 200,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#667eea',
    },
    secondaryButtonText: {
        color: '#667eea',
    },
});

export default ErrorBoundary;
