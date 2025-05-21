import { Helmet } from "react-helmet";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategorySection from "@/components/home/CategorySection";
import AboutSection from "@/components/home/AboutSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import ContactSection from "@/components/home/ContactSection";

const Home = () => {
  return (
    <Layout>
      <Helmet>
        <title>SweetBite Bakery - Delicious Treats Made With Love</title>
        <meta name="description" content="Welcome to SweetBite Bakery! We create handcrafted pastries, cakes, and breads using only the finest ingredients and time-honored recipes." />
        <meta property="og:title" content="SweetBite Bakery - Delicious Treats Made With Love" />
        <meta property="og:description" content="Discover our handcrafted pastries, cakes, and breads made with only the finest ingredients." />
        <meta property="og:type" content="website" />
      </Helmet>

      <main>
        <HeroSection />
        <FeaturedProducts />
        <CategorySection />
        <AboutSection />
        <TestimonialsSection />
        <NewsletterSection />
        <ContactSection />
      </main>
    </Layout>
  );
};

export default Home;
