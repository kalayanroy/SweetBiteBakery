import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { ZodError } from "zod";
import {
  insertCategorySchema,
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertUserSchema,
  loginSchema,
  registerSchema,
  newsletterSchema,
  contactFormSchema,
  insertSupplierSchema,
  insertPurchaseSchema,
  insertPurchaseItemSchema
} from "../shared/schema.js";
import { checkAuth, authenticateUser } from "./auth.js";
import { loadInitialData } from "./loadInitialData.js";
import { checkDatabaseConnection } from "./db.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Check database connection or initialize storage
  try {
    const isConnected = await checkDatabaseConnection();

    if (isConnected) {
      console.log("Database connected, loading initial data if needed...");
      await loadInitialData(storage);
    } else {
      console.warn("Database connection failed, using MemStorage and loading initial data...");
      await loadInitialData(storage);
    }
  } catch (error) {
    console.error("Error checking database connection or initializing data:", error);
    // Even if check fails, try to load data into whatever storage we have
    await loadInitialData(storage);
  }

  // Debug endpoint
  app.get("/api/debug", async (_req: Request, res: Response) => {
    try {
      const { checkDatabaseConnection } = await import("./db.js");
      const isConnected = await checkDatabaseConnection();
      const hasUrl = !!process.env.DATABASE_URL;

      res.json({
        env: {
          hasDatabaseUrl: hasUrl,
          nodeEnv: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV || "not detected",
        },
        database: {
          connected: isConnected,
          storageType: process.env.DATABASE_URL ? "Database" : "In-Memory",
        }
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Debug check failed",
        error: error.message
      });
    }
  });

  // Settings Routes
  app.get("/api/settings/:key", async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      // Allow public access mostly to store settings
      if (key !== 'store' && key !== 'payment') {
        // Optionally restrict other keys if needed, but for now allow public read
        // or checkAuth for sensitive keys if we add them later
      }
      const settings = await storage.getSettings(key);
      res.json(settings || {});
    } catch (error) {
      console.error(`Failed to fetch settings for key ${req.params.key}:`, error);
      res.json({});
    }
  });

  app.get("/api/admin/settings/:key", checkAuth, async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const settings = await storage.getSettings(key);
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings/:key", checkAuth, async (req: Request, res: Response) => {
    try {
      const key = req.params.key;
      const value = req.body;
      const settings = await storage.updateSettings(key, value);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Categories
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req: Request, res: Response) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Products
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      // Parse pagination parameters
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;

      const products = await storage.getProducts(limit, offset);
      const categories = await storage.getCategories();
      const total = await storage.getProductsCount();

      // Create a map of categories for O(1) lookup
      const categoryMap = new Map(categories.map(c => [c.id, c]));

      // Add category information to each product
      const productsWithCategory = products.map(product => {
        const category = categoryMap.get(product.categoryId);
        return {
          ...product,
          category: category || { id: 0, name: "Unknown", slug: "unknown" }
        };
      });

      res.json({
        products: productsWithCategory,
        total,
        limit,
        offset
      });
    } catch (error) {
      console.error("Products API Error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (_req: Request, res: Response) => {
    try {
      const products = await storage.getFeaturedProducts();
      const categories = await storage.getCategories();

      // Add category information to each product
      const productsWithCategory = products.map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        return {
          ...product,
          category: category || { id: 0, name: "Unknown", slug: "unknown" }
        };
      });

      res.json(productsWithCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/category/:categoryId", async (req: Request, res: Response) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const products = await storage.getProductsByCategory(categoryId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  // Get product by ID (for admin editing)
  app.get("/api/admin/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const category = await storage.getCategoryById(product.categoryId);
      const productWithCategory = {
        ...product,
        category: category || { id: 0, name: "Unknown", slug: "unknown" }
      };

      res.json(productWithCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/products/:slug", async (req: Request, res: Response) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const category = await storage.getCategoryById(product.categoryId);

      res.json({
        ...product,
        category: category || { id: 0, name: "Unknown", slug: "unknown" }
      });
    } catch (error) {
      console.error("Product by Slug API Error:", error); // Added logging
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Admin routes - protected by auth
  app.post("/api/admin/login", async (req: Request, res: Response) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const result = await authenticateUser(credentials);

      if (result.success) {
        req.session.userId = result.userId;
        req.session.isAdmin = result.isAdmin;
        req.session.role = result.role;
        res.json({ success: true, isAdmin: result.isAdmin, role: result.role });
      } else {
        res.status(401).json({ message: result.error || "Invalid credentials" });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Login failed" });
      }
    }
  });

  app.post("/api/admin/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // User authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = registerSchema.parse(req.body);

      // Check if username or email already exists
      const existingUser = await storage.getUserByUsernameOrEmail(userData.username, userData.email);
      if (existingUser) {
        return res.status(400).json({
          message: existingUser.username === userData.username
            ? "Username already exists"
            : "Email already registered"
        });
      }

      // Create new user
      const newUser = await storage.createUser({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        isAdmin: false
      });

      // Automatically log in the user after registration
      req.session.userId = newUser.id;
      req.session.isAdmin = false;
      req.session.role = newUser.role;

      res.json({
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Registration failed" });
      }
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const result = await authenticateUser(credentials);

      if (result.success) {
        req.session.userId = result.userId;
        req.session.isAdmin = result.isAdmin;

        // Get user details to return
        const user = await storage.getUserById(result.userId!);

        res.json({
          success: true,
          isAdmin: result.isAdmin,
          role: result.role,
          user: user ? {
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            role: user.role
          } : null
        });
      } else {
        res.status(401).json({ message: result.error || "Invalid credentials" });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Login failed" });
      }
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/auth/password", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password are required" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check current password
      // Note: In a real app with hashed passwords, use bcrypt.compare
      if (user.password !== currentPassword) {
        return res.status(400).json({ message: "Incorrect current password" });
      }

      // Update password
      await storage.updateUser?.(user.id, { password: newPassword });

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });



  // Supplier Routes
  app.get("/api/admin/suppliers", checkAuth, async (_req: Request, res: Response) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/admin/suppliers", checkAuth, async (req: Request, res: Response) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create supplier" });
      }
    }
  });

  app.put("/api/admin/suppliers/:id", checkAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const supplierData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(id, supplierData);
      if (!supplier) return res.status(404).json({ message: "Supplier not found" });

      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete("/api/admin/suppliers/:id", checkAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const success = await storage.deleteSupplier(id);
      if (!success) return res.status(404).json({ message: "Supplier not found" });

      res.json({ message: "Supplier deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Purchase Routes
  app.get("/api/admin/purchases", checkAuth, async (_req: Request, res: Response) => {
    try {
      const purchases = await storage.getPurchases();
      // Enrich with supplier names if possible, or fetch separate
      // For simplicity, returning raw purchase first
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.get("/api/admin/purchases/:id", checkAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const purchase = await storage.getPurchaseById(id);
      if (!purchase) return res.status(404).json({ message: "Purchase not found" });

      const items = await storage.getPurchaseItems(id);
      res.json({ ...purchase, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase" });
    }
  });

  app.post("/api/admin/purchases", checkAuth, async (req: Request, res: Response) => {
    try {
      const { items, ...purchaseData } = req.body;
      const purchase = insertPurchaseSchema.parse(purchaseData);
      const purchaseItems = items.map((item: any) => insertPurchaseItemSchema.parse(item));

      const newPurchase = await storage.processPurchase(purchase, purchaseItems);
      res.status(201).json(newPurchase);
    } catch (error) {
      console.error("Purchase creation error:", error);
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create purchase" });
      }
    }
  });

  // Protected admin routes
  app.post("/api/admin/products", checkAuth, async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  app.put("/api/admin/products/:id", checkAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const productData = insertProductSchema.partial().parse(req.body);
      console.log(`Updating product ${id} with:`, productData); // Debug log
      const product = await storage.updateProduct(id, productData);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Product Update Error:", error); // Debug log
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update product" });
      }
    }
  });

  app.delete("/api/admin/products/:id", checkAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  app.post("/api/admin/categories", checkAuth, async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  // Admin: User Management
  app.get("/api/admin/users", checkAuth, async (req: Request, res: Response) => {
    try {
      // Get all users from storage
      const allUsers = await storage.getUsers?.() || [];

      // Return users without passwords
      const users = allUsers.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        role: user.role,
        createdAt: user.createdAt
      }));

      res.json(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/:id", checkAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await storage.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        role: user.role,
        createdAt: user.createdAt
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/admin/users", checkAuth, async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if username or email already exists
      const existingUser = await storage.getUserByUsernameOrEmail(userData.username, userData.email);
      if (existingUser) {
        return res.status(400).json({
          message: existingUser.username === userData.username
            ? "Username already exists"
            : "Email already registered"
        });
      }

      // Create new user
      const newUser = await storage.createUser(userData);

      // Return user without password
      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        isAdmin: newUser.isAdmin,
        role: newUser.role,
        createdAt: newUser.createdAt
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("User creation error:", error);
        res.status(500).json({ message: "Failed to create user" });
      }
    }
  });

  app.put("/api/admin/users/:id", checkAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const userData = insertUserSchema.partial().parse(req.body);

      // If updating username or email, check for conflicts
      if (userData.username || userData.email) {
        const existingUser = await storage.getUserById(id);
        if (!existingUser) {
          return res.status(404).json({ message: "User not found" });
        }

        if (userData.username && userData.username !== existingUser.username) {
          const usernameExists = await storage.getUserByUsername(userData.username);
          if (usernameExists) {
            return res.status(400).json({ message: "Username already exists" });
          }
        }
      }

      const updatedUser = await storage.updateUser?.(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user without password
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        isAdmin: updatedUser.isAdmin,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("User update error:", error);
        res.status(500).json({ message: "Failed to update user" });
      }
    }
  });

  app.delete("/api/admin/users/:id", checkAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Prevent deleting yourself
      if (req.session.userId === id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      const success = await storage.deleteUser?.(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("User deletion error:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin: Dashboard statistics
  app.get("/api/admin/dashboard", checkAuth, async (req: Request, res: Response) => {
    try {
      // Fetch all necessary data sequentially to prevent connection pool exhaustion
      const products = await storage.getProducts();
      const categories = await storage.getCategories();
      const orders = await storage.getOrders();

      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

      // Get recent orders (last 10)
      const recentOrders = orders
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 10);

      // Calculate products by category
      const categoryDistribution = categories.map(category => {
        const count = products.filter(p => p.categoryId === category.id).length;
        return {
          name: category.name,
          count
        };
      });

      // Calculate orders by month (last 6 months)
      const now = new Date();
      const monthlyOrders = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const count = orders.filter(order => {
          if (!order.createdAt) return false;
          const orderDate = new Date(order.createdAt);
          return orderDate >= monthStart && orderDate <= monthEnd;
        }).length;

        monthlyOrders.push({
          name: monthName,
          orders: count
        });
      }

      res.json({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalOrders: orders.length,
        totalRevenue,
        recentOrders,
        categoryDistribution,
        monthlyOrders
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Admin: Get all orders (for admin panel)
  // Admin: Get all orders (for admin panel)
  app.get("/api/admin/orders", checkAuth, async (req: Request, res: Response) => {
    try {
      const [orders, products] = await Promise.all([
        storage.getOrders(),
        storage.getProducts() // Fetch all products once
      ]);

      // Create product lookup map for O(1) access
      const productMap = new Map(products.map(p => [p.id, p]));

      // Fetch order items for each order and include product names
      // We still map over orders to get items, but we avoid the inner product fetch loop
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);

          // Get product details for each item from map
          const itemsWithProductNames = items.map((item) => {
            const product = productMap.get(item.productId);
            return {
              ...item,
              productName: product?.name || `Product #${item.productId}`
            };
          });

          return {
            ...order,
            items: itemsWithProductNames
          };
        })
      );

      res.json(ordersWithItems);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Admin: Create new order (POS)
  app.post("/api/admin/orders/create", checkAuth, async (req: Request, res: Response) => {
    try {
      const { items, status, ...orderData } = req.body;

      // Validate order data (excluding items and status which are handled separately)
      const validOrderData = insertOrderSchema.parse(orderData);

      // Create order with status
      // Create order items data first
      let orderItemsData: any[] = [];
      if (items && Array.isArray(items) && items.length > 0) {
        orderItemsData = items.map(item => ({
          orderId: 0, // Temporary
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        }));
      }

      // Use processOrder to handle transaction and stock deduction
      const order = await storage.processOrder({
        ...validOrderData,
        status: status || 'delivered'
      }, orderItemsData);

      // Return complete order with items and product names
      const orderItems = await storage.getOrderItems(order.id);

      const itemsWithNames = await Promise.all(orderItems.map(async (item) => {
        const product = await storage.getProductById(item.productId);
        return {
          ...item,
          name: product?.name || `Product #${item.productId}`
        };
      }));

      res.status(201).json({
        ...order,
        items: itemsWithNames
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        console.error("Failed to create admin order:", error);
        // Check if it's a stock error or other known error
        const message = error instanceof Error ? error.message : "Failed to create order";
        res.status(500).json({ message });
      }
    }
  });

  // Admin: Update order status
  app.patch("/api/admin/orders/:id/status", checkAuth, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updated = await storage.updateOrderStatus(orderId, status);

      if (!updated) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({ success: true, order: updated });
    } catch (error) {
      console.error("Failed to update order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Admin: Get all customers (from users and orders)
  app.get("/api/admin/customers", checkAuth, async (req: Request, res: Response) => {
    try {
      const orders = await storage.getOrders();

      // Create a map to store unique customers by email
      const customersMap = new Map<string, {
        email: string;
        name: string;
        phone: string;
        totalOrders: number;
        totalSpent: number;
        lastOrderDate: Date | null;
        isRegistered: boolean;
        userId?: number;
      }>();

      // Process orders to extract customer data
      for (const order of orders) {
        const email = order.customerEmail.toLowerCase();

        if (customersMap.has(email)) {
          // Update existing customer
          const customer = customersMap.get(email)!;
          customer.totalOrders += 1;
          customer.totalSpent += order.total || 0;

          // Update last order date if this order is more recent
          const orderDate = order.createdAt ? new Date(order.createdAt) : null;
          if (orderDate && (!customer.lastOrderDate || orderDate > customer.lastOrderDate)) {
            customer.lastOrderDate = orderDate;
          }
        } else {
          // Add new customer from order
          customersMap.set(email, {
            email: order.customerEmail,
            name: order.customerName,
            phone: order.customerPhone,
            totalOrders: 1,
            totalSpent: order.total || 0,
            lastOrderDate: order.createdAt ? new Date(order.createdAt) : null,
            isRegistered: false,
            userId: order.userId || undefined
          });
        }
      }

      // Convert map to array and sort by total spent (descending)
      const customers = Array.from(customersMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);

      res.json({
        customers,
        total: customers.length
      });
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  // Get user's orders (for logged-in users)
  app.get("/api/orders/user", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const allOrders = await storage.getOrders();
      // Filter orders for the current user
      const userOrders = allOrders.filter(order => order.userId === req.session.userId);
      res.json(userOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Public: Track order by ID and email
  app.get("/api/orders/track", async (req: Request, res: Response) => {
    try {
      const { orderId, email } = req.query;

      if (!orderId || !email) {
        return res.status(400).json({ message: "Order ID and email are required" });
      }

      const id = parseInt(orderId as string);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      // Get the order
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify email matches (case-insensitive)
      if (order.customerEmail.toLowerCase() !== (email as string).toLowerCase()) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Get order items with product names and images
      const items = await storage.getOrderItems(id);
      const itemsWithProductDetails = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            ...item,
            productName: product?.name || `Product #${item.productId}`,
            productImage: product?.image || null
          };
        })
      );

      res.json({
        ...order,
        items: itemsWithProductDetails
      });
    } catch (error) {
      console.error("Failed to track order:", error);
      res.status(500).json({ message: "Failed to track order" });
    }
  });

  // Orders
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);

      // Add userId if user is logged in
      const orderWithUser = {
        ...orderData,
        userId: req.session.userId || null
      };

      // Create the order
      // Create the order with stock deduction using processOrder
      const items = req.body.items || [];
      const orderItemsData = items.map((item: any) => insertOrderItemSchema.parse({
        orderId: 0, // Temporary ID, will be set by processOrder
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }));

      const order = await storage.processOrder(orderWithUser, orderItemsData);

      res.status(201).json({ order });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        // Check if it's a stock error or other known error
        const message = error instanceof Error ? error.message : "Failed to create order";
        res.status(500).json({ message });
      }
    }
  });

  app.get("/api/orders/:id", checkAuth, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const items = await storage.getOrderItems(id);

      res.json({ order, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Newsletter subscription
  app.post("/api/newsletter", async (req: Request, res: Response) => {
    try {
      const subscription = newsletterSchema.parse(req.body);
      // In a real app, we'd store this in a database
      res.status(200).json({
        success: true,
        message: `Thank you for subscribing with ${subscription.email}!`
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to subscribe to newsletter" });
      }
    }
  });

  // =================== PATHAO COURIER API ROUTES ===================

  // Get Pathao cities
  app.get("/api/pathao/cities", async (_req: Request, res: Response) => {
    try {
      const { getPathaoService } = await import("./pathao.js");
      const pathao = getPathaoService();
      const cities = await pathao.getCities();
      res.json(cities);
    } catch (error: any) {
      console.error("Pathao cities error:", error);
      res.status(500).json({ message: "Failed to fetch cities", error: error.message });
    }
  });

  // Get Pathao zones for a city
  app.get("/api/pathao/zones/:cityId", async (req: Request, res: Response) => {
    try {
      const cityId = parseInt(req.params.cityId);
      if (isNaN(cityId)) {
        return res.status(400).json({ message: "Invalid city ID" });
      }

      const { getPathaoService } = await import("./pathao.js");
      const pathao = getPathaoService();
      const zones = await pathao.getZones(cityId);
      res.json(zones);
    } catch (error: any) {
      console.error("Pathao zones error:", error);
      res.status(500).json({ message: "Failed to fetch zones", error: error.message });
    }
  });

  // Get Pathao areas for a zone
  app.get("/api/pathao/areas/:zoneId", async (req: Request, res: Response) => {
    try {
      const zoneId = parseInt(req.params.zoneId);
      if (isNaN(zoneId)) {
        return res.status(400).json({ message: "Invalid zone ID" });
      }

      const { getPathaoService } = await import("./pathao.js");
      const pathao = getPathaoService();
      const areas = await pathao.getAreas(zoneId);
      res.json(areas);
    } catch (error: any) {
      console.error("Pathao areas error:", error);
      res.status(500).json({ message: "Failed to fetch areas", error: error.message });
    }
  });

  // Get Pathao stores
  app.get("/api/pathao/stores", async (_req: Request, res: Response) => {
    try {
      const { getPathaoService } = await import("./pathao.js");
      const pathao = getPathaoService();
      const stores = await pathao.getStores();
      res.json(stores);
    } catch (error: any) {
      console.error("Pathao stores error:", error);
      res.status(500).json({ message: "Failed to fetch stores", error: error.message });
    }
  });

  // Calculate delivery price
  app.post("/api/pathao/calculate-price", async (req: Request, res: Response) => {
    try {
      const { storeId, recipientCity, recipientZone, deliveryType, itemType, itemWeight } = req.body;

      if (!storeId || !recipientCity || !recipientZone) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const { getPathaoService } = await import("./pathao.js");
      const pathao = getPathaoService();

      const price = await pathao.calculatePrice({
        storeId: parseInt(storeId),
        recipientCity: parseInt(recipientCity),
        recipientZone: parseInt(recipientZone),
        deliveryType: deliveryType || "normal",
        itemType: itemType || "parcel",
        item_weight: parseFloat(itemWeight) || 0.5,
      });

      res.json(price);
    } catch (error: any) {
      console.error("Pathao price calculation error:", error);
      res.status(500).json({ message: "Failed to calculate price", error: error.message });
    }
  });

  // Create Pathao order
  app.post("/api/pathao/create-order", async (req: Request, res: Response) => {
    try {
      const orderData = req.body;

      if (!orderData.storeId || !orderData.recipientName || !orderData.recipientPhone) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const { getPathaoService } = await import("./pathao.js");
      const pathao = getPathaoService();

      const result = await pathao.createOrder({
        storeId: parseInt(orderData.storeId),
        merchantOrderId: orderData.merchantOrderId || `ORD-${Date.now()}`,
        recipientName: orderData.recipientName,
        recipientPhone: orderData.recipientPhone,
        recipientAddress: orderData.recipientAddress,
        recipientCity: parseInt(orderData.recipientCity),
        recipientZone: parseInt(orderData.recipientZone),
        recipientArea: parseInt(orderData.recipientArea),
        deliveryType: orderData.deliveryType || "normal",
        itemType: orderData.itemType || "parcel",
        itemQuantity: parseInt(orderData.itemQuantity) || 1,
        itemWeight: parseFloat(orderData.itemWeight) || 0.5,
        itemDescription: orderData.itemDescription || "Bakery Items",
        amountToCollect: parseFloat(orderData.amountToCollect) || 0,
        specialInstruction: orderData.specialInstruction || "",
      });

      res.json(result);
    } catch (error: any) {
      console.error("Pathao order creation error:", error);
      res.status(500).json({ message: "Failed to create Pathao order", error: error.message });
    }
  });

  // Track Pathao order
  app.get("/api/pathao/track/:consignmentId", async (req: Request, res: Response) => {
    try {
      const { consignmentId } = req.params;

      if (!consignmentId) {
        return res.status(400).json({ message: "Consignment ID is required" });
      }

      const { getPathaoService } = await import("./pathao.js");
      const pathao = getPathaoService();
      const tracking = await pathao.trackOrder(consignmentId);

      res.json(tracking);
    } catch (error: any) {
      console.error("Pathao tracking error:", error);
      res.status(500).json({ message: "Failed to track order", error: error.message });
    }
  });

  // =================== END PATHAO ROUTES ===================

  // Contact form
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const contactForm = contactFormSchema.parse(req.body);
      // In a real app, we'd send an email or store this in a database
      res.status(200).json({
        success: true,
        message: `Thank you for your message, ${contactForm.name}! We'll get back to you soon.`
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to submit contact form" });
      }
    }
  });

  // Placeholder image endpoint
  app.get("/api/placeholder/:width/:height", (req: Request, res: Response) => {
    const { width, height } = req.params;
    const text = req.query.text || "No Image";

    // Generate a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" 
              fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
          ${text}
        </text>
      </svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  });

  const httpServer = createServer(app);
  return httpServer;
}
