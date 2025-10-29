import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { Award, Heart, Users, ChefHat, Clock, Sparkles } from "lucide-react";

const AboutUs = () => {
  return (
    <Layout>
      <Helmet>
        <title>About Us | SweetBite Bakery</title>
        <meta name="description" content="Learn about SweetBite Bakery's story, our passion for baking, and our commitment to quality. Crafting delightful memories with every bite since 2015." />
        <meta property="og:title" content="About Us | SweetBite Bakery" />
        <meta property="og:description" content="Learn about SweetBite Bakery's story, our passion for baking, and our commitment to quality." />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-neutral to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-primary mb-6">
              Our Story
            </h1>
            <p className="text-xl text-text-dark leading-relaxed">
              Crafting delightful memories with every bite since 2015. Welcome to SweetBite Bakery, 
              where passion meets perfection in every creation.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-4xl font-bold text-primary mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                At SweetBite Bakery, we believe that every occasion deserves something special. 
                Our mission is to bring joy to your celebrations and comfort to your everyday moments 
                through exceptional baked goods crafted with love and the finest ingredients.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We're committed to preserving traditional baking methods while embracing innovation, 
                ensuring each product meets our high standards of quality, taste, and freshness.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-primary text-white p-3 rounded-lg mr-4">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-primary mb-2">Baked with Love</h3>
                    <p className="text-gray-600">Every item is made with care and attention to detail</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary text-white p-3 rounded-lg mr-4">
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-primary mb-2">Premium Quality</h3>
                    <p className="text-gray-600">Only the finest ingredients make it into our recipes</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary text-white p-3 rounded-lg mr-4">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-primary mb-2">Fresh Daily</h3>
                    <p className="text-gray-600">Baked fresh every morning for maximum flavor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-neutral">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-primary mb-4">
              What We Stand For
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Our values guide everything we do, from selecting ingredients to serving our customers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <ChefHat className="text-primary" size={32} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-primary mb-4 text-center">
                Craftsmanship
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Each product is handcrafted by our skilled bakers who bring years of experience 
                and passion to their work.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="text-primary" size={32} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-primary mb-4 text-center">
                Community
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                We're proud to be part of this community, supporting local suppliers and creating 
                gathering spaces for neighbors.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="bg-accent/20 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Sparkles className="text-primary" size={32} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-primary mb-4 text-center">
                Innovation
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                While honoring tradition, we continuously explore new flavors and techniques 
                to delight our customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-4xl font-bold text-primary mb-8 text-center">
              How It All Began
            </h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                SweetBite Bakery was born from a simple dream: to share the joy of homemade baked goods 
                with our community. What started as a small kitchen operation in 2015 has grown into a 
                beloved neighborhood bakery, but our core values remain unchanged.
              </p>
              <p>
                Our founder, inspired by family recipes passed down through generations, combined traditional 
                techniques with modern flavors to create something truly special. Each recipe is tested and 
                perfected to ensure it meets our exacting standards.
              </p>
              <p>
                Today, we're proud to serve thousands of satisfied customers, from busy professionals grabbing 
                their morning pastry to families celebrating life's special moments with our custom cakes. 
                Every product that leaves our bakery carries with it our commitment to quality and our passion 
                for the craft.
              </p>
              <p className="font-semibold text-primary text-xl text-center pt-8">
                Thank you for being part of our journey. We look forward to serving you!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/90">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6">
            Visit Us Today
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Come experience the SweetBite difference. Our doors are open, and we can't wait to serve you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/products"
              className="bg-white text-primary hover:bg-accent hover:text-primary px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-block"
              data-testid="link-products"
            >
              Browse Products
            </a>
            <a 
              href="/contact"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-xl font-semibold transition-all duration-300 inline-block"
              data-testid="link-contact"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutUs;
