import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, useTheme, Paragraph } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { useUser, useCreateUser, useUpdateUser } from '../../services/queries';
import { User } from '../../services/database';

export default function UserFormScreen() {
    const theme = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const userId = params.userId ? Number(params.userId) : undefined;

    const { data: user } = useUser(userId);
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();

    const { control, handleSubmit, reset, formState: { errors } } = useForm<User>({
        defaultValues: {
            name: '',
            address: '',
            phone: '',
            email: '',
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                address: user.address,
                phone: user.phone,
                email: user.email || '',
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: User) => {
        if (userId) {
            await updateUserMutation.mutateAsync({ ...data, id: userId });
        } else {
            await createUserMutation.mutateAsync(data);
        }
        router.back();
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="name"
                        rules={{ required: 'Name is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Name *"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                mode="outlined"
                                style={styles.input}
                                error={!!errors.name}
                            />
                        )}
                    />
                    {errors.name && <Paragraph style={styles.error}>{errors.name.message}</Paragraph>}

                    <Controller
                        control={control}
                        name="address"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Address"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                style={styles.input}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="phone"
                        rules={{ required: 'Phone is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Phone *"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                mode="outlined"
                                keyboardType="phone-pad"
                                style={styles.input}
                                error={!!errors.phone}
                            />
                        )}
                    />
                    {errors.phone && <Paragraph style={styles.error}>{errors.phone.message}</Paragraph>}

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Email (Optional)"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                mode="outlined"
                                keyboardType="email-address"
                                style={styles.input}
                            />
                        )}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        style={styles.button}
                        loading={createUserMutation.isPending || updateUserMutation.isPending}
                    >
                        Save User
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    form: {
        padding: 16,
        paddingBottom: 80,
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
    },
    error: {
        color: 'red',
        fontSize: 12,
        marginTop: -12,
        marginBottom: 8,
    },
});
