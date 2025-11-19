import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useUsers, useProducts, useDeliveries } from '../services/queries';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
    const theme = useTheme();
    const router = useRouter();

    const { data: users = [] } = useUsers();
    const { data: products = [] } = useProducts();
    const { data: deliveries = [] } = useDeliveries();

    const pendingDeliveries = deliveries.filter(d => d.status.toLowerCase() === 'pending').length;
    const deliveredCount = deliveries.filter(d => d.status.toLowerCase() === 'delivered').length;

    const stats = [
        { label: 'Total Users', value: users.length, color: '#667eea', icon: '👥' },
        { label: 'Products', value: products.length, color: '#f093fb', icon: '📦' },
        { label: 'Pending', value: pendingDeliveries, color: '#4facfe', icon: '⏳' },
        { label: 'Delivered', value: deliveredCount, color: '#43e97b', icon: '✅' },
    ];

    const quickActions = [
        { title: 'Users', icon: '👥', route: '/users', gradient: ['#667eea', '#764ba2'] },
        { title: 'Products', icon: '📦', route: '/products', gradient: ['#f093fb', '#f5576c'] },
        { title: 'Deliveries', icon: '🚚', route: '/deliveries', gradient: ['#4facfe', '#00f2fe'] },
    ];

    // Prepare chart data
    const deliveryStatusData = [
        {
            name: 'Pending',
            count: pendingDeliveries,
            color: '#4facfe',
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
        },
        {
            name: 'Delivered',
            count: deliveredCount,
            color: '#43e97b',
            legendFontColor: '#7F7F7F',
            legendFontSize: 12,
        },
    ];

    // Get last 7 days of deliveries
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
    });

    const deliveriesPerDay = last7Days.map(date => {
        return deliveries.filter(d => d.date.startsWith(date)).length;
    });

    const lineChartData = {
        labels: last7Days.map(d => new Date(d).getDate().toString()),
        datasets: [{
            data: deliveriesPerDay.length > 0 ? deliveriesPerDay : [0],
            color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
            strokeWidth: 3,
        }],
    };

    // Top products by stock
    const topProducts = products
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 5);

    const barChartData = {
        labels: topProducts.map(p => p.name.substring(0, 8)),
        datasets: [{
            data: topProducts.length > 0 ? topProducts.map(p => p.stock) : [0],
        }],
    };

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#667eea',
        },
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: '#f8f9fa' }]}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Welcome Back! 👋</Text>
                <Text style={styles.subtitle}>Here's what's happening today</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <Surface key={index} style={[styles.statCard, { backgroundColor: stat.color }]} elevation={3}>
                        <Text style={styles.statIcon}>{stat.icon}</Text>
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </Surface>
                ))}
            </View>

            {/* Delivery Status Pie Chart */}
            {deliveries.length > 0 && (
                <View style={styles.chartSection}>
                    <Text style={styles.sectionTitle}>Delivery Status</Text>
                    <Surface style={styles.chartCard} elevation={2}>
                        <PieChart
                            data={deliveryStatusData}
                            width={screenWidth - 64}
                            height={200}
                            chartConfig={chartConfig}
                            accessor="count"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            absolute
                        />
                    </Surface>
                </View>
            )}

            {/* Deliveries Trend Line Chart */}
            {deliveries.length > 0 && (
                <View style={styles.chartSection}>
                    <Text style={styles.sectionTitle}>Deliveries (Last 7 Days)</Text>
                    <Surface style={styles.chartCard} elevation={2}>
                        <LineChart
                            data={lineChartData}
                            width={screenWidth - 64}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    </Surface>
                </View>
            )}

            {/* Top Products Bar Chart */}
            {products.length > 0 && (
                <View style={styles.chartSection}>
                    <Text style={styles.sectionTitle}>Top Products by Stock</Text>
                    <Surface style={styles.chartCard} elevation={2}>
                        <BarChart
                            data={barChartData}
                            width={screenWidth - 64}
                            height={220}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(240, 147, 251, ${opacity})`,
                            }}
                            style={styles.chart}
                            yAxisLabel=""
                            yAxisSuffix=""
                        />
                    </Surface>
                </View>
            )}

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsGrid}>
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => router.push(action.route as any)}
                            style={styles.actionCard}
                        >
                            <View style={[styles.actionGradient, { backgroundColor: action.gradient[0] }]}>
                                <Text style={styles.actionIcon}>{action.icon}</Text>
                                <Text style={styles.actionTitle}>{action.title}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Recent Deliveries */}
            {deliveries.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Deliveries</Text>
                    {deliveries.slice(0, 5).map((delivery) => (
                        <TouchableOpacity
                            key={delivery.id}
                            onPress={() => router.push(`/deliveries/${delivery.id}`)}
                            style={styles.deliveryCard}
                        >
                            <View style={styles.deliveryLeft}>
                                <View style={[
                                    styles.statusDot,
                                    { backgroundColor: delivery.status.toLowerCase() === 'delivered' ? '#43e97b' : '#ffa502' }
                                ]} />
                                <View>
                                    <Text style={styles.deliveryId}>Delivery #{delivery.id}</Text>
                                    <Text style={styles.deliveryDate}>
                                        {new Date(delivery.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.deliveryRight}>
                                <Text style={styles.deliveryAmount}>${delivery.total_amount.toFixed(2)}</Text>
                                <Text style={[
                                    styles.deliveryStatus,
                                    { color: delivery.status.toLowerCase() === 'delivered' ? '#43e97b' : '#ffa502' }
                                ]}>
                                    {delivery.status}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <View style={{ height: 100 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 16,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#636e72',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
    },
    chartSection: {
        marginTop: 24,
        paddingHorizontal: 24,
    },
    chartCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
    },
    chart: {
        borderRadius: 16,
    },
    section: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 16,
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    actionCard: {
        flex: 1,
    },
    actionGradient: {
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
    },
    actionIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    deliveryCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    deliveryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    deliveryId: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2d3436',
        marginBottom: 2,
    },
    deliveryDate: {
        fontSize: 13,
        color: '#636e72',
    },
    deliveryRight: {
        alignItems: 'flex-end',
    },
    deliveryAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2d3436',
        marginBottom: 2,
    },
    deliveryStatus: {
        fontSize: 12,
        fontWeight: '600',
    },
});
