import {
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type User, type InsertUser,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Setting, type InsertSettings,
  type Supplier, type InsertSupplier,
  type Purchase, type InsertPurchase,
  type PurchaseItem, type InsertPurchaseItem
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
  createOrderItems(orderItems: InsertOrderItem[]): Promise<OrderItem[]>;
  processOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;

  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  getSupplierById(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;

  // Purchase operations
  getPurchases(): Promise<Purchase[]>;
  getPurchaseById(id: number): Promise<Purchase | undefined>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined>;
  getPurchaseItems(purchaseId: number): Promise<PurchaseItem[]>;
  processPurchase(purchase: InsertPurchase, items: InsertPurchaseItem[]): Promise<Purchase>;

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
  private suppliers: Map<number, Supplier>;
  private purchases: Map<number, Purchase>;
  private purchaseItems: Map<number, PurchaseItem>;

  private categoryId: number;
  private productId: number;
  private userId: number;
  private orderId: number;
  private orderItemId: number;
  private settingId: number;
  private supplierId: number;
  private purchaseId: number;
  private purchaseItemId: number;

  constructor() {
    this.categories = new Map();
    this.products = new Map();
    this.users = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.settings = new Map();
    this.suppliers = new Map();
    this.purchases = new Map();
    this.purchaseItems = new Map();

    this.categoryId = 1;
    this.productId = 1;
    this.userId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.settingId = 1;
    this.supplierId = 1;
    this.purchaseId = 1;
    this.purchaseItemId = 1;
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
    const newOrder = { ...order, id, status: order.status || 'pending', createdAt: now } as Order;
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

  async createOrderItems(items: InsertOrderItem[]): Promise<OrderItem[]> {
    return Promise.all(items.map(item => this.createOrderItem(item)));
  }

  async processOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Check stock for all items first
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }
    }

    // Deduct stock
    for (const item of items) {
      const product = this.products.get(item.productId)!;
      const updatedProduct = { ...product, stock: product.stock - item.quantity };
      this.products.set(product.id, updatedProduct);
    }

    // Create order and items
    const newOrder = await this.createOrder(order);

    // Assign orderId to items
    const itemsWithOrderId = items.map(item => ({ ...item, orderId: newOrder.id }));
    await this.createOrderItems(itemsWithOrderId);

    return newOrder;
  }

  // Supplier methods
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplierById(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.supplierId++;
    const now = new Date();
    const newSupplier: Supplier = { ...supplier, id, createdAt: now };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const existing = this.suppliers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...supplier };
    this.suppliers.set(id, updated);
    return updated;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // Purchase methods
  async getPurchases(): Promise<Purchase[]> {
    return Array.from(this.purchases.values());
  }

  async getPurchaseById(id: number): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const id = this.purchaseId++;
    const now = new Date();
    const newPurchase: Purchase = {
      ...purchase,
      id,
      createdAt: now,
      status: purchase.status || "pending",
      notes: purchase.notes || null,
      date: new Date(purchase.date)
    };
    this.purchases.set(id, newPurchase);
    return newPurchase;
  }

  async updatePurchaseStatus(id: number, status: string): Promise<Purchase | undefined> {
    const purchase = this.purchases.get(id);
    if (!purchase) return undefined;
    const updated = { ...purchase, status };
    this.purchases.set(id, updated);
    return updated;
  }

  async getPurchaseItems(purchaseId: number): Promise<PurchaseItem[]> {
    return Array.from(this.purchaseItems.values()).filter(item => item.purchaseId === purchaseId);
  }

  async processPurchase(purchase: InsertPurchase, items: InsertPurchaseItem[]): Promise<Purchase> {
    const newPurchase = await this.createPurchase(purchase);

    // Create items
    for (const item of items) {
      const id = this.purchaseItemId++;
      const newItem: PurchaseItem = { ...item, id, purchaseId: newPurchase.id };
      this.purchaseItems.set(id, newItem);

      // Update stock
      const product = this.products.get(item.productId);
      if (product) {
        const updatedProduct = { ...product, stock: product.stock + item.quantity };
        this.products.set(product.id, updatedProduct);
      }
    }

    return newPurchase;
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
  return storageInstance!;
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
