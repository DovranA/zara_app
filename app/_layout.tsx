import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { lightTheme } from '../theme/theme';
import { dbService } from '../services/database';
import BottomNav from '../components/BottomNav';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes
        },
    },
});

export default function RootLayout() {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            await dbService.init();
            setIsReady(true);
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }
    };

    if (!isReady) {
        return null;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <PaperProvider theme={lightTheme}>
                <View style={styles.container}>
                    <Stack
                        screenOptions={{
                            headerStyle: {
                                backgroundColor: lightTheme.colors.primary,
                            },
                            headerTintColor: lightTheme.colors.onPrimary,
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                        }}
                    >
                        <Stack.Screen name="index" options={{ title: 'Delivery Note Manager' }} />
                        <Stack.Screen name="users/index" options={{ title: 'Users' }} />
                        <Stack.Screen name="users/form" options={{ title: 'User Form' }} />
                        <Stack.Screen name="products/index" options={{ title: 'Products' }} />
                        <Stack.Screen name="products/form" options={{ title: 'Product Form' }} />
                        <Stack.Screen name="deliveries/index" options={{ title: 'Deliveries' }} />
                        <Stack.Screen name="deliveries/form" options={{ title: 'Create Delivery' }} />
                        <Stack.Screen name="deliveries/[id]" options={{ title: 'Delivery Details' }} />
                    </Stack>
                    <BottomNav />
                </View>
            </PaperProvider>
        </QueryClientProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
