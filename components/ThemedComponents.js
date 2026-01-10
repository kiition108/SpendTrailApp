import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemedText - Text component that automatically uses theme text color
 * 
 * Usage:
 * <ThemedText>Hello World</ThemedText>
 * <ThemedText variant="secondary">Subtitle</ThemedText>
 * 
 * Props:
 * - variant: 'primary' | 'secondary' | 'tertiary' (default: 'primary')
 * - style: Additional styles
 */
export const ThemedText = ({ children, variant = 'primary', style, ...props }) => {
    const { theme } = useTheme();

    const colorMap = {
        primary: theme.text,
        secondary: theme.textSecondary,
        tertiary: theme.textTertiary,
    };

    return (
        <Text style={[{ color: colorMap[variant] }, style]} {...props}>
            {children}
        </Text>
    );
};

/**
 * ThemedCard - Card component with theme background
 * 
 * Usage:
 * <ThemedCard>
 *   <Text>Card content</Text>
 * </ThemedCard>
 */
export const ThemedCard = ({ children, style, ...props }) => {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: theme.backgroundCard,
                    shadowColor: theme.cardShadow,
                },
                style
            ]}
            {...props}
        >
            {children}
        </View>
    );
};

/**
 * ThemedView - Simple view with theme background
 */
export const ThemedView = ({ children, style, backgroundColor = 'background', ...props }) => {
    const { theme } = useTheme();

    const bgColor = theme[backgroundColor] || theme.background;

    return (
        <View style={[{ backgroundColor: bgColor }, style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
});
