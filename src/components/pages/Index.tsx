import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import CTASection from "@/components/home/CTASection";
import BlogSection from "@/components/home/BlogSection";
import HealthQuestionsSection from "@/components/home/HealthQuestionsSection";
import ContactSection from "@/components/home/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <CTASection />
        <BlogSection />
        <HealthQuestionsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
