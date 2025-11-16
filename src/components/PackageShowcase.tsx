import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import growthIcon from "@/assets/growth-icon.png";
import harvestIcon from "@/assets/harvest-icon.png";
import partnershipIcon from "@/assets/partnership-icon.png";

const packages = [
  {
    id: 1,
    name: "Seed Starter",
    description: "Perfect for first-time agriculture investors looking to start their portfolio.",
    minInvestment: "$5,000",
    expectedROI: "12-15%",
    duration: "6 months",
    category: "Crop Farming",
    icon: growthIcon,
    featured: false,
  },
  {
    id: 2,
    name: "Harvest Growth",
    description: "Balanced portfolio with diversified crop investments for steady returns.",
    minInvestment: "$15,000",
    expectedROI: "15-18%",
    duration: "12 months",
    category: "Mixed Farming",
    icon: harvestIcon,
    featured: true,
  },
  {
    id: 3,
    name: "Legacy Farm",
    description: "Premium long-term investment in sustainable agriculture with maximum returns.",
    minInvestment: "$50,000",
    expectedROI: "18-22%",
    duration: "24 months",
    category: "Premium Portfolio",
    icon: partnershipIcon,
    featured: false,
  },
];

export const PackageShowcase = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Investment Packages
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
            Choose from our curated agriculture investment opportunities designed for sustainable growth and reliable returns.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <Card 
              key={pkg.id}
              className={`vintage-border emboss-hover growth-animation relative overflow-hidden ${
                pkg.featured ? 'ring-2 ring-secondary' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {pkg.featured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-secondary text-secondary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className="w-16 h-16 mb-4">
                  <img src={pkg.icon} alt={pkg.name} className="w-full h-full object-contain" />
                </div>
                <CardTitle className="text-2xl font-heading">{pkg.name}</CardTitle>
                <CardDescription className="font-body text-base">
                  {pkg.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="flex items-center gap-2 text-muted-foreground font-body">
                    <DollarSign className="h-4 w-4" />
                    Min. Investment
                  </span>
                  <span className="font-heading font-semibold text-lg">{pkg.minInvestment}</span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="flex items-center gap-2 text-muted-foreground font-body">
                    <TrendingUp className="h-4 w-4" />
                    Expected ROI
                  </span>
                  <span className="font-heading font-semibold text-lg text-success">{pkg.expectedROI}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center gap-2 text-muted-foreground font-body">
                    <Calendar className="h-4 w-4" />
                    Duration
                  </span>
                  <span className="font-heading font-semibold text-lg">{pkg.duration}</span>
                </div>

                <Badge variant="outline" className="w-full justify-center py-2">
                  {pkg.category}
                </Badge>
              </CardContent>

              <CardFooter>
                <Button asChild className="w-full emboss-hover">
                  <Link to={`/packages/${pkg.id}`}>
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild className="emboss-hover">
            <Link to="/packages">
              View All Packages
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
