import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { dbService, User } from '../services/database';

interface UserFormScreenProps {
    navigation: NavigationProp<any>;
    route: RouteProp<{ params: { userId?: number } }, 'params'>;
}

export default function UserFormScreen({ navigation, route }: UserFormScreenProps) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const theme = useTheme();

    const userId = route.params?.userId;

    useEffect(() => {
        if (userId) {
            loadUser();
        }
    }, [userId]);

    const loadUser = async () => {
        if (!userId) return;
        const user = await dbService.getUserById(userId);
        if (user) {
            setName(user.name);
            setAddress(user.address);
            setPhone(user.phone);
            setEmail(user.email);
        }
    };

    const handleSave = async () => {
        const user: User = { name, address, phone, email };

        if (userId) {
            user.id = userId;
            await dbService.updateUser(user);
        } else {
            await dbService.createUser(user);
        }

        navigation.goBack();
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.form}>
                <TextInput
                    label="Name *"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                />
                <TextInput
                    label="Address"
                    value={address}
                    onChangeText={setAddress}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                />
                <TextInput
                    label="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    mode="outlined"
                    keyboardType="phone-pad"
                    style={styles.input}
                />
                <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    style={styles.input}
                />
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.button}
                    disabled={!name}
                >
                    Save User
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    form: {
        padding: 16,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
    },
});
