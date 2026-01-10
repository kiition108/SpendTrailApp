import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { BarChart, Grid, XAxis, LineChart, PieChart } from '../components/Charts';
import API from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { getCategoryColor } from '../utils/categoryColors';

export default function ReportsScreen({ navigation }) {
    const { theme } = useTheme();

    // Local chart components
    const SparklineChart = ({ data }) => {
        const chartData = data || [0, 0, 0];
        return (
            <LineChart
                style={{ height: 80 }}
                data={chartData}
                svg={{ stroke: theme.success, strokeWidth: 3 }}
                contentInset={{ top: 10, bottom: 10 }}
                showValues={true}
            />
        );
    };

    const WeeklyBarChart = ({ data }) => {
        const chartData = data || [0, 0, 0, 0, 0, 0, 0];
        return (
            <BarChart
                style={{ height: 80 }}
                data={chartData}
                svg={{ fill: theme.primary }}
                contentInset={{ top: 10, bottom: 10 }}
                spacingInner={0.3}
                showValues={true}
            />
        );
    };
    const [loading, setLoading] = useState(true);
    const [weeklyData, setWeeklyData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [stats, setStats] = useState({
        totalWeek: 0,
        avgDaily: 0,
        highestDay: { day: '', amount: 0 },
    });

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            const res = await API.get('/transactions/user');
            const transactions = res.data.transactions;

            // Process last 7 days
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const last7Days = [];
            const today = new Date();

            for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                last7Days.push({
                    dateString: d.toDateString(),
                    dayName: days[d.getDay()],
                    value: 0
                });
            }

            let totalWeek = 0;
            let maxAmount = 0;
            let maxDay = '';

            transactions.forEach(txn => {
                const txnDate = new Date(txn.timestamp || txn.date).toDateString(); // Normalize date
                const dayEntry = last7Days.find(d => d.dateString === txnDate);
                if (dayEntry && txn.amount > 0) { // Only expenses
                    dayEntry.value += txn.amount;
                    totalWeek += txn.amount;
                }
            });

            // Process Category Data
            const catMap = {};
            transactions.forEach(txn => {
                if (txn.amount > 0) {
                    const cat = txn.category || 'Other';
                    catMap[cat] = (catMap[cat] || 0) + txn.amount;
                }
            });

            const pieData = Object.keys(catMap).map((cat) => ({
                key: cat,
                value: catMap[cat],
                svg: { fill: getCategoryColor(cat) },
                amount: catMap[cat]
            })).sort((a, b) => b.value - a.value).slice(0, 5); // Top 5 categories

            setCategoryData(pieData);

            // Calculate stats
            last7Days.forEach(d => {
                if (d.value > maxAmount) {
                    maxAmount = d.value;
                    maxDay = d.dayName;
                }
            });

            setWeeklyData(last7Days);
            setStats({
                totalWeek,
                avgDaily: totalWeek / 7,
                highestDay: { day: maxDay, amount: maxAmount }
            });

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

    const chartData = weeklyData.map(d => d.value);
    const chartLabels = weeklyData.map(d => d.dayName);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient
                colors={theme.gradientColors} // Purple theme for Reports
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Weekly Report</Text>
                <Text style={styles.headerSubtitle}>Last 7 Days Overview</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Summary Cards - Today & Week - Vertical Stack */}
                {/* Today's Card with Sparkline */}
                <View style={[styles.bigSummaryCard, { backgroundColor: theme.backgroundCard }]}>
                    <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>Today's Spend</Text>
                    <Text style={[styles.cardAmount, { color: theme.text }]}>₹{weeklyData.length > 0 ? weeklyData[weeklyData.length - 1].value.toFixed(0) : '0'}</Text>
                    <Text style={[styles.cardSub, { color: theme.textTertiary }]}>Actual today</Text>
                    <View style={styles.bigChartContainer}>
                        <SparklineChart data={weeklyData.slice(-3).map(d => d.value)} />
                    </View>
                </View>

                {/* This Week Card with Bar Chart */}
                <View style={[styles.bigSummaryCard, { backgroundColor: theme.backgroundCard }]}>
                    <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>This Week's Total</Text>
                    <Text style={[styles.cardAmount, { color: theme.text }]}>₹{stats.totalWeek.toFixed(0)}</Text>
                    <Text style={[styles.cardSub, { color: theme.textTertiary }]}>Last 7 days spending</Text>
                    <View style={styles.bigChartContainer}>
                        <WeeklyBarChart data={weeklyData.map(d => d.value)} />
                    </View>
                </View>

                {/* Key Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.backgroundCard }]}>
                        <Ionicons name="wallet-outline" size={24} color={theme.primary} />
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Spent</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>₹{stats.totalWeek.toFixed(0)}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.backgroundCard }]}>
                        <Ionicons name="analytics-outline" size={24} color={theme.info} />
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Daily Avg</Text>
                        <Text style={[styles.statValue, { color: theme.text }]}>₹{stats.avgDaily.toFixed(0)}</Text>
                    </View>
                </View>

                {/* Category Breakdown Section using PieChart */}
                <View style={[styles.chartCard, { backgroundColor: theme.backgroundCard }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Spend by Category</Text>
                    <View style={{ height: 220, flexDirection: 'row', alignItems: 'center' }}>
                        <PieChart
                            style={{ height: 200, width: 200 }}
                            data={categoryData}
                        />
                        {/* Legend */}
                        <View style={{ flex: 1, marginLeft: 20 }}>
                            {categoryData.map((cat, index) => (
                                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: cat.svg.fill, marginRight: 8 }} />
                                    <View>
                                        <Text style={{ fontSize: 12, color: theme.text, fontWeight: '600' }}>{cat.key}</Text>
                                        <Text style={{ fontSize: 10, color: theme.textSecondary }}>₹{cat.value.toFixed(0)}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Insight Card */}
                <View style={[styles.insightCard, { backgroundColor: theme.backgroundCard }]}>
                    <View style={styles.insightHeader}>
                        <Ionicons name="bulb-outline" size={24} color={theme.warning} />
                        <Text style={[styles.insightTitle, { color: theme.text }]}>Spending Insight</Text>
                    </View>
                    <Text style={[styles.insightText, { color: theme.textSecondary }]}>
                        Your highest spending day was <Text style={{ fontWeight: 'bold' }}>{stats.highestDay.day}</Text> with ₹{stats.highestDay.amount.toFixed(0)}.
                        {stats.totalWeek > stats.avgDaily * 7 * 1.5 ?
                            " This week's spending is higher than usual." :
                            " You're keeping your spending balanced this week."}
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
    cardScroll: {
        flexDirection: 'row',
        marginBottom: 20
    },
    summaryCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        marginRight: 12,
        width: 200,
        minHeight: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: '#667eea',
        overflow: 'hidden',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 4,
        color: '#333',
    },
    cardSub: {
        fontSize: 12,
        color: '#667eea',
        fontWeight: '600',
        marginBottom: 8,
    },
    chartContainer: {
        height: 60,
        marginTop: 8,
        overflow: 'hidden',
    },
    bigSummaryCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderLeftWidth: 4,
        borderLeftColor: '#667eea',
        overflow: 'hidden',
    },
    bigChartContainer: {
        height: 100,
        marginTop: 15,
        overflow: 'hidden',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: '#fff',
        width: '47%',
        padding: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        alignItems: 'center',
    },
    statLabel: {
        marginTop: 8,
        fontSize: 12,
        color: '#999',
        fontWeight: '600',
    },
    statValue: {
        marginTop: 4,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
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
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    xAxisContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 5,
    },
    xAxisLabel: {
        fontSize: 12,
        color: '#999',
    },
    insightCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: '#FFB84D',
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    insightText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
});
