import { useQuery } from "@tanstack/react-query";
import { Link } from 'wouter';
import { Category } from "@shared/schema";

const CategorySection = () => {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const categoryImages = {
    cakes: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80",
    pastries: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80",
    cookies: "https://pixabay.com/get/g19670e7456ed7cc3b584ce328abd02ef81d9ed440ad02f1082867c6a8b3d6586ed0e3fdbf7dd2a0f0d466fa959e8a11fec392092d73d76a7fbf5eaa359490650_1280.jpg",
    breads: "https://pixabay.com/get/g73324af165ea682e4b2b77d48bde7c5f98dffa20eb07ebfb24b390282f53a072054c0cb3b9adcac01dfb8f649fed324ae505697d290b67f08fd4a9b05aaa4102_1280.jpg"
  };

  return (
    <section className="py-16 bg-neutral" id="products">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">Browse By Category</h2>
          <p className="text-text-dark max-w-2xl mx-auto">Explore our wide range of freshly baked goods organized by category.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg shadow-lg h-64 bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            Failed to load categories. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories && categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.slug}`}>
                <a className="group">
                  <div className="relative overflow-hidden rounded-lg shadow-lg h-64">
                    <img 
                      src={categoryImages[category.slug as keyof typeof categoryImages]} 
                      alt={category.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                      <h3 className="font-heading text-2xl font-bold text-white">{category.name}</h3>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection;
