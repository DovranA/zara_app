import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard } from 'react-native';
import { TextInput, Button, useTheme, Paragraph, Menu, IconButton, Modal, Portal, List, Title, Searchbar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useProduct, useCreateProduct, useUpdateProduct, useUsers } from '../../../services/queries';
import type { Product } from '../../../services/database';

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
    const [searchQuery, setSearchQuery] = useState('');
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

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const pickImage = async (useCamera: boolean) => {
        const { status } = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need permission to access your camera/gallery.');
            return;
        }

        const result = useCamera
            ? await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            })
            : await ImagePicker.launchImageLibraryAsync({
                quality: 0.8,
                allowsMultipleSelection: true,
            });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setValue('images', [...images, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setValue('images', newImages);
    };

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

                    <Paragraph style={styles.label}>Images</Paragraph>
                    <ScrollView horizontal style={styles.imageList} contentContainerStyle={styles.imageListContent}>
                        {images.map((uri, index) => (
                            <View key={index} style={styles.imageContainer}>
                                <Image source={{ uri }} style={styles.image} />
                                <IconButton
                                    icon="close-circle"
                                    size={20}
                                    style={styles.removeButton}
                                    onPress={() => removeImage(index)}
                                />
                            </View>
                        ))}
                        <TouchableOpacity style={[styles.addImageButton, { borderColor: theme.colors.primary }]} onPress={() => pickImage(false)}>
                            <IconButton icon="plus" iconColor={theme.colors.primary} />
                        </TouchableOpacity>
                    </ScrollView>

                    <View style={styles.imageButtons}>
                        <Button
                            mode="outlined"
                            icon="camera"
                            onPress={() => pickImage(true)}
                            style={styles.imageButton}
                        >
                            Take Photo
                        </Button>
                        <Button
                            mode="outlined"
                            icon="image-multiple"
                            onPress={() => pickImage(false)}
                            style={styles.imageButton}
                        >
                            Add Photos
                        </Button>
                    </View>

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

                    <Portal>
                        <Modal
                            visible={visible}
                            onDismiss={closeMenu}
                            contentContainerStyle={[
                                styles.modalContent,
                                {
                                    backgroundColor: theme.colors.surface,
                                    bottom: Platform.OS === 'ios' ? keyboardHeight : 0
                                }
                            ]}
                        >
                            <View style={styles.sheetHeader}>
                                <Title style={styles.sheetTitle}>Assign User</Title>
                                <IconButton icon="close" size={20} onPress={closeMenu} />
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
                                        right={(props: any) => user.id === userId ? <List.Icon {...props} icon="check" color={theme.colors.primary} /> : null}
                                        onPress={() => {
                                            setValue('user_id', user.id);
                                            closeMenu();
                                        }}
                                        style={styles.userItem}
                                    />
                                ))}
                            </ScrollView>
                        </Modal>
                    </Portal>

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
    label: {
        marginBottom: 8,
        fontWeight: 'bold',
    },
    imageList: {
        marginBottom: 16,
    },
    imageListContent: {
        alignItems: 'center',
    },
    imageContainer: {
        marginRight: 8,
        position: 'relative',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        margin: 0,
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    imageButton: {
        flex: 1,
        marginHorizontal: 4,
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
