import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  TrendingUp, 
  Clock, 
  Leaf, 
  PiggyBank, 
  ArrowRight,
  CheckCircle2,
  Calendar,
  DollarSign
} from "lucide-react";

interface Package {
  id: string;
  name: string;
  description: string;
  min_investment: number;
  expected_roi_min: number;
  expected_roi_max: number;
  duration_months: number;
  business_type: string;
  image_url: string | null;
}

// Package-specific details
const packageDetails: Record<string, {
  icon: React.ReactNode;
  features: string[];
  timeline: string;
  roiInfo: string;
  imageUrl: string;
}> = {
  "maize": {
    icon: <Leaf className="w-8 h-8" />,
    features: [
      "Fast 90-120 day growth cycle",
      "High year-round demand",
      "Lower production risk",
      "Ideal for short-term investors",
    ],
    timeline: "ROI paid within 4-5 months after harvest",
    roiInfo: "Income from bulk sales to feed mills, poultry farms, and local markets",
    imageUrl: "https://images.unsplash.com/photo-1601593768799-76e3be0fad5f?w=600&h=400&fit=crop",
  },
  "pig": {
    icon: <PiggyBank className="w-8 h-8" />,
    features: [
      "Faster reproduction rates",
      "High meat demand",
      "Strong festive season pricing",
      "Higher ROI compared to crops",
    ],
    timeline: "Returns released within 6-7 months",
    roiInfo: "Sales to abattoirs, pork processors, and open market buyers",
    imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop",
  },
};

export default function PackageSelection() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Login Required",
        description: "Please login to view investment packages",
        variant: "destructive",
      });
      navigate("/investor/login");
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from("investment_packages")
          .select("*")
          .eq("is_active", true)
          .order("min_investment", { ascending: true });

        if (error) throw error;
        setPackages(data || []);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load packages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [toast]);

  const getPackageDetails = (pkg: Package) => {
    const type = pkg.business_type.toLowerCase();
    if (type.includes("maize") || type.includes("crop")) {
      return packageDetails.maize;
    }
    if (type.includes("pig") || type.includes("livestock")) {
      return packageDetails.pig;
    }
    return packageDetails.maize; // Default
  };

  const handleSelectPackage = (packageId: string) => {
    navigate(`/payment?package=${packageId}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              <Leaf className="w-3 h-3 mr-1" />
              Ghana-Based Investments
            </Badge>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Choose Your Investment Package
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Invest in sustainable agriculture and earn competitive returns. All investments are denominated in Ghana Cedis (GHS).
            </p>
          </div>
        </section>

        {/* Packages Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {packages.map((pkg) => {
                const details = getPackageDetails(pkg);
                return (
                  <Card 
                    key={pkg.id} 
                    className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                  >
                    {/* Package Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={pkg.image_url || details.imageUrl}
                        alt={pkg.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                          {details.icon}
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-xl text-foreground">
                            {pkg.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{pkg.business_type}</p>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-6">
                      <p className="text-muted-foreground">{pkg.description}</p>

                      {/* Key Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <DollarSign className="w-5 h-5 mx-auto text-primary mb-1" />
                          <p className="text-xs text-muted-foreground">Min. Investment</p>
                          <p className="font-bold text-primary">GHS {pkg.min_investment.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 bg-gold/10 rounded-lg">
                          <TrendingUp className="w-5 h-5 mx-auto text-gold mb-1" />
                          <p className="text-xs text-muted-foreground">Expected ROI</p>
                          <p className="font-bold text-gold">{pkg.expected_roi_min}%-{pkg.expected_roi_max}%</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <Calendar className="w-5 h-5 mx-auto text-sky mb-1" />
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="font-bold">{pkg.duration_months} months</p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Why invest?</p>
                        <ul className="space-y-2">
                          {details.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* ROI Info */}
                      <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="font-medium">{details.timeline}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{details.roiInfo}</p>
                      </div>

                      {/* CTA Button */}
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => handleSelectPackage(pkg.id)}
                      >
                        Invest in {pkg.name}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {packages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No investment packages available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
              <div>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading font-bold mb-2">Verified Farms</h3>
                <p className="text-sm text-muted-foreground">
                  All farms are verified and regularly inspected for quality assurance
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-gold" />
                </div>
                <h3 className="font-heading font-bold mb-2">Guaranteed Returns</h3>
                <p className="text-sm text-muted-foreground">
                  Competitive ROI based on market conditions and agricultural cycles
                </p>
              </div>
              <div>
                <div className="w-16 h-16 bg-earth/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-earth" />
                </div>
                <h3 className="font-heading font-bold mb-2">Sustainable Farming</h3>
                <p className="text-sm text-muted-foreground">
                  Supporting local farmers and sustainable agricultural practices
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
