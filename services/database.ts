import * as SQLite from 'expo-sqlite';

export interface User {
    id?: number;
    name: string;
    address: string;
    phone: string;
    email?: string;
}

export interface Product {
    id?: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    image_path: string;
}

export interface Delivery {
    id?: number;
    user_id: number;
    date: string;
    status: string;
    total_amount: number;
    signature_path: string;
    notes: string;
}

export interface DeliveryItem {
    id?: number;
    delivery_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
}

class DatabaseService {
    private db: SQLite.SQLiteDatabase | null = null;

    async init() {
        this.db = await SQLite.openDatabaseAsync('delivery_notes.db');
        await this.createTables();
    }

    private async createTables() {
        if (!this.db) return;

        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        address TEXT,
        phone TEXT,
        email TEXT
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sku TEXT,
        price REAL DEFAULT 0,
        stock INTEGER DEFAULT 0,
        image_path TEXT
      );

      CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        total_amount REAL DEFAULT 0,
        signature_path TEXT,
        notes TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS delivery_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        delivery_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_price REAL DEFAULT 0,
        FOREIGN KEY (delivery_id) REFERENCES deliveries(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);
    }

    // User CRUD
    async getUsers(): Promise<User[]> {
        if (!this.db) return [];
        const result = await this.db.getAllAsync<User>('SELECT * FROM users ORDER BY name');
        return result;
    }

    async getUserById(id: number): Promise<User | null> {
        if (!this.db) return null;
        const result = await this.db.getFirstAsync<User>('SELECT * FROM users WHERE id = ?', [id]);
        return result || null;
    }

    async createUser(user: User): Promise<number> {
        if (!this.db) return 0;
        const result = await this.db.runAsync(
            'INSERT INTO users (name, address, phone, email) VALUES (?, ?, ?, ?)',
            [user.name, user.address, user.phone, user.email || null]
        );
        return result.lastInsertRowId;
    }

    async updateUser(user: User): Promise<void> {
        if (!this.db || !user.id) return;
        await this.db.runAsync(
            'UPDATE users SET name = ?, address = ?, phone = ?, email = ? WHERE id = ?',
            [user.name, user.address, user.phone, user.email || null, user.id]
        );
    }

    async deleteUser(id: number): Promise<void> {
        if (!this.db) return;
        await this.db.runAsync('DELETE FROM users WHERE id = ?', [id]);
    }

    // Product CRUD
    async getProducts(): Promise<Product[]> {
        if (!this.db) return [];
        const result = await this.db.getAllAsync<Product>('SELECT * FROM products ORDER BY name');
        return result;
    }

    async getProductById(id: number): Promise<Product | null> {
        if (!this.db) return null;
        const result = await this.db.getFirstAsync<Product>('SELECT * FROM products WHERE id = ?', [id]);
        return result || null;
    }

    async createProduct(product: Product): Promise<number> {
        if (!this.db) return 0;
        const result = await this.db.runAsync(
            'INSERT INTO products (name, sku, price, stock, image_path) VALUES (?, ?, ?, ?, ?)',
            [product.name, product.sku, product.price, product.stock, product.image_path]
        );
        return result.lastInsertRowId;
    }

    async updateProduct(product: Product): Promise<void> {
        if (!this.db || !product.id) return;
        await this.db.runAsync(
            'UPDATE products SET name = ?, sku = ?, price = ?, stock = ?, image_path = ? WHERE id = ?',
            [product.name, product.sku, product.price, product.stock, product.image_path, product.id]
        );
    }

    async deleteProduct(id: number): Promise<void> {
        if (!this.db) return;
        await this.db.runAsync('DELETE FROM products WHERE id = ?', [id]);
    }

    // Delivery CRUD
    async getDeliveries(): Promise<Delivery[]> {
        if (!this.db) return [];
        const result = await this.db.getAllAsync<Delivery>('SELECT * FROM deliveries ORDER BY date DESC');
        return result;
    }

    async getDeliveryById(id: number): Promise<Delivery | null> {
        if (!this.db) return null;
        const result = await this.db.getFirstAsync<Delivery>('SELECT * FROM deliveries WHERE id = ?', [id]);
        return result || null;
    }

    async createDelivery(delivery: Delivery): Promise<number> {
        if (!this.db) return 0;
        const result = await this.db.runAsync(
            'INSERT INTO deliveries (user_id, date, status, total_amount, signature_path, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [delivery.user_id, delivery.date, delivery.status, delivery.total_amount, delivery.signature_path, delivery.notes]
        );
        return result.lastInsertRowId;
    }

    async updateDelivery(delivery: Delivery): Promise<void> {
        if (!this.db || !delivery.id) return;
        await this.db.runAsync(
            'UPDATE deliveries SET user_id = ?, date = ?, status = ?, total_amount = ?, signature_path = ?, notes = ? WHERE id = ?',
            [delivery.user_id, delivery.date, delivery.status, delivery.total_amount, delivery.signature_path, delivery.notes, delivery.id]
        );
    }

    async deleteDelivery(id: number): Promise<void> {
        if (!this.db) return;
        await this.db.runAsync('DELETE FROM deliveries WHERE id = ?', [id]);
    }

    // DeliveryItem CRUD
    async getDeliveryItems(deliveryId: number): Promise<DeliveryItem[]> {
        if (!this.db) return [];
        const result = await this.db.getAllAsync<DeliveryItem>(
            'SELECT * FROM delivery_items WHERE delivery_id = ?',
            [deliveryId]
        );
        return result;
    }

    async createDeliveryItem(item: DeliveryItem): Promise<number> {
        if (!this.db) return 0;
        const result = await this.db.runAsync(
            'INSERT INTO delivery_items (delivery_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
            [item.delivery_id, item.product_id, item.quantity, item.unit_price]
        );
        return result.lastInsertRowId;
    }

    async deleteDeliveryItems(deliveryId: number): Promise<void> {
        if (!this.db) return;
        await this.db.runAsync('DELETE FROM delivery_items WHERE delivery_id = ?', [deliveryId]);
    }
}

export const dbService = new DatabaseService();
