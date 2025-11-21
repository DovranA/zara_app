import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Linking, Alert } from 'react-native';
import { FAB, Card, Title, Paragraph, IconButton, Searchbar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUsers, useDeleteUser } from '../../../services/queries';

export default function UserListScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const theme = useTheme();
    const router = useRouter();

    const { data: users = [], isLoading } = useUsers();
    const deleteUserMutation = useDeleteUser();

    const handleCall = (phone: string) => {
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        } else {
            Alert.alert('No Phone Number', 'This user does not have a phone number.');
        }
    };

    const handleDelete = (id: number | undefined) => {
        if (!id) return;
        Alert.alert(
            'Delete User',
            'Are you sure you want to delete this user?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteUserMutation.mutate(id),
                },
            ]
        );
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Searchbar
                placeholder="Search users..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
            />
            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id?.toString() || ''}
                renderItem={({ item }) => (
                    <Card style={styles.card} mode="elevated">
                        <Card.Content>
                            <Title>{item.name}</Title>
                            <Paragraph>{item.address}</Paragraph>
                            <Paragraph>{item.phone}</Paragraph>
                            {item.email && <Paragraph>{item.email}</Paragraph>}
                        </Card.Content>
                        <Card.Actions>
                            <IconButton
                                icon="phone"
                                mode="contained"
                                onPress={() => handleCall(item.phone)}
                            />
                            <IconButton
                                icon="pencil"
                                onPress={() => router.push(`/users/form?userId=${item.id}`)}
                            />
                            <IconButton
                                icon="delete"
                                onPress={() => handleDelete(item.id)}
                            />
                        </Card.Actions>
                    </Card>
                )}
                contentContainerStyle={styles.list}
            />
            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => router.push('/users/form')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchbar: {
        margin: 16,
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
