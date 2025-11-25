import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Mission } from "@/components/Mission";
import { HowItWorks } from "@/components/HowItWorks";
import { PackageShowcase } from "@/components/PackageShowcase";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Mission />
        <HowItWorks />
        <PackageShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
