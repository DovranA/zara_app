import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, Alert, Dimensions, Linking } from 'react-native';
import { FAB, Card, Title, Paragraph, IconButton, Searchbar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useProducts, useDeleteProduct, useUsers } from '../../../services/queries';

export default function ProductListScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const theme = useTheme();
    const router = useRouter();

    const { data: products = [], isLoading } = useProducts();
    const { data: users = [] } = useUsers();
    const deleteProductMutation = useDeleteProduct();

    const userMap = users.reduce((acc, user) => {
        if (user.id) acc[user.id] = user;
        return acc;
    }, {} as Record<number, typeof users[0]>);

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
                    onPress: () => deleteProductMutation.mutate(id),
                },
            ]
        );
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderImageCarousel = (images: string[]) => {
        if (!images || images.length === 0) return null;

        return (
            <FlatList
                data={images}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Image source={{ uri: item }} style={styles.carouselImage} />
                )}
                style={styles.carousel}
            />
        );
    };

    const handleCall = (phoneNumber: string) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

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
                        {item.images && item.images.length > 0 ? (
                            renderImageCarousel(item.images)
                        ) : null}
                        <Card.Content>
                            <Title>{item.name}</Title>
                            <Paragraph>Price: ${item.price.toFixed(2)}</Paragraph>
                            {item.note ? <Paragraph>Note: {item.note}</Paragraph> : null}
                            {item.delivery_date ? (
                                <Paragraph>Delivery Date: {new Date(item.delivery_date).toLocaleDateString()}</Paragraph>
                            ) : null}
                            {item.user_id && userMap[item.user_id] ? (
                                <Paragraph>User: {userMap[item.user_id].name}</Paragraph>
                            ) : null}
                        </Card.Content>
                        <Card.Actions>
                            {item.user_id && userMap[item.user_id]?.phone ? (
                                <IconButton
                                    icon="phone"
                                    onPress={() => handleCall(userMap[item.user_id!].phone)}
                                />
                            ) : null}
                            <IconButton
                                icon="pencil"
                                onPress={() => router.push(`/products/form?productId=${item.id}`)}
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
                onPress={() => router.push('/products/form')}
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
        marginBottom: 16,
    },
    carousel: {
        height: 200,
        marginBottom: 8,
    },
    carouselImage: {
        width: Dimensions.get('window').width - 32, // Full width minus padding
        height: 200,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
