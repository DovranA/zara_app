import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';

interface QuickAction {
    title: string;
    icon: string;
    route: string;
    gradient: string[];
}

interface QuickActionsProps {
    actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
    const router = useRouter();

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                {actions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => router.push(action.route as any)}
                        style={styles.actionCard}
                    >
                        <View
                            style={[
                                styles.actionGradient,
                                { backgroundColor: action.gradient[0] },
                            ]}
                        >
                            <Text style={styles.actionIcon}>{action.icon}</Text>
                            <Text style={styles.actionTitle}>{action.title}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2d3436",
        marginBottom: 16,
    },
    actionsGrid: {
        flexDirection: "row",
        gap: 12,
    },
    actionCard: {
        flex: 1,
    },
    actionGradient: {
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120,
    },
    actionIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
    },
});
