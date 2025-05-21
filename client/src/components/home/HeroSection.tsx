import { Link } from 'wouter';

const HeroSection = () => {
  return (
    <section className="bg-secondary py-20" id="home">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center">
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Delicious <span className="text-accent">Treats</span>, Made With Love
            </h1>
            <p className="text-text-dark text-lg mb-8 max-w-lg">
              Welcome to SweetBite Bakery! We create handcrafted pastries, cakes, and breads using only the finest ingredients and time-honored recipes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <a className="btn-primary">
                  Shop Now
                </a>
              </Link>
              <Link href="/#about">
                <a className="btn-secondary">
                  Learn More
                </a>
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
              alt="Assorted bakery goods display" 
              className="rounded-xl shadow-2xl mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
