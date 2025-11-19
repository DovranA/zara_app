import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Card, Title, Paragraph, Button, useTheme, Divider } from 'react-native-paper';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { dbService, Delivery, User, Product, DeliveryItem } from '../services/database';

interface DeliveryDetailScreenProps {
    navigation: NavigationProp<any>;
    route: RouteProp<{ params: { deliveryId: number } }, 'params'>;
}

interface DeliveryItemWithProduct extends DeliveryItem {
    product?: Product;
}

export default function DeliveryDetailScreen({ navigation, route }: DeliveryDetailScreenProps) {
    const [delivery, setDelivery] = useState<Delivery | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [items, setItems] = useState<DeliveryItemWithProduct[]>([]);
    const theme = useTheme();

    const deliveryId = route.params?.deliveryId;

    useEffect(() => {
        loadDelivery();
    }, [deliveryId]);

    const loadDelivery = async () => {
        if (!deliveryId) return;

        const deliveryData = await dbService.getDeliveryById(deliveryId);
        setDelivery(deliveryData);

        if (deliveryData) {
            const userData = await dbService.getUserById(deliveryData.user_id);
            setUser(userData);

            const itemsData = await dbService.getDeliveryItems(deliveryId);
            const itemsWithProducts = await Promise.all(
                itemsData.map(async (item) => {
                    const product = await dbService.getProductById(item.product_id);
                    return { ...item, product: product || undefined };
                })
            );
            setItems(itemsWithProducts);
        }
    };

    const markAsDelivered = async () => {
        if (!delivery) return;

        Alert.alert(
            'Mark as Delivered',
            'Are you sure you want to mark this delivery as delivered?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        delivery.status = 'Delivered';
                        await dbService.updateDelivery(delivery);
                        loadDelivery();
                    },
                },
            ]
        );
    };

    const generatePDF = async () => {
        if (!delivery || !user) return;

        const itemsHTML = items
            .map(
                (item) => `
        <tr>
          <td>${item.product?.name || 'Unknown'}</td>
          <td>${item.quantity}</td>
          <td>$${item.unit_price.toFixed(2)}</td>
          <td>$${(item.quantity * item.unit_price).toFixed(2)}</td>
        </tr>
      `
            )
            .join('');

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              color: #6200EE;
              border-bottom: 3px solid #6200EE;
              padding-bottom: 10px;
            }
            .info {
              margin: 20px 0;
            }
            .info p {
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #6200EE;
              color: white;
            }
            .total {
              text-align: right;
              font-size: 20px;
              font-weight: bold;
              margin-top: 20px;
              color: #6200EE;
            }
            .notes {
              margin-top: 20px;
              padding: 15px;
              background-color: #f5f5f5;
              border-left: 4px solid #6200EE;
            }
          </style>
        </head>
        <body>
          <h1>Delivery Note #${delivery.id}</h1>
          
          <div class="info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Address:</strong> ${user.address}</p>
            <p><strong>Phone:</strong> ${user.phone}</p>
            <p><strong>Email:</strong> ${user.email}</p>
          </div>

          <div class="info">
            <h3>Delivery Information</h3>
            <p><strong>Date:</strong> ${new Date(delivery.date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${delivery.status}</p>
          </div>

          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="total">
            Total: $${delivery.total_amount.toFixed(2)}
          </div>

          ${delivery.notes
                ? `
            <div class="notes">
              <h3>Notes</h3>
              <p>${delivery.notes}</p>
            </div>
          `
                : ''
            }
        </body>
      </html>
    `;

        try {
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri);
        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF');
        }
    };

    if (!delivery || !user) {
        return null;
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                <Card style={styles.card} mode="elevated">
                    <Card.Content>
                        <Title>Customer Information</Title>
                        <Paragraph>{user.name}</Paragraph>
                        <Paragraph>{user.address}</Paragraph>
                        <Paragraph>{user.phone}</Paragraph>
                        <Paragraph>{user.email}</Paragraph>
                    </Card.Content>
                </Card>

                <Card style={styles.card} mode="elevated">
                    <Card.Content>
                        <Title>Delivery Information</Title>
                        <Paragraph>Date: {new Date(delivery.date).toLocaleDateString()}</Paragraph>
                        <Paragraph>Status: {delivery.status}</Paragraph>
                        {delivery.notes ? <Paragraph>Notes: {delivery.notes}</Paragraph> : null}
                    </Card.Content>
                </Card>

                <Card style={styles.card} mode="elevated">
                    <Card.Content>
                        <Title>Items</Title>
                        <Divider style={styles.divider} />
                        {items.map((item, index) => (
                            <View key={index} style={styles.item}>
                                {item.product?.image_path ? (
                                    <Image source={{ uri: item.product.image_path }} style={styles.itemImage} />
                                ) : null}
                                <View style={styles.itemInfo}>
                                    <Paragraph style={styles.itemName}>{item.product?.name || 'Unknown'}</Paragraph>
                                    <Paragraph>
                                        {item.quantity} x ${item.unit_price.toFixed(2)} = $
                                        {(item.quantity * item.unit_price).toFixed(2)}
                                    </Paragraph>
                                </View>
                            </View>
                        ))}
                        <Divider style={styles.divider} />
                        <Title style={styles.total}>Total: ${delivery.total_amount.toFixed(2)}</Title>
                    </Card.Content>
                </Card>

                {delivery.status === 'Pending' && (
                    <Button mode="contained" onPress={markAsDelivered} style={styles.button}>
                        Mark as Delivered
                    </Button>
                )}

                <Button mode="outlined" onPress={generatePDF} style={styles.button}>
                    Generate PDF
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
    },
    divider: {
        marginVertical: 12,
    },
    item: {
        flexDirection: 'row',
        marginVertical: 8,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontWeight: 'bold',
    },
    total: {
        textAlign: 'right',
        marginTop: 8,
    },
    button: {
        marginBottom: 12,
    },
});
