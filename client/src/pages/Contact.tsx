import { useState } from "react";
import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    
    reset();
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <Helmet>
        <title>Contact Us | SweetBite Bakery</title>
        <meta name="description" content="Get in touch with SweetBite Bakery. Visit us at our location, call us, or send us a message. We'd love to hear from you!" />
        <meta property="og:title" content="Contact Us | SweetBite Bakery" />
        <meta property="og:description" content="Get in touch with SweetBite Bakery. We'd love to hear from you!" />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-neutral to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-primary mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-text-dark leading-relaxed">
              Have a question, special request, or just want to say hello? 
              We'd love to hear from you!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="font-heading text-3xl font-bold text-primary mb-8">
                Contact Information
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start bg-neutral p-6 rounded-xl">
                  <div className="bg-primary text-white p-3 rounded-lg mr-4">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary mb-2">Visit Us</h3>
                    <p className="text-gray-700">
                      123 Bakery Lane, Sweet District<br />
                      Metropolis, 54321
                    </p>
                  </div>
                </div>

                <div className="flex items-start bg-neutral p-6 rounded-xl">
                  <div className="bg-primary text-white p-3 rounded-lg mr-4">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary mb-2">Call Us</h3>
                    <p className="text-gray-700">(555) 123-4567</p>
                    <p className="text-sm text-gray-500 mt-1">Available during business hours</p>
                  </div>
                </div>

                <div className="flex items-start bg-neutral p-6 rounded-xl">
                  <div className="bg-primary text-white p-3 rounded-lg mr-4">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary mb-2">Email Us</h3>
                    <p className="text-gray-700">hello@sweetbite.com</p>
                    <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start bg-neutral p-6 rounded-xl">
                  <div className="bg-primary text-white p-3 rounded-lg mr-4">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary mb-2">Business Hours</h3>
                    <div className="text-gray-700">
                      <p>Monday - Friday: 7:00 AM - 8:00 PM</p>
                      <p>Saturday: 8:00 AM - 8:00 PM</p>
                      <p>Sunday: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-8 bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                <p className="text-gray-500">Map placeholder</p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-heading text-3xl font-bold text-primary mb-8">
                Send Us a Message
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    data-testid="input-name"
                    {...register("name", { required: "Name is required" })}
                    className={`w-full ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="input-email"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    className={`w-full ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    type="text"
                    data-testid="input-subject"
                    {...register("subject", { required: "Subject is required" })}
                    className={`w-full ${errors.subject ? 'border-red-500' : ''}`}
                    placeholder="What's this about?"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    data-testid="textarea-message"
                    {...register("message", { required: "Message is required" })}
                    className={`w-full min-h-[150px] ${errors.message ? 'border-red-500' : ''}`}
                    placeholder="Tell us what's on your mind..."
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center justify-center"
                  data-testid="button-submit"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message <Send className="ml-2" size={18} />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-sm text-gray-500 mt-4 text-center">
                * Required fields
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-neutral">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl font-bold text-primary mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl">
                <h3 className="font-semibold text-lg text-primary mb-2">
                  Do you take custom cake orders?
                </h3>
                <p className="text-gray-700">
                  Yes! We love creating custom cakes for special occasions. Please contact us at least 
                  48 hours in advance for custom orders. You can call us or fill out the contact form above.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl">
                <h3 className="font-semibold text-lg text-primary mb-2">
                  Do you offer delivery?
                </h3>
                <p className="text-gray-700">
                  Yes, we offer delivery within a 10-mile radius of our bakery. Delivery fees may apply 
                  depending on distance. Contact us for more details on delivery options.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl">
                <h3 className="font-semibold text-lg text-primary mb-2">
                  Do you have gluten-free or vegan options?
                </h3>
                <p className="text-gray-700">
                  Absolutely! We offer a variety of gluten-free and vegan products. Check our products 
                  page or contact us to learn more about our dietary-friendly options.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl">
                <h3 className="font-semibold text-lg text-primary mb-2">
                  Can I place a bulk order for an event?
                </h3>
                <p className="text-gray-700">
                  Yes! We cater for events of all sizes. Please contact us with details about your event, 
                  and we'll work with you to create the perfect menu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
