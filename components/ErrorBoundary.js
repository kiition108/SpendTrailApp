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
        // Log error to monitoring service (e.g., Sentry)
        console.error('Error Boundary caught:', error, errorInfo);

        // TODO: Send to error tracking service
        // Sentry.captureException(error, { extra: errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Ionicons name="alert-circle" size={64} color="#ff3b30" />
                    <Text style={styles.title}>Oops! Something went wrong</Text>
                    <Text style={styles.message}>
                        We're sorry for the inconvenience. The app encountered an unexpected error.
                    </Text>

                    {__DEV__ && this.state.error && (
                        <View style={styles.errorDetails}>
                            <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
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
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    errorDetails: {
        backgroundColor: '#ffebee',
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
        width: '100%',
    },
    errorText: {
        fontSize: 14,
        color: '#c62828',
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: '#667eea',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ErrorBoundary;
