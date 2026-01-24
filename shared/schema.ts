import { pgTable, text, serial, integer, doublePrecision, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  image: text("image"), // Category image URL
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  image: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(), // Base price (used when no variations)
  image: text("image").notNull(), // Primary image for backward compatibility
  images: text("images").array().default([]), // Multiple images
  categoryId: integer("category_id").notNull(),
  featured: boolean("featured").default(false),
  isBestseller: boolean("is_bestseller").default(false),
  isNew: boolean("is_new").default(false),
  isPopular: boolean("is_popular").default(false),
  dietaryOptions: jsonb("dietary_options").default([]),
  sizes: text("sizes").array().default([]),
  colors: text("colors").array().default([]),
  priceVariations: jsonb("price_variations").default({}), // { "size-color": price }
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  slug: true,
  description: true,
  price: true,
  image: true,
  images: true,
  categoryId: true,
  featured: true,
  isBestseller: true,
  isNew: true,
  isPopular: true,
  dietaryOptions: true,
  sizes: true,
  colors: true,
  priceVariations: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  isAdmin: boolean("is_admin").default(false),
  role: text("role").default("customer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  name: true,
  isAdmin: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Optional: link to user if logged in
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  total: doublePrecision("total").notNull(),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  address: true,
  city: true,
  state: true,
  zipCode: true,
  total: true,
  paymentMethod: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  subtotal: doublePrecision("subtotal").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
  subtotal: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Settings schema
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // e.g., 'store_settings', 'payment_settings'
  value: jsonb("value").default({}),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Setting = typeof settings.$inferSelect;

// Cart item (for session-based carts)
export const cartSchema = z.object({
  id: z.string(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
    name: z.string(),
    price: z.number(),
    image: z.string(),
    size: z.string().optional(), // Selected size variant
    color: z.string().optional(), // Selected color variant
  })),
  subtotal: z.number(),
});

export type Cart = z.infer<typeof cartSchema>;
export type CartItem = Cart["items"][number];

// Auth schemas for login/validation
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// User registration schema
export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export type RegisterCredentials = z.infer<typeof registerSchema>;

// Newsletter subscription
export const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type NewsletterSubscription = z.infer<typeof newsletterSchema>;

// Contact form
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(2, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactForm = z.infer<typeof contactFormSchema>;

// For representing a product with its category
export type ProductWithCategory = Product & {
  category: Category;
};
