import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Card, Title, Paragraph, Chip, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useDeliveries, useUsers } from '../../services/queries';

export default function DeliveryListScreen() {
    const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('all');
    const theme = useTheme();
    const router = useRouter();

    const { data: deliveries = [] } = useDeliveries();
    const { data: users = [] } = useUsers();

    const userMap = users.reduce((acc, user) => {
        if (user.id) acc[user.id] = user;
        return acc;
    }, {} as Record<number, typeof users[0]>);

    const filteredDeliveries = deliveries.filter(delivery => {
        if (filter === 'all') return true;
        return delivery.status.toLowerCase() === filter;
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.filters}>
                <Chip
                    selected={filter === 'all'}
                    onPress={() => setFilter('all')}
                    style={styles.chip}
                >
                    All
                </Chip>
                <Chip
                    selected={filter === 'pending'}
                    onPress={() => setFilter('pending')}
                    style={styles.chip}
                >
                    Pending
                </Chip>
                <Chip
                    selected={filter === 'delivered'}
                    onPress={() => setFilter('delivered')}
                    style={styles.chip}
                >
                    Delivered
                </Chip>
            </View>

            <FlatList
                data={filteredDeliveries}
                keyExtractor={(item) => item.id?.toString() || ''}
                renderItem={({ item }) => (
                    <Card
                        style={styles.card}
                        mode="elevated"
                        onPress={() => router.push(`/deliveries/${item.id}`)}
                    >
                        <Card.Content>
                            <Title>{userMap[item.user_id]?.name || 'Unknown User'}</Title>
                            <Paragraph>Date: {new Date(item.date).toLocaleDateString()}</Paragraph>
                            <Paragraph>Total: ${item.total_amount.toFixed(2)}</Paragraph>
                            <Paragraph>Status: {item.status}</Paragraph>
                            {item.notes ? <Paragraph>Notes: {item.notes}</Paragraph> : null}
                        </Card.Content>
                    </Card>
                )}
                contentContainerStyle={styles.list}
            />
            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => router.push('/deliveries/form')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filters: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    chip: {
        marginRight: 8,
    },
    list: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 12,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
