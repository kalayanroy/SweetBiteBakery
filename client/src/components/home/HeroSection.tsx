import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-[#faf6f1] to-white pt-24 pb-20" id="home">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center">
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0 pr-0 lg:pr-12">
            {/* The small accent above the headline */}
            <div className="flex items-center mb-4">
              <div className="h-[2px] w-10 bg-primary mr-3"></div>
              <span className="text-accent uppercase tracking-widest text-sm font-bold">Premium Quality</span>
            </div>

            {/* Main headline with animated gradient */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Artisanal <span className="relative inline-block">
                <span className="relative z-10 text-primary">Baked Goods</span>
                <span className="absolute bottom-1 sm:bottom-2 left-0 w-full h-3 sm:h-4 bg-accent/25 -rotate-1 z-0"></span>
              </span> Crafted With Passion
            </h1>

            {/* Description paragraph */}
            <p className="text-text-dark text-base sm:text-lg mb-8 max-w-lg leading-relaxed">
              Welcome to SweetBite, where every treat tells a story. We create handcrafted pastries, cakes,
              and breads using only the finest ingredients and time-honored recipes passed down through generations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <div className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all duration-300 cursor-pointer group">
                  Shop Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" size={18} />
                </div>
              </Link>
              <Link href="/#about">
                <div className="inline-flex items-center px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-full font-bold hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                  Learn More
                </div>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 pt-8 border-t border-[#e3d9c8] grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
              <div className="text-center">
                <div className="text-primary font-heading font-bold text-xl">100%</div>
                <div className="text-sm text-gray-600">Natural Ingredients</div>
              </div>
              <div className="text-center">
                <div className="text-primary font-heading font-bold text-xl">50+</div>
                <div className="text-sm text-gray-600">Unique Recipes</div>
              </div>
              <div className="text-center">
                <div className="text-primary font-heading font-bold text-xl">10 Years</div>
                <div className="text-sm text-gray-600">Of Excellence</div>
              </div>
            </div>
          </div>

          {/* Image container with decorative elements */}
          <div className="w-full lg:w-1/2 relative">
            {/* Decorative elements */}
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-accent/30 rounded-full blur-xl z-0"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-xl z-0"></div>

            {/* Main image with decorative border */}
            <div className="relative z-10 p-3 bg-white rounded-2xl shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80"
                alt="Assorted luxury bakery goods display"
                className="rounded-xl shadow-sm w-full h-auto object-cover"
              />

              {/* Floating badge */}
              <div className="absolute -right-5 -bottom-5 bg-white px-6 py-3 rounded-lg shadow-md">
                <div className="text-primary font-heading font-bold">Fresh Daily</div>
                <div className="text-sm text-gray-600">Baked with love</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
