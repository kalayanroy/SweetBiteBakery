import { Award, Leaf, Heart } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="py-16 bg-secondary" id="about">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center">
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
            <img 
              src="https://images.unsplash.com/photo-1523294587484-bae6cc870010?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
              alt="SweetBite Bakery Interior" 
              className="rounded-xl shadow-xl mx-auto"
            />
          </div>
          <div className="w-full lg:w-1/2 lg:pl-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-6">Our Story</h2>
            <p className="text-text-dark mb-6">
              SweetBite Bakery was founded in 2015 by passionate pastry chef Maria Johnson, who turned her childhood dream into a reality. What started as a small neighborhood bakery has grown into a beloved local institution known for quality, creativity, and exceptional taste.
            </p>
            <p className="text-text-dark mb-6">
              We believe in using only the finest ingredients - organic flour, European butter, free-range eggs, and seasonal fruits. Every item is made fresh daily by our team of dedicated bakers who bring decades of combined experience to our kitchen.
            </p>
            
            <div className="flex flex-wrap gap-8 mt-8">
              <div className="flex items-center">
                <Award className="text-primary mr-4" size={32} />
                <div>
                  <h3 className="font-bold text-lg">Award Winning</h3>
                  <p className="text-sm text-text-dark">Best Local Bakery 2022</p>
                </div>
              </div>
              <div className="flex items-center">
                <Leaf className="text-primary mr-4" size={32} />
                <div>
                  <h3 className="font-bold text-lg">All Natural</h3>
                  <p className="text-sm text-text-dark">No artificial ingredients</p>
                </div>
              </div>
              <div className="flex items-center">
                <Heart className="text-primary mr-4" size={32} />
                <div>
                  <h3 className="font-bold text-lg">Made With Love</h3>
                  <p className="text-sm text-text-dark">Crafted by hand daily</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
