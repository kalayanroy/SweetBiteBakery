import { Link } from 'wouter';
import { Facebook, Instagram, Twitter, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-text-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading text-2xl font-bold mb-6">SweetBite</h3>
            <p className="mb-6 opacity-80">
              Crafting delightful memories with every bite since 2015. Our passion is baking happiness.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="opacity-80 hover:opacity-100 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="opacity-80 hover:opacity-100 transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="opacity-80 hover:opacity-100 transition">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading text-xl font-bold mb-6">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/products">
                  <a className="opacity-80 hover:opacity-100 transition">All Products</a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=cakes">
                  <a className="opacity-80 hover:opacity-100 transition">Cakes</a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=pastries">
                  <a className="opacity-80 hover:opacity-100 transition">Pastries</a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=cookies">
                  <a className="opacity-80 hover:opacity-100 transition">Cookies</a>
                </Link>
              </li>
              <li>
                <Link href="/products?category=breads">
                  <a className="opacity-80 hover:opacity-100 transition">Breads</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading text-xl font-bold mb-6">Information</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/#about">
                  <a className="opacity-80 hover:opacity-100 transition">About Us</a>
                </Link>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 transition">Delivery Information</a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 transition">Return Policy</a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 transition">FAQ</a>
              </li>
              <li>
                <Link href="/#contact">
                  <a className="opacity-80 hover:opacity-100 transition">Contact Us</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading text-xl font-bold mb-6">Newsletter</h4>
            <p className="mb-4 opacity-80">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-1 bg-white bg-opacity-20 px-4 py-2 rounded-l-md focus:outline-none focus:bg-opacity-30"
              />
              <button className="bg-accent text-primary px-4 py-2 rounded-r-md font-semibold hover:bg-opacity-90 transition">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-white border-opacity-20 text-center opacity-60">
          <p>&copy; {new Date().getFullYear()} SweetBite Bakery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
