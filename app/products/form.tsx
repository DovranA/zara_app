import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, useTheme, Paragraph } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { useProduct, useCreateProduct, useUpdateProduct } from '../../services/queries';
import { Product } from '../../services/database';

export default function ProductFormScreen() {
    const theme = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();
    const productId = params.productId ? Number(params.productId) : undefined;

    const { data: product } = useProduct(productId);
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();

    const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Product>({
        defaultValues: {
            name: '',
            sku: '',
            price: 0,
            stock: 0,
            image_path: '',
        },
    });

    const imagePath = watch('image_path');

    useEffect(() => {
        if (product) {
            reset({
                name: product.name,
                sku: product.sku,
                price: product.price,
                stock: product.stock,
                image_path: product.image_path,
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
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

        if (!result.canceled) {
            setValue('image_path', result.assets[0].uri);
        }
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
                    {imagePath ? (
                        <Image source={{ uri: imagePath }} style={styles.image} />
                    ) : null}

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
                            icon="image"
                            onPress={() => pickImage(false)}
                            style={styles.imageButton}
                        >
                            Choose Photo
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
                        name="sku"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="SKU"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                mode="outlined"
                                style={styles.input}
                            />
                        )}
                    />

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
                        name="stock"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label="Stock"
                                value={value.toString()}
                                onChangeText={(text) => onChange(parseInt(text) || 0)}
                                onBlur={onBlur}
                                mode="outlined"
                                keyboardType="number-pad"
                                style={styles.input}
                            />
                        )}
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
    image: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
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
});
