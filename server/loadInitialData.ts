import { IStorage } from "./storage";
import { hashPassword } from "./auth";

/**
 * Loads initial data into the database if it's empty
 */
export async function loadInitialData(storage: IStorage): Promise<void> {
  try {
    // Check if categories exist
    const existingCategories = await storage.getCategories();
    if (existingCategories.length > 0) {
      console.log("Initial data already loaded, skipping...");
      return;
    }

    console.log("Loading initial data...");

    // Create admin user
    const hashedPassword = await hashPassword("admin123");
    const adminUser = {
      username: "admin",
      password: hashedPassword,
      isAdmin: true
    };
    await storage.createUser(adminUser);
    console.log("Admin user created");
    
    // Create categories
    const categoryData = [
      { name: "Cakes", slug: "cakes" },
      { name: "Pastries", slug: "pastries" },
      { name: "Cookies", slug: "cookies" },
      { name: "Breads", slug: "breads" }
    ];
    
    const categories = [];
    for (const category of categoryData) {
      const newCategory = await storage.createCategory(category);
      categories.push(newCategory);
      console.log(`Category created: ${category.name}`);
    }
    
    // Create products - one at a time with better error handling
    const createProduct = async (product: InsertProduct) => {
      try {
        // Ensure all fields meet required formats
        const insertProduct: InsertProduct = {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          image: product.image,
          categoryId: product.categoryId,
          featured: product.featured || false,
          isBestseller: product.isBestseller || false,
          isNew: product.isNew || false,
          isPopular: product.isPopular || false,
          dietaryOptions: product.dietaryOptions || []
        };
        
        const newProduct = await storage.createProduct(insertProduct);
        console.log(`Product created: ${product.name}`);
        return newProduct;
      } catch (error: any) {
        console.error(`Error creating product ${product.name}:`, error.message || 'Unknown error');
        return null;
      }
    };
    
    const productsData = [
      {
        name: "Strawberry Dream Cake",
        slug: "strawberry-dream-cake",
        description: "Three layers of vanilla sponge filled with fresh strawberries and whipped cream, topped with strawberry buttercream.",
        price: 42.99,
        image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80",
        categoryId: categories[0].id,
        featured: true,
        isBestseller: true,
        isNew: false,
        isPopular: false,
        dietaryOptions: ["vegetarian"]
      },
      {
        name: "Chocolate Truffle Cake",
        slug: "chocolate-truffle-cake",
        description: "Rich chocolate sponge layered with chocolate ganache and covered in chocolate shavings.",
        price: 38.99,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
        categoryId: categories[0].id,
        featured: true,
        isBestseller: false,
        isNew: false,
        isPopular: true,
        dietaryOptions: ["vegetarian"]
      },
      {
        name: "Lemon Drizzle Cake",
        slug: "lemon-drizzle-cake",
        description: "Light sponge infused with lemon syrup and topped with lemon icing.",
        price: 32.99,
        image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80",
        categoryId: categories[0].id,
        featured: false,
        isBestseller: false,
        isNew: true,
        isPopular: false,
        dietaryOptions: ["vegetarian"]
      },
      {
        name: "Butter Croissant",
        slug: "butter-croissant",
        description: "Traditional French croissant made with layers of buttery, flaky pastry.",
        price: 3.49,
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
        categoryId: categories[1].id,
        featured: true,
        isBestseller: true,
        isNew: false,
        isPopular: false,
        dietaryOptions: ["vegetarian"]
      },
      {
        name: "Pain au Chocolat",
        slug: "pain-au-chocolat",
        description: "Flaky pastry filled with rich dark chocolate.",
        price: 3.99,
        image: "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=600&q=80",
        categoryId: categories[1].id,
        featured: false,
        isBestseller: false,
        isNew: false,
        isPopular: true,
        dietaryOptions: ["vegetarian"]
      }
    ];
    
    // Add just a few products for now to avoid overwhelming the database
    for (const product of productsData) {
      await createProduct(product);
      // Add a small delay to avoid overwhelming the connection
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("Initial data loaded successfully!");
  } catch (error) {
    console.error("Error loading initial data:", error);
    // Continue with application startup even if data loading fails
  }
}