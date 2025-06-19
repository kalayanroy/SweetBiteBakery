import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import {
  insertCategorySchema,
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  loginSchema,
  newsletterSchema,
  contactFormSchema
} from "@shared/schema";
import { checkAuth, authenticateUser } from "./auth";
import { loadInitialData } from "./loadInitialData";

export async function registerRoutes(app: Express): Promise<Server> {
  // Check database connection before loading initial data
  try {
    const { checkDatabaseConnection } = await import("./db");
    const isConnected = await checkDatabaseConnection();
    
    if (isConnected) {
      // Initialize data if storage is empty
      await loadInitialData(storage);
    } else {
      console.warn("Database connection failed, skipping initial data load");
    }
  } catch (error) {
    console.error("Error checking database connection:", error);
  }
  
  // API Routes
  
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
  app.get("/api/products", async (_req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
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
        res.json({ success: true, isAdmin: result.isAdmin });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
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
      const product = await storage.updateProduct(id, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
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

  // Orders
  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Create the order
      const order = await storage.createOrder(orderData);
      
      // Create order items
      const items = req.body.items || [];
      for (const item of items) {
        const orderItemData = insertOrderItemSchema.parse({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        });
        await storage.createOrderItem(orderItemData);
      }
      
      res.status(201).json({ order });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
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

  const httpServer = createServer(app);
  return httpServer;
}
