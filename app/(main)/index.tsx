import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useUsers, useProducts } from "../../services/queries";
import StatsGrid from "../../components/dashboard/StatsGrid";
import ChartSection from "../../components/dashboard/ChartSection";
import QuickActions from "../../components/dashboard/QuickActions";

export default function DashboardScreen() {
  const theme = useTheme();
  const router = useRouter();

  const { data: users = [] } = useUsers();
  const { data: products = [] } = useProducts();

  const stats = [
    { label: "Total Users", value: users.length, color: "#667eea", icon: "👥" },
    { label: "Products", value: products.length, color: "#f093fb", icon: "📦" },
  ];

  const quickActions = [
    {
      title: "Users",
      icon: "👥",
      route: "/users",
      gradient: ["#667eea", "#764ba2"],
    },
    {
      title: "Products",
      icon: "📦",
      route: "/products",
      gradient: ["#f093fb", "#f5576c"],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome Back! 👋</Text>
        <Text style={styles.subtitle}>Here's what's happening today</Text>
      </View>

      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Top Products Bar Chart */}

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />
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
    fontWeight: "bold",
    color: "#2d3436",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#636e72",
  },
});
