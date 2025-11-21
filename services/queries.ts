import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dbService, User, Product } from './database';

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


