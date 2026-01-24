import {
  categories, products, users, orders, orderItems,
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type User, type InsertUser,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type Setting, settings
} from "../shared/schema.js";
import { getDb as getDbInstance } from "./db.js";
import { eq, desc, and, asc } from "drizzle-orm";
import { IStorage } from "./storage.js";

// Helper function to ensure db is not null
function getDb() {
  const db = getDbInstance();
  if (!db) {
    throw new Error("Database not initialized. Please set DATABASE_URL environment variable.");
  }
  return db;
}

export class DatabaseStorage implements IStorage {
  // Category operations
  async getCategories(): Promise<Category[]> {
    return await getDb().select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await getDb().select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await getDb().select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await getDb().insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await getDb()
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await getDb().delete(categories).where(eq(categories.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Product operations
  async getProducts(limit?: number, offset?: number): Promise<Product[]> {
    const baseQuery = getDb().select().from(products).orderBy(desc(products.createdAt));

    // Build query based on parameters to avoid TypeScript errors
    if (limit !== undefined && offset !== undefined) {
      return await baseQuery.limit(limit).offset(offset);
    } else if (limit !== undefined) {
      return await baseQuery.limit(limit);
    } else if (offset !== undefined) {
      return await baseQuery.offset(offset);
    }

    return await baseQuery;
  }

  async getProductsCount(): Promise<number> {
    const result = await getDb().select({ count: products.id }).from(products);
    return result.length;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await getDb().select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await getDb().select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await getDb()
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .orderBy(desc(products.createdAt));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await getDb()
      .select()
      .from(products)
      .where(eq(products.featured, true))
      .orderBy(desc(products.createdAt))
      .limit(6);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Ensure all boolean fields have a value
    const productWithDefaults = {
      ...product,
      featured: product.featured ?? false,
      isBestseller: product.isBestseller ?? false,
      isNew: product.isNew ?? false,
      isPopular: product.isPopular ?? false
    };

    const [newProduct] = await getDb().insert(products).values(productWithDefaults).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await getDb()
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await getDb().delete(products).where(eq(products.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await getDb().select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await getDb().select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await getDb().select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByUsernameOrEmail(username: string, email: string): Promise<User | undefined> {
    const [user] = await getDb().select().from(users).where(
      and(eq(users.username, username), eq(users.email, email))
    );
    // If exact match not found, check for either username OR email
    if (!user) {
      const results = await getDb().select().from(users);
      return results.find((u: User) => u.username === username || u.email === email);
    }
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Ensure isAdmin field has a value
    const userWithDefaults = {
      ...insertUser,
      isAdmin: insertUser.isAdmin ?? false
    };

    const [user] = await getDb().insert(users).values(userWithDefaults).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await getDb().select().from(users).orderBy(asc(users.createdAt));
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await getDb()
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await getDb().delete(users).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Order operations
  async getOrders(): Promise<Order[]> {
    return await getDb().select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await getDb().select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    // Add status field with default value
    const orderWithStatus = {
      ...order,
      status: 'pending'
    };

    const [newOrder] = await getDb().insert(orders).values(orderWithStatus).returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await getDb()
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Order Item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await getDb().select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await getDb().insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }

  // Settings operations
  async getSettings(key: string): Promise<any> {
    const [setting] = await getDb().select().from(settings).where(eq(settings.key, key));
    return setting ? setting.value : undefined;
  }

  async updateSettings(key: string, value: any): Promise<Setting> {
    const [existingSetting] = await getDb().select().from(settings).where(eq(settings.key, key));

    if (existingSetting) {
      const [updatedSetting] = await getDb()
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return updatedSetting;
    } else {
      const [newSetting] = await getDb()
        .insert(settings)
        .values({ key, value })
        .returning();
      return newSetting;
    }
  }
}