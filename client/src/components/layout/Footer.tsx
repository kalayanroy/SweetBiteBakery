import { Link } from 'wouter';
import { Facebook, Instagram, Twitter, Send, MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#32261A] to-[#231815] text-white">
      {/* Upper Section */}
      <div className="container mx-auto px-4 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <div className="mb-6">
              <h2 className="font-heading text-3xl font-bold mb-1 text-white">SweetBite</h2>
              <p className="text-accent/80 text-sm uppercase tracking-widest font-semibold">Artisan Bakery</p>
            </div>
            <p className="mb-6 text-gray-300 leading-relaxed">
              Crafting delightful memories with every bite since 2015. 
              Our passion is baking happiness using only the finest ingredients 
              and traditional recipes passed down through generations.
            </p>
            
            {/* Contact Details */}
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start">
                <MapPin size={18} className="mr-3 mt-1 text-accent" />
                <span>123 Bakery Lane, Sweet District<br />Metropolis, 54321</span>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="mr-3 text-accent" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="mr-3 text-accent" />
                <span>hello@sweetbite.com</span>
              </div>
              <div className="flex items-center">
                <Clock size={18} className="mr-3 text-accent" />
                <span>Mon-Sat: 7:00 AM - 8:00 PM</span>
              </div>
            </div>
          </div>
          
          {/* Links Columns */}
          <div className="lg:col-span-2 md:mt-0 mt-6">
            <h4 className="font-heading text-lg font-bold mb-6 text-white relative inline-block after:absolute after:w-10 after:h-0.5 after:bg-accent after:-bottom-2 after:left-0">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/products">
                  <div className="text-gray-300 hover:text-accent hover:translate-x-1 transition-all duration-300 cursor-pointer flex items-center">
                    <span className="text-xs mr-2">•</span>All Products
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/products?category=cakes">
                  <div className="text-gray-300 hover:text-accent hover:translate-x-1 transition-all duration-300 cursor-pointer flex items-center">
                    <span className="text-xs mr-2">•</span>Cakes
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/products?category=pastries">
                  <div className="text-gray-300 hover:text-accent hover:translate-x-1 transition-all duration-300 cursor-pointer flex items-center">
                    <span className="text-xs mr-2">•</span>Pastries
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/products?category=cookies">
                  <div className="text-gray-300 hover:text-accent hover:translate-x-1 transition-all duration-300 cursor-pointer flex items-center">
                    <span className="text-xs mr-2">•</span>Cookies
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/products?category=breads">
                  <div className="text-gray-300 hover:text-accent hover:translate-x-1 transition-all duration-300 cursor-pointer flex items-center">
                    <span className="text-xs mr-2">•</span>Breads
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="font-heading text-lg font-bold mb-6 text-white relative inline-block after:absolute after:w-10 after:h-0.5 after:bg-accent after:-bottom-2 after:left-0">Information</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about">
                  <div className="text-gray-300 hover:text-accent hover:translate-x-1 transition-all duration-300 cursor-pointer flex items-center">
                    <span className="text-xs mr-2">•</span>About Us
                  </div>
                </Link>
              </li>
              <li>
                <div className="text-gray-300 hover:text-accent hover:translate-x-1 transition-all duration-300 cursor-pointer flex items-center">
                  <span className="text-xs mr-2">•</span>Delivery Info
                </div>
              </li>
              <li>
                <div className="text-gray-300 hover:text-accent hover:translate-x-1 transition-all duration-300 cursor-pointer flex items-center">
                  <span className="text-xs mr-2">•</span>Return Policy
                </div>
              </li>
              <li>
                <div className="text-gray-300 hover:text-accent hover:translate-x-1 transition-all duration-300 cursor-pointer flex items-center">
                  <span className="text-xs mr-2">•</span>FAQ
                </div>
              </li>
              <li>
                <Link href="/contact">
                  <div className="text-gray-300 hover:text-accent hover:translate-x-1 transition-all duration-300 cursor-pointer flex items-center">
                    <span className="text-xs mr-2">•</span>Contact Us
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Newsletter and Social Media */}
          <div className="lg:col-span-4 md:pt-0 pt-2">
            <h4 className="font-heading text-lg font-bold mb-6 text-white relative inline-block after:absolute after:w-10 after:h-0.5 after:bg-accent after:-bottom-2 after:left-0">Join Our Newsletter</h4>
            <p className="mb-5 text-gray-300">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="flex mb-8">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-1 bg-white/10 border border-white/20 px-4 py-3 rounded-l-md focus:outline-none focus:bg-white/20 text-white placeholder:text-gray-400"
              />
              <Button className="rounded-l-none bg-accent hover:bg-accent/90 text-primary px-4 py-3 flex items-center">
                Subscribe <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
            
            <div className="mt-8">
              <h5 className="text-white font-semibold mb-3">Follow Us</h5>
              <div className="flex space-x-4">
                <a href="#" className="bg-white/10 hover:bg-accent/90 hover:text-primary transition-all duration-300 h-10 w-10 rounded-full flex items-center justify-center">
                  <Facebook size={18} />
                </a>
                <a href="#" className="bg-white/10 hover:bg-accent/90 hover:text-primary transition-all duration-300 h-10 w-10 rounded-full flex items-center justify-center">
                  <Instagram size={18} />
                </a>
                <a href="#" className="bg-white/10 hover:bg-accent/90 hover:text-primary transition-all duration-300 h-10 w-10 rounded-full flex items-center justify-center">
                  <Twitter size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} SweetBite Bakery. All rights reserved.</p>
          <div className="mt-3 md:mt-0 flex space-x-6">
            <span className="hover:text-accent cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-accent cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-accent cursor-pointer transition-colors">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
