import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import AboutSection from "@/components/home/AboutSection";
import DoctorsSection from "@/components/home/DoctorsSection";
import ServicesSection from "@/components/home/ServicesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import MapSection from "@/components/home/MapSection";
import ProductHighlightSection from "@/components/home/ProductHighlightSection";
import Footer from "@/components/Footer";
import EmergencyFloat from "@/components/EmergencyFloat";
import MobileBottomBar from "@/components/MobileBottomBar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <DoctorsSection />
        <CTASection />
        <ProductHighlightSection />
        <TestimonialsSection />
        <MapSection />
      </main>
      <Footer />
      <EmergencyFloat />
      <MobileBottomBar />
    </div>
  );
};

export default Index;
