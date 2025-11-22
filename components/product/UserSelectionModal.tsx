import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, List, Title, Searchbar, IconButton, MD3Theme } from 'react-native-paper';
import type { User } from "../../services/database"

interface UserSelectionModalProps {
    visible: boolean;
    onDismiss: () => void;
    users: User[];
    onSelectUser: (userId: number) => void;
    selectedUserId?: number;
    theme: MD3Theme;
    keyboardHeight?: number;
}

export default function UserSelectionModal({
    visible,
    onDismiss,
    users,
    onSelectUser,
    selectedUserId,
    theme,
    keyboardHeight = 0,
}: UserSelectionModalProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectUser = (userId?: number) => {
        if (userId) {
            onSelectUser(userId)
        };
        setSearchQuery('');
        onDismiss();
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[
                    styles.modalContent,
                    {
                        backgroundColor: theme.colors.surface,
                        marginBottom: keyboardHeight
                    }
                ]}
            >
                <View style={styles.sheetHeader}>
                    <Title style={styles.sheetTitle}>Assign User</Title>
                    <IconButton icon="close" size={20} onPress={onDismiss} />
                </View>
                <Searchbar
                    placeholder="Search users..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchbar}
                />
                <ScrollView style={styles.userList}>
                    {filteredUsers.map((user) => (
                        <List.Item
                            key={user.id}
                            title={user.name}
                            left={(props: any) => <List.Icon {...props} icon="account" />}
                            right={(props: any) => user.id === selectedUserId ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
                            onPress={() => handleSelectUser(user.id)}
                            style={styles.userItem}
                        />
                    ))}
                </ScrollView>
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '50%',
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchbar: {
        marginBottom: 10,
        elevation: 0,
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    userList: {
        maxHeight: 300,
    },
    userItem: {
        paddingVertical: 8,
    },
});
