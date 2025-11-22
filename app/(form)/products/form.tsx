import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard } from 'react-native';
import { TextInput, Button, useTheme, Paragraph } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProduct, useCreateProduct, useUpdateProduct, useUsers } from '../../../services/queries';
import type { Product } from '../../../services/database';
import ProductImagePicker from '../../../components/product/ProductImagePicker';
import UserSelectionModal from '../../../components/product/UserSelectionModal';

export default function ProductFormScreen() {
    const theme = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const productId = params.productId ? Number(params.productId) : undefined;

    const { data: product } = useProduct(productId);
    const { data: users = [] } = useUsers();
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();

    const [visible, setVisible] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    useEffect(() => {
        if (Platform.OS === 'ios') {
            const showSubscription = Keyboard.addListener('keyboardWillShow', (e) => {
                setKeyboardHeight(e.endCoordinates.height);
            });
            const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
                setKeyboardHeight(0);
            });
            return () => {
                showSubscription.remove();
                hideSubscription.remove();
            };
        }
    }, []);

    const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Product>({
        defaultValues: {
            name: '',
            price: 0,
            note: '',
            images: [],
            user_id: undefined,
            delivery_date: undefined,
        },
    });

    const images = watch('images') || [];
    const userId = watch('user_id');
    const selectedUser = users.find(u => u.id === userId);

    useEffect(() => {
        if (product) {
            reset({
                name: product.name,
                price: product.price,
                note: product.note || '',
                images: product.images || [],
                user_id: product.user_id,
                delivery_date: product.delivery_date,
            });
        }
    }, [product, reset]);

    const onSubmit = async (data: Product) => {
        if (productId) {
            await updateProductMutation.mutateAsync({ ...data, id: productId });
        } else {
            await createProductMutation.mutateAsync(data);
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

                    <ProductImagePicker
                        images={images}
                        onImagesChange={(newImages) => setValue('images', newImages)}
                        theme={theme}
                    />

                    <Controller
                        control={control}
                        name="name"
                        rules={{ required: 'Product name is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Product Name *"
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
                        name="price"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Price"
                                value={value.toString()}
                                onChangeText={(text) => onChange(parseFloat(text) || 0)}
                                onBlur={onBlur}
                                mode="outlined"
                                keyboardType="decimal-pad"
                                style={styles.input}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="note"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Note (Optional)"
                                value={value || ''}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                style={styles.input}
                            />
                        )}
                    />

                    <View style={styles.input}>
                        <TouchableOpacity onPress={openMenu}>
                            <TextInput
                                label="Assigned User"
                                value={selectedUser ? selectedUser.name : ''}
                                mode="outlined"
                                editable={false}
                                right={<TextInput.Icon icon="chevron-down" onPress={openMenu} />}
                                pointerEvents="none"
                            />
                        </TouchableOpacity>
                    </View>

                    <Controller
                        control={control}
                        name="delivery_date"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.input}>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                    <TextInput
                                        label="Delivery Date"
                                        value={value ? new Date(value).toLocaleDateString() : ''}
                                        mode="outlined"
                                        editable={false}
                                        right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
                                        pointerEvents="none"
                                    />
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={value ? new Date(value) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={(event: any, selectedDate?: Date) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) {
                                                onChange(selectedDate.toISOString());
                                            }
                                        }}
                                    />
                                )}
                            </View>
                        )}
                    />

                    <UserSelectionModal
                        visible={visible}
                        onDismiss={closeMenu}
                        users={users}
                        onSelectUser={(id) => setValue('user_id', id)}
                        selectedUserId={userId}
                        theme={theme}
                        keyboardHeight={keyboardHeight}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSubmit(onSubmit)}
                        style={styles.button}
                        loading={createProductMutation.isPending || updateProductMutation.isPending}
                    >
                        Save Product
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
