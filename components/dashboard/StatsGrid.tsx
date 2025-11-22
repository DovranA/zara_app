import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Surface } from "react-native-paper";

interface Stat {
  label: string;
  value: number | string;
  color: string;
  icon: string;
}

interface StatsGridProps {
  stats: Stat[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <View style={styles.statsGrid}>
      {stats.map((stat, index) => (
        <Surface
          key={index}
          style={[styles.statCard, { backgroundColor: stat.color }]}
          elevation={3}
        >
          <Text style={styles.statIcon}>{stat.icon}</Text>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </Surface>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
});
