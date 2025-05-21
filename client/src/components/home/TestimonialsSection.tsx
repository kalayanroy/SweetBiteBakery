import { getRandomTestimonials } from '@/lib/utils';
import { Star, StarHalf } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = getRandomTestimonials(3);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">What Our Customers Say</h2>
          <p className="text-text-dark max-w-2xl mx-auto">Don't just take our word for it - hear from our happy customers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="text-accent flex">
                  {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                    <Star key={i} className="fill-current" />
                  ))}
                  {testimonial.rating % 1 !== 0 && <StarHalf className="fill-current" />}
                </div>
                <span className="ml-2 text-sm text-gray-500">{testimonial.rating.toFixed(1)}</span>
              </div>
              <p className="text-text-dark mb-6 italic">{testimonial.text}</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-primary font-bold">
                  {testimonial.initials}
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-primary">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
