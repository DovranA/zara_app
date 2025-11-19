import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbService, User, Product, Delivery, DeliveryItem } from './database';

// User Hooks
export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: () => dbService.getUsers(),
    });
}

export function useUser(id: number | undefined) {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => (id ? dbService.getUserById(id) : null),
        enabled: !!id,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: User) => dbService.createUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (user: User) => dbService.updateUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => dbService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

// Product Hooks
export function useProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: () => dbService.getProducts(),
    });
}

export function useProduct(id: number | undefined) {
    return useQuery({
        queryKey: ['products', id],
        queryFn: () => (id ? dbService.getProductById(id) : null),
        enabled: !!id,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (product: Product) => dbService.createProduct(product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (product: Product) => dbService.updateProduct(product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => dbService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// Delivery Hooks
export function useDeliveries() {
    return useQuery({
        queryKey: ['deliveries'],
        queryFn: () => dbService.getDeliveries(),
    });
}

export function useDelivery(id: number | undefined) {
    return useQuery({
        queryKey: ['deliveries', id],
        queryFn: () => (id ? dbService.getDeliveryById(id) : null),
        enabled: !!id,
    });
}

export function useDeliveryItems(deliveryId: number | undefined) {
    return useQuery({
        queryKey: ['deliveryItems', deliveryId],
        queryFn: () => (deliveryId ? dbService.getDeliveryItems(deliveryId) : []),
        enabled: !!deliveryId,
    });
}

export function useCreateDelivery() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (delivery: Delivery) => dbService.createDelivery(delivery),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
        },
    });
}

export function useUpdateDelivery() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (delivery: Delivery) => dbService.updateDelivery(delivery),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
        },
    });
}

export function useDeleteDelivery() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => dbService.deleteDelivery(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['deliveries'] });
        },
    });
}

export function useCreateDeliveryItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (item: DeliveryItem) => dbService.createDeliveryItem(item),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['deliveryItems', variables.delivery_id] });
        },
    });
}
