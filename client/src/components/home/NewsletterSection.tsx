import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { newsletterSchema, type NewsletterSubscription } from '@shared/schema';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const NewsletterSection = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<NewsletterSubscription>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: NewsletterSubscription) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest('POST', '/api/newsletter', data);
      const result = await response.json();
      toast({
        title: "Success!",
        description: result.message || "Thank you for subscribing to our newsletter!",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Join Our Sweet Community</h2>
        <p className="text-white/90 max-w-2xl mx-auto mb-8">
          Subscribe to our newsletter for exclusive offers, new product announcements, and baking tips delivered straight to your inbox.
        </p>
        <div className="max-w-md mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input 
                        placeholder="Your email address" 
                        className="px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-accent" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-accent" />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-accent text-primary px-6 py-3 rounded-md font-bold hover:bg-opacity-90 transition"
              >
                Subscribe
              </Button>
            </form>
          </Form>
          <p className="text-white/70 text-sm mt-3">
            We respect your privacy and will never share your information.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
