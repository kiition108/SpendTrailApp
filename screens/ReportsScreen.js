import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { BarChart, Grid, XAxis } from '../components/Charts';
import API from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReportsScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [weeklyData, setWeeklyData] = useState([]);
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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    const chartData = weeklyData.map(d => d.value);
    const chartLabels = weeklyData.map(d => d.dayName);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#A461D8', '#C193E8']} // Purple theme for Reports
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Weekly Report</Text>
                <Text style={styles.headerSubtitle}>Last 7 Days Overview</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Key Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="wallet-outline" size={24} color="#A461D8" />
                        <Text style={styles.statLabel}>Total Spent</Text>
                        <Text style={styles.statValue}>₹{stats.totalWeek.toFixed(0)}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="analytics-outline" size={24} color="#4ECDC4" />
                        <Text style={styles.statLabel}>Daily Avg</Text>
                        <Text style={styles.statValue}>₹{stats.avgDaily.toFixed(0)}</Text>
                    </View>
                </View>

                {/* Bar Chart Section */}
                <View style={styles.chartCard}>
                    <Text style={styles.cardTitle}>Spending Trend</Text>
                    <View style={{ height: 200, flexDirection: 'row' }}>
                        <BarChart
                            style={{ flex: 1 }}
                            data={chartData}
                            yAccessor={({ item }) => item}
                            svg={{ fill: '#A461D8' }}
                            contentInset={{ top: 10, bottom: 10 }}
                            spacingInner={0.4}
                            gridMin={0}
                            yMax={Math.max(...chartData) === 0 ? 100 : undefined}
                        >
                            <Grid />
                        </BarChart>
                    </View>
                    {/* Simple XAxis Label approximation using View since SVG XAxis needs more setup */}
                    <View style={styles.xAxisContainer}>
                        {chartLabels.map((label, index) => (
                            <Text key={index} style={styles.xAxisLabel}>{label}</Text>
                        ))}
                    </View>
                </View>

                {/* Insight Card */}
                <View style={styles.insightCard}>
                    <View style={styles.insightHeader}>
                        <Ionicons name="bulb-outline" size={24} color="#FFB84D" />
                        <Text style={styles.insightTitle}>Spending Insight</Text>
                    </View>
                    <Text style={styles.insightText}>
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
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: '#fff',
        flex: 1,
        padding: 16,
        borderRadius: 20,
        marginHorizontal: 5,
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
        fontSize: 20,
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
