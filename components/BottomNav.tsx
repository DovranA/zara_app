import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter, usePathname } from 'expo-router';

export default function BottomNav() {
    const theme = useTheme();
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', path: '/', icon: '🏠' },
        { label: 'Users', path: '/users', icon: '👥' },
        { label: 'Products', path: '/products', icon: '📦' },
        { label: 'Deliveries', path: '/deliveries', icon: '🚚' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outline, display: pathname.includes("form") ? "none" : "flex" }]}>
            {navItems.map((item) => {
                const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
                return (
                    <TouchableOpacity
                        key={item.path}
                        style={styles.navItem}
                        onPress={() => router.push(item.path as any)}
                    >
                        <Text style={styles.icon}>{item.icon}</Text>
                        <Text
                            style={[
                                styles.label,
                                { color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant },
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        paddingBottom: 10
    },
    navItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    icon: {
        fontSize: 20,
        marginBottom: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
    },
});
