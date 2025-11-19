import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { TextInput, Button, useTheme, Menu, Card, Title, Paragraph, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { dbService, User, Product, Delivery, DeliveryItem } from '../../services/database';

interface SelectedProduct extends Product {
    quantity: number;
}

export default function DeliveryFormScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [notes, setNotes] = useState('');
    const [userMenuVisible, setUserMenuVisible] = useState(false);
    const [productMenuVisible, setProductMenuVisible] = useState(false);
    const theme = useTheme();
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const userData = await dbService.getUsers();
        const productData = await dbService.getProducts();
        setUsers(userData);
        setProducts(productData);
    };

    const addProduct = (product: Product) => {
        const existing = selectedProducts.find(p => p.id === product.id);
        if (existing) {
            setSelectedProducts(
                selectedProducts.map(p =>
                    p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
                )
            );
        } else {
            setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
        }
        setProductMenuVisible(false);
    };

    const updateQuantity = (productId: number | undefined, quantity: number) => {
        if (!productId) return;
        if (quantity <= 0) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
        } else {
            setSelectedProducts(
                selectedProducts.map(p => (p.id === productId ? { ...p, quantity } : p))
            );
        }
    };

    const calculateTotal = () => {
        return selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    };

    const handleSave = async () => {
        if (!selectedUser) {
            Alert.alert('Error', 'Please select a user');
            return;
        }
        if (selectedProducts.length === 0) {
            Alert.alert('Error', 'Please add at least one product');
            return;
        }

        const delivery: Delivery = {
            user_id: selectedUser.id!,
            date: new Date().toISOString(),
            status: 'Pending',
            total_amount: calculateTotal(),
            signature_path: '',
            notes,
        };

        const deliveryId = await dbService.createDelivery(delivery);

        for (const product of selectedProducts) {
            const item: DeliveryItem = {
                delivery_id: deliveryId,
                product_id: product.id!,
                quantity: product.quantity,
                unit_price: product.price,
            };
            await dbService.createDeliveryItem(item);
        }

        router.back();
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.form}>
                <Menu
                    visible={userMenuVisible}
                    onDismiss={() => setUserMenuVisible(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setUserMenuVisible(true)}
                            style={styles.input}
                        >
                            {selectedUser ? selectedUser.name : 'Select User *'}
                        </Button>
                    }
                >
                    {users.map(user => (
                        <Menu.Item
                            key={user.id}
                            onPress={() => {
                                setSelectedUser(user);
                                setUserMenuVisible(false);
                            }}
                            title={user.name}
                        />
                    ))}
                </Menu>

                <Menu
                    visible={productMenuVisible}
                    onDismiss={() => setProductMenuVisible(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setProductMenuVisible(true)}
                            style={styles.input}
                        >
                            Add Product
                        </Button>
                    }
                >
                    {products.map(product => (
                        <Menu.Item
                            key={product.id}
                            onPress={() => addProduct(product)}
                            title={`${product.name} - $${product.price.toFixed(2)}`}
                        />
                    ))}
                </Menu>

                <Title style={styles.sectionTitle}>Selected Products</Title>
                {selectedProducts.map(product => (
                    <Card key={product.id} style={styles.productCard} mode="outlined">
                        <Card.Content>
                            <View style={styles.productRow}>
                                {product.image_path ? (
                                    <Image source={{ uri: product.image_path }} style={styles.productImage} />
                                ) : null}
                                <View style={styles.productInfo}>
                                    <Paragraph style={styles.productName}>{product.name}</Paragraph>
                                    <Paragraph>${product.price.toFixed(2)} each</Paragraph>
                                    <View style={styles.quantityControls}>
                                        <IconButton
                                            icon="minus"
                                            size={20}
                                            onPress={() => updateQuantity(product.id, product.quantity - 1)}
                                        />
                                        <Paragraph style={styles.quantity}>{product.quantity}</Paragraph>
                                        <IconButton
                                            icon="plus"
                                            size={20}
                                            onPress={() => updateQuantity(product.id, product.quantity + 1)}
                                        />
                                    </View>
                                </View>
                                <Paragraph style={styles.subtotal}>
                                    ${(product.price * product.quantity).toFixed(2)}
                                </Paragraph>
                            </View>
                        </Card.Content>
                    </Card>
                ))}

                <TextInput
                    label="Notes"
                    value={notes}
                    onChangeText={setNotes}
                    mode="outlined"
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                    placeholder="Add delivery instructions or comments..."
                />

                <Card style={styles.totalCard} mode="elevated">
                    <Card.Content>
                        <Title>Total: ${calculateTotal().toFixed(2)}</Title>
                    </Card.Content>
                </Card>

                <Button
                    mode="contained"
                    onPress={handleSave}
                    style={styles.button}
                    disabled={!selectedUser || selectedProducts.length === 0}
                >
                    Create Delivery
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
    sectionTitle: {
        marginTop: 8,
        marginBottom: 12,
    },
    productCard: {
        marginBottom: 12,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontWeight: 'bold',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    quantity: {
        marginHorizontal: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtotal: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    totalCard: {
        marginVertical: 16,
    },
    button: {
        marginTop: 8,
    },
});
