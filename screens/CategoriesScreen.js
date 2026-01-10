import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { PieChart } from '../components/Charts';
import API from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { categoryColors } from '../utils/categoryColors';

export default function CategoriesScreen({ navigation }) {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [categoryData, setCategoryData] = useState([]);
    const [totalExpense, setTotalExpense] = useState(0);



    useEffect(() => {
        fetchCategoryData();
    }, []);

    const fetchCategoryData = async () => {
        try {
            const res = await API.get('/transactions/user');
            const transactions = res.data.transactions;

            // Calculate totals by category
            const totals = {};
            let grandTotal = 0;

            transactions.forEach(txn => {
                const amount = Math.abs(txn.amount);
                if (amount > 0) {
                    const cat = txn.category || 'Uncategorized';
                    if (!totals[cat]) totals[cat] = 0;
                    totals[cat] += amount;
                    grandTotal += amount;
                }
            });

            // Format for chart
            const formattedData = Object.keys(totals).map(key => ({
                key,
                value: totals[key],
                svg: { fill: categoryColors[key] || categoryColors.Other },
                arc: { outerRadius: '100%', cornerRadius: 3, }
            })).sort((a, b) => b.value - a.value);

            setCategoryData(formattedData);
            setTotalExpense(grandTotal);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient
                colors={theme.gradientColors}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Spending by Category</Text>
                <Text style={styles.headerSubtitle}>Total Expenses: ₹{totalExpense.toFixed(2)}</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Pie Chart Section */}
                <View style={[styles.chartCard, { backgroundColor: theme.backgroundCard }]}>
                    {categoryData.length > 0 ? (
                        <PieChart
                            style={{ height: 200, width: '100%' }}
                            data={categoryData}
                            valueAccessor={({ item }) => item.value}
                            innerRadius={'45%'}
                            padAngle={0.02}
                        />
                    ) : (
                        <View style={styles.emptyChart}>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No expense data available</Text>
                        </View>
                    )}
                </View>

                {/* Category List */}
                <View style={styles.listContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Breakdown</Text>
                    {categoryData.map((item, index) => (
                        <View key={index} style={[styles.categoryItem, { backgroundColor: theme.backgroundCard }]}>
                            <View style={styles.catLeft}>
                                <View style={[styles.colorDot, { backgroundColor: item.svg.fill }]} />
                                <View>
                                    <Text style={[styles.catName, { color: theme.text }]}>{item.key}</Text>
                                    <Text style={[styles.catPercent, { color: theme.textSecondary }]}>
                                        {((item.value / totalExpense) * 100).toFixed(1)}%
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.catAmount, { color: theme.text }]}>₹{item.value.toFixed(2)}</Text>
                        </View>
                    ))}
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
    loadingContainer: {
        flex: 1,
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
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 5,
    },
    scrollContent: {
        padding: 20,
    },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyChart: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    },
    listContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    catLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    catName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    catPercent: {
        fontSize: 12,
        color: '#999',
    },
    catAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
});
