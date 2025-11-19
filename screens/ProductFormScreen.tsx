import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { TextInput, Button, useTheme, IconButton } from 'react-native-paper';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { dbService, Product } from '../services/database';

interface ProductFormScreenProps {
    navigation: NavigationProp<any>;
    route: RouteProp<{ params: { productId?: number } }, 'params'>;
}

export default function ProductFormScreen({ navigation, route }: ProductFormScreenProps) {
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [imagePath, setImagePath] = useState('');
    const theme = useTheme();

    const productId = route.params?.productId;

    useEffect(() => {
        if (productId) {
            loadProduct();
        }
    }, [productId]);

    const loadProduct = async () => {
        if (!productId) return;
        const product = await dbService.getProductById(productId);
        if (product) {
            setName(product.name);
            setSku(product.sku);
            setPrice(product.price.toString());
            setStock(product.stock.toString());
            setImagePath(product.image_path);
        }
    };

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
            setImagePath(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        const product: Product = {
            name,
            sku,
            price: parseFloat(price) || 0,
            stock: parseInt(stock) || 0,
            image_path: imagePath,
        };

        if (productId) {
            product.id = productId;
            await dbService.updateProduct(product);
        } else {
            await dbService.createProduct(product);
        }

        navigation.goBack();
    };

    return (
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

                <TextInput
                    label="Product Name *"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    style={styles.input}
                />
                <TextInput
                    label="SKU"
                    value={sku}
                    onChangeText={setSku}
                    mode="outlined"
                    style={styles.input}
                />
                <TextInput
                    label="Price"
                    value={price}
                    onChangeText={setPrice}
                    mode="outlined"
                    keyboardType="decimal-pad"
                    style={styles.input}
                />
                <TextInput
                    label="Stock"
                    value={stock}
                    onChangeText={setStock}
                    mode="outlined"
                    keyboardType="number-pad"
                    style={styles.input}
                />
                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.button}
                    disabled={!name}
                >
                    Save Product
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
});
