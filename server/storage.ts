import {
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type User, type InsertUser,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Setting, type InsertSettings
} from "../shared/schema.js";
import { randomUUID } from "crypto";

export interface IStorage {
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Product operations
  getProducts(limit?: number, offset?: number): Promise<Product[]>;
  getProductsCount(): Promise<number>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(username: string, email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Order operations
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Order Item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Settings operations
  getSettings(key: string): Promise<any>;
  updateSettings(key: string, value: any): Promise<Setting>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private users: Map<number, User>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private settings: Map<number, Setting>;

  private categoryId: number;
  private productId: number;
  private userId: number;
  private orderId: number;
  private orderItemId: number;
  private settingId: number;

  constructor() {
    this.categories = new Map();
    this.products = new Map();
    this.users = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.settings = new Map();

    this.categoryId = 1;
    this.productId = 1;
    this.userId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.settingId = 1;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      category => category.slug === slug
    );
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = {
      ...category,
      id,
      image: category.image ?? null
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;

    const updatedCategory = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Product methods
  async getProducts(limit?: number, offset?: number): Promise<Product[]> {
    const allProducts = Array.from(this.products.values());
    if (offset !== undefined && limit !== undefined) {
      return allProducts.slice(offset, offset + limit);
    } else if (limit !== undefined) {
      return allProducts.slice(0, limit);
    } else if (offset !== undefined) {
      return allProducts.slice(offset);
    }
    return allProducts;
  }

  async getProductsCount(): Promise<number> {
    return this.products.size;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      product => product.slug === slug
    );
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.categoryId === categoryId
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.featured
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const now = new Date();
    const newProduct = {
      ...product,
      id,
      createdAt: now
    } as Product;
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log('Trying to find user by username:', username);
    console.log('Users in storage:', Array.from(this.users.values()));
    return Array.from(this.users.values()).find(
      user => user.username === username
    );
  }

  async getUserByUsernameOrEmail(username: string, email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username || user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user = { ...insertUser, id, createdAt: now } as User;
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;

    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const now = new Date();
    const newOrder = { ...order, id, status: 'pending', createdAt: now } as Order;
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      item => item.orderId === orderId
    );
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  // Settings methods
  async getSettings(key: string): Promise<any> {
    const setting = Array.from(this.settings.values()).find(s => s.key === key);
    return setting ? setting.value : undefined;
  }

  async updateSettings(key: string, value: any): Promise<Setting> {
    const existingSetting = Array.from(this.settings.values()).find(s => s.key === key);

    if (existingSetting) {
      const updatedSetting = { ...existingSetting, value, updatedAt: new Date() };
      this.settings.set(existingSetting.id, updatedSetting);
      return updatedSetting;
    }

    const id = this.settingId++;
    const newSetting: Setting = {
      id,
      key,
      value: value || {},
      updatedAt: new Date()
    };
    this.settings.set(id, newSetting);
    return newSetting;
  }
}

// Import the DatabaseStorage
import { DatabaseStorage } from "./database.js";

// Lazy storage initialization - will be created on first access
let storageInstance: IStorage | null = null;

function getStorageInstance(): IStorage {
  if (!storageInstance) {
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    console.log('🔍 DATABASE_URL exists:', hasDatabaseUrl);
    console.log('🔍 Using storage type:', hasDatabaseUrl ? 'DatabaseStorage' : 'MemStorage');

    storageInstance = hasDatabaseUrl
      ? new DatabaseStorage()
      : new MemStorage();
  }
  return storageInstance;
}

// Create a Proxy to make storage access lazy
export const storage = new Proxy({} as IStorage, {
  get(_target, prop) {
    const instance = getStorageInstance();
    const value = (instance as any)[prop];

    // If it's a function, bind it to the instance
    if (typeof value === 'function') {
      return value.bind(instance);
    }

    return value;
  }
});
