import { IStorage } from "../storage";
import { 
  InsertCategory, 
  InsertProduct,
  InsertUser
} from "@shared/schema";
import { hashPassword } from "../auth";

export async function loadInitialData(storage: IStorage): Promise<void> {
  // Only load data if we have no categories yet
  const categories = await storage.getCategories();
  if (categories.length > 0) {
    return;
  }

  // Create admin user
  const adminPassword = await hashPassword("admin123");
  const adminUser: InsertUser = {
    username: "admin",
    password: adminPassword,
    isAdmin: true
  };
  await storage.createUser(adminUser);

  // Create categories
  const categoryData: InsertCategory[] = [
    { name: "Cakes", slug: "cakes" },
    { name: "Pastries", slug: "pastries" },
    { name: "Cookies", slug: "cookies" },
    { name: "Breads", slug: "breads" }
  ];

  const createdCategories = [];
  for (const category of categoryData) {
    createdCategories.push(await storage.createCategory(category));
  }

  // Create products
  const productData: InsertProduct[] = [
    {
      name: "Strawberry Dream Cake",
      slug: "strawberry-dream-cake",
      description: "Three layers of vanilla sponge filled with fresh strawberry compote and topped with smooth cream cheese frosting.",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      categoryId: createdCategories[0].id, // Cakes
      featured: true,
      isBestseller: true,
      isNew: false,
      isPopular: false,
      dietaryOptions: ["nut-free"]
    },
    {
      name: "Chocolate Truffle Cake",
      slug: "chocolate-truffle-cake",
      description: "Rich chocolate cake with ganache filling and chocolate shavings.",
      price: 32.99,
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      categoryId: createdCategories[0].id, // Cakes
      featured: false,
      isBestseller: false,
      isNew: true,
      isPopular: false,
      dietaryOptions: []
    },
    {
      name: "Red Velvet Cake",
      slug: "red-velvet-cake",
      description: "Classic red velvet cake with rich cream cheese frosting and a moist, tender crumb.",
      price: 28.99,
      image: "https://images.unsplash.com/photo-1586788224331-947f68671cf1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      categoryId: createdCategories[0].id, // Cakes
      featured: false,
      isBestseller: false,
      isNew: false,
      isPopular: true,
      dietaryOptions: []
    },
    {
      name: "Lemon Drizzle Cake",
      slug: "lemon-drizzle-cake",
      description: "Light and zesty lemon cake with a tangy lemon drizzle topping.",
      price: 22.99,
      image: "https://images.unsplash.com/photo-1519869325930-281384150729?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      categoryId: createdCategories[0].id, // Cakes
      featured: false,
      isBestseller: false,
      isNew: false,
      isPopular: true,
      dietaryOptions: ["nut-free"]
    },
    {
      name: "Carrot Cake",
      slug: "carrot-cake",
      description: "Moist and flavorful carrot cake with walnuts and cream cheese frosting.",
      price: 26.99,
      image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      categoryId: createdCategories[0].id, // Cakes
      featured: false,
      isBestseller: false,
      isNew: false,
      isPopular: false,
      dietaryOptions: []
    },
    {
      name: "Chocolate Chip Cookies",
      slug: "chocolate-chip-cookies",
      description: "Soft, chewy cookies with generous chunks of premium chocolate and a hint of sea salt to enhance the flavor.",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      categoryId: createdCategories[2].id, // Cookies
      featured: true,
      isBestseller: false,
      isNew: false,
      isPopular: true,
      dietaryOptions: []
    },
    {
      name: "Buttery Croissants",
      slug: "buttery-croissants",
      description: "Flaky, buttery layers with a golden exterior and soft, airy interior. Baked fresh every morning.",
      price: 3.99,
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      categoryId: createdCategories[1].id, // Pastries
      featured: true,
      isBestseller: false,
      isNew: false,
      isPopular: false,
      dietaryOptions: []
    },
    {
      name: "Sourdough Bread",
      slug: "sourdough-bread",
      description: "Artisan sourdough loaf with a crispy crust and soft interior.",
      price: 6.99,
      image: "https://images.pexels.com/photos/1387072/pexels-photo-1387072.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      categoryId: createdCategories[3].id, // Breads
      featured: false,
      isBestseller: false,
      isNew: false,
      isPopular: false,
      dietaryOptions: ["vegan"]
    },
    {
      name: "French Macarons",
      slug: "french-macarons",
      description: "Delicate almond meringue cookies with ganache filling.",
      price: 18.99,
      image: "https://images.unsplash.com/photo-1558326567-98ae2405596b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      categoryId: createdCategories[1].id, // Pastries
      featured: false,
      isBestseller: false,
      isNew: true,
      isPopular: false,
      dietaryOptions: ["gluten-free"]
    },
    {
      name: "Cinnamon Rolls",
      slug: "cinnamon-rolls",
      description: "Soft rolls with cinnamon-sugar filling and cream cheese frosting.",
      price: 14.99,
      image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80",
      categoryId: createdCategories[1].id, // Pastries
      featured: false,
      isBestseller: false,
      isNew: false,
      isPopular: false,
      dietaryOptions: []
    },
    {
      name: "Baguette",
      slug: "baguette",
      description: "Traditional French baguette with a crispy crust and soft interior.",
      price: 4.99,
      image: "https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      categoryId: createdCategories[3].id, // Breads
      featured: false,
      isBestseller: false,
      isNew: false,
      isPopular: false,
      dietaryOptions: ["vegan"]
    },
    {
      name: "Shortbread Cookies",
      slug: "shortbread-cookies",
      description: "Buttery, crumbly traditional Scottish shortbread cookies.",
      price: 9.99,
      image: "https://images.pexels.com/photos/14000207/pexels-photo-14000207.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      categoryId: createdCategories[2].id, // Cookies
      featured: false,
      isBestseller: false,
      isNew: false,
      isPopular: false,
      dietaryOptions: []
    },
    {
      name: "Blueberry Muffins",
      slug: "blueberry-muffins",
      description: "Soft and fluffy muffins packed with fresh blueberries.",
      price: 10.99,
      image: "https://images.pexels.com/photos/3724/food-morning-breakfast-orange-juice.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      categoryId: createdCategories[1].id, // Pastries
      featured: false,
      isBestseller: false,
      isNew: true,
      isPopular: false,
      dietaryOptions: []
    },
    {
      name: "Sugar Cookies",
      slug: "sugar-cookies",
      description: "Classic sugar cookies with a soft center and slightly crisp edges.",
      price: 8.99,
      image: "https://images.pexels.com/photos/4686977/pexels-photo-4686977.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      categoryId: createdCategories[2].id, // Cookies
      featured: false,
      isBestseller: false,
      isNew: false,
      isPopular: false,
      dietaryOptions: []
    },
    {
      name: "Olive Focaccia",
      slug: "olive-focaccia",
      description: "Italian-style focaccia bread with olives and rosemary.",
      price: 7.99,
      image: "https://images.pexels.com/photos/6605308/pexels-photo-6605308.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      categoryId: createdCategories[3].id, // Breads
      featured: false,
      isBestseller: false,
      isNew: false,
      isPopular: false,
      dietaryOptions: ["vegan"]
    },
    {
      name: "Chocolate Eclairs",
      slug: "chocolate-eclairs",
      description: "Light choux pastry filled with vanilla cream and topped with chocolate glaze.",
      price: 16.99,
      image: "https://images.pexels.com/photos/6133457/pexels-photo-6133457.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      categoryId: createdCategories[1].id, // Pastries
      featured: false,
      isBestseller: false,
      isNew: false,
      isPopular: true,
      dietaryOptions: []
    }
  ];

  for (const product of productData) {
    await storage.createProduct(product);
  }
}
