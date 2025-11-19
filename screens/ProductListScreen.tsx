import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { FAB, Card, Title, Paragraph, IconButton, Searchbar, useTheme } from 'react-native-paper';
import { NavigationProp } from '@react-navigation/native';
import { dbService, Product } from '../services/database';

interface ProductListScreenProps {
    navigation: NavigationProp<any>;
}

export default function ProductListScreen({ navigation }: ProductListScreenProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const theme = useTheme();

    useEffect(() => {
        loadProducts();
        const unsubscribe = navigation.addListener('focus', () => {
            loadProducts();
        });
        return unsubscribe;
    }, [navigation]);

    const loadProducts = async () => {
        const data = await dbService.getProducts();
        setProducts(data);
    };

    const handleDelete = (id: number | undefined) => {
        if (!id) return;
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await dbService.deleteProduct(id);
                        loadProducts();
                    },
                },
            ]
        );
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Searchbar
                placeholder="Search products..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
            />
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id?.toString() || ''}
                renderItem={({ item }) => (
                    <Card style={styles.card} mode="elevated">
                        {item.image_path ? (
                            <Card.Cover source={{ uri: item.image_path }} style={styles.image} />
                        ) : null}
                        <Card.Content>
                            <Title>{item.name}</Title>
                            <Paragraph>SKU: {item.sku}</Paragraph>
                            <Paragraph>Price: ${item.price.toFixed(2)}</Paragraph>
                            <Paragraph>Stock: {item.stock}</Paragraph>
                        </Card.Content>
                        <Card.Actions>
                            <IconButton
                                icon="pencil"
                                onPress={() => navigation.navigate('ProductForm', { productId: item.id })}
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
                onPress={() => navigation.navigate('ProductForm')}
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
    },
    card: {
        marginBottom: 12,
    },
    image: {
        height: 200,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
