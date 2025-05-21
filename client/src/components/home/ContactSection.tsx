import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { contactFormSchema, type ContactForm } from '@shared/schema';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const ContactSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest('POST', '/api/contact', data);
      const result = await response.json();
      toast({
        title: "Message Sent!",
        description: result.message || "We'll get back to you as soon as possible.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16" id="contact">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap">
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-6">Contact Us</h2>
            <p className="text-text-dark mb-8">
              Have questions or special requests? We'd love to hear from you. Fill out the form and we'll get back to you as soon as possible.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block mb-2 font-semibold">Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block mb-2 font-semibold">Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your email" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block mb-2 font-semibold">Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="order">Order Inquiry</SelectItem>
                          <SelectItem value="custom">Custom Order Request</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block mb-2 font-semibold">Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={5} 
                          placeholder="Your message" 
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primary text-white py-3 px-6 rounded-md font-semibold hover:bg-opacity-90 transition"
                >
                  Send Message
                </Button>
              </form>
            </Form>
          </div>
          
          <div className="w-full lg:w-1/2 lg:pl-12">
            <div className="bg-white rounded-lg shadow-lg p-8 h-full">
              <h3 className="font-heading text-2xl font-bold text-primary mb-6">Visit Our Bakery</h3>
              
              <img 
                src="https://pixabay.com/get/gc783161329cbc70b4a5d934cce54b9c3fded1c68f82c4cf64c069b3b263e034b4357903d4bdc19ba4a36bfcd007aef90cb1ef0cdc83abc63e7cb5dce5738a67a_1280.jpg" 
                alt="SweetBite Bakery Storefront" 
                className="w-full h-60 object-cover rounded-lg mb-6"
              />
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="text-primary mt-1 mr-4" />
                  <div>
                    <h4 className="font-bold">Address</h4>
                    <p className="text-text-dark">123 Baker Street, Sweetville, CA 90210</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="text-primary mt-1 mr-4" />
                  <div>
                    <h4 className="font-bold">Hours</h4>
                    <p className="text-text-dark">Monday - Friday: 7am - 7pm</p>
                    <p className="text-text-dark">Saturday: 8am - 8pm</p>
                    <p className="text-text-dark">Sunday: 8am - 5pm</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="text-primary mt-1 mr-4" />
                  <div>
                    <h4 className="font-bold">Phone</h4>
                    <p className="text-text-dark">(555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="text-primary mt-1 mr-4" />
                  <div>
                    <h4 className="font-bold">Email</h4>
                    <p className="text-text-dark">hello@sweetbite.com</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-bold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="bg-neutral w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-accent transition">
                    <Facebook size={18} />
                  </a>
                  <a href="#" className="bg-neutral w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-accent transition">
                    <Instagram size={18} />
                  </a>
                  <a href="#" className="bg-neutral w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-accent transition">
                    <Twitter size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
