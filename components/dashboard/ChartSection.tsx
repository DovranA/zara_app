import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { BarChart } from "react-native-chart-kit";

interface Product {
    name: string;
    stock: number;
    // Add other properties if needed, but for this component these are enough
    [key: string]: any;
}

interface ChartSectionProps {
    products: Product[];
}

const screenWidth = Dimensions.get("window").width;

export default function ChartSection({ products }: ChartSectionProps) {
    if (products.length === 0) {
        return null;
    }

    // Top products by stock
    const topProducts = [...products].sort((a, b) => b.stock - a.stock).slice(0, 5);

    const barChartData = {
        labels: topProducts.map((p) => p.name.substring(0, 8)),
        datasets: [
            {
                data: topProducts.length > 0 ? topProducts.map((p) => p.stock) : [0],
            },
        ],
    };

    const chartConfig = {
        backgroundColor: "#ffffff",
        backgroundGradientFrom: "#ffffff",
        backgroundGradientTo: "#ffffff",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#667eea",
        },
    };

    return (
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
    );
}

const styles = StyleSheet.create({
    chartSection: {
        marginTop: 24,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2d3436",
        marginBottom: 16,
    },
    chartCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
    },
    chart: {
        borderRadius: 16,
    },
});
