import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Mission } from "@/components/Mission";
import { PackageShowcase } from "@/components/PackageShowcase";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Mission />
        <PackageShowcase />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
