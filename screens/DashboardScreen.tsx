import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, useTheme } from 'react-native-paper';
import { NavigationProp } from '@react-navigation/native';

interface DashboardScreenProps {
    navigation: NavigationProp<any>;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
    const theme = useTheme();

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Title style={styles.title}>Delivery Note Manager</Title>
                <Paragraph style={styles.subtitle}>Manage your deliveries efficiently</Paragraph>

                <Card style={styles.card} mode="elevated">
                    <Card.Content>
                        <Title>Users</Title>
                        <Paragraph>Manage customer information</Paragraph>
                    </Card.Content>
                    <Card.Actions>
                        <Button mode="contained" onPress={() => navigation.navigate('UserList')}>
                            View Users
                        </Button>
                    </Card.Actions>
                </Card>

                <Card style={styles.card} mode="elevated">
                    <Card.Content>
                        <Title>Products</Title>
                        <Paragraph>Manage product inventory</Paragraph>
                    </Card.Content>
                    <Card.Actions>
                        <Button mode="contained" onPress={() => navigation.navigate('ProductList')}>
                            View Products
                        </Button>
                    </Card.Actions>
                </Card>

                <Card style={styles.card} mode="elevated">
                    <Card.Content>
                        <Title>Deliveries</Title>
                        <Paragraph>Create and track delivery notes</Paragraph>
                    </Card.Content>
                    <Card.Actions>
                        <Button mode="contained" onPress={() => navigation.navigate('DeliveryList')}>
                            View Deliveries
                        </Button>
                    </Card.Actions>
                </Card>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
        opacity: 0.7,
    },
    card: {
        marginBottom: 16,
    },
});
