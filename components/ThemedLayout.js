import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemedLayout - A reusable layout component that automatically applies theme styling
 * 
 * Usage:
 * <ThemedLayout>
 *   <Text>Your content here</Text>
 * </ThemedLayout>
 * 
 * Props:
 * - children: Content to render
 * - scrollable: Whether to use ScrollView (default: true)
 * - style: Additional styles to apply
 */
export default function ThemedLayout({ children, scrollable = true, style, contentContainerStyle }) {
    const { theme } = useTheme();

    const containerStyle = [
        styles.container,
        { backgroundColor: theme.background },
        style
    ];

    if (scrollable) {
        return (
            <ScrollView
                style={containerStyle}
                contentContainerStyle={contentContainerStyle}
                showsVerticalScrollIndicator={false}
            >
                {children}
            </ScrollView>
        );
    }

    return (
        <View style={containerStyle}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
