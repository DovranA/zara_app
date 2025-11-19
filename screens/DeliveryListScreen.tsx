import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Card, Title, Paragraph, Chip, useTheme, Searchbar } from 'react-native-paper';
import { NavigationProp } from '@react-navigation/native';
import { dbService, Delivery, User } from '../services/database';

interface DeliveryListScreenProps {
    navigation: NavigationProp<any>;
}

export default function DeliveryListScreen({ navigation }: DeliveryListScreenProps) {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [users, setUsers] = useState<{ [key: number]: User }>({});
    const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('all');
    const theme = useTheme();

    useEffect(() => {
        loadData();
        const unsubscribe = navigation.addListener('focus', () => {
            loadData();
        });
        return unsubscribe;
    }, [navigation]);

    const loadData = async () => {
        const deliveryData = await dbService.getDeliveries();
        setDeliveries(deliveryData);

        const userData = await dbService.getUsers();
        const userMap: { [key: number]: User } = {};
        userData.forEach(user => {
            if (user.id) userMap[user.id] = user;
        });
        setUsers(userMap);
    };

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
                        onPress={() => navigation.navigate('DeliveryDetail', { deliveryId: item.id })}
                    >
                        <Card.Content>
                            <Title>{users[item.user_id]?.name || 'Unknown User'}</Title>
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
                onPress={() => navigation.navigate('DeliveryForm')}
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
