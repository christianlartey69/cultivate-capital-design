import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, DollarSign, ArrowRight, ChevronDown, ChevronUp, Users, Shield, Eye, Coins } from "lucide-react";
import { Link } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import growthIcon from "@/assets/growth-icon.png";
import harvestIcon from "@/assets/harvest-icon.png";
import partnershipIcon from "@/assets/partnership-icon.png";

const packages = [
  {
    id: 1,
    name: "Kade Maize Package",
    description: "Invest in sustainable maize farming in Kade, Eastern Region. Fast growth cycle with reliable returns.",
    minInvestment: "GHS 2,000",
    expectedROI: "10-15%",
    duration: "4-5 months",
    farmingCycle: "90-120 days from planting to harvest",
    category: "Crop Farming",
    icon: growthIcon,
    featured: false,
    location: "Kade, Eastern Region",
  },
  {
    id: 2,
    name: "Anum Pig Farm Package",
    description: "Premium pig farming investment in Anum with strong festive season pricing and high meat demand.",
    minInvestment: "GHS 5,000",
    expectedROI: "14-18%",
    duration: "6-7 months",
    farmingCycle: "5-6 months to market-ready weight",
    category: "Livestock Farming",
    icon: harvestIcon,
    featured: true,
    location: "Anum, Eastern Region",
  },
  {
    id: 3,
    name: "Goat Farming Package",
    description: "Sustainable goat farming with steady returns. Lower risk investment with growing market demand.",
    minInvestment: "GHS 3,000",
    expectedROI: "12-16%",
    duration: "8-10 months",
    farmingCycle: "8-10 months breeding and fattening cycle",
    category: "Livestock Farming",
    icon: partnershipIcon,
    featured: false,
    location: "Various Locations, Ghana",
  },
];

const cesExplanation = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Certified Partner Farmers",
    description: "CES works exclusively with certified and vetted farmers who meet our strict quality and ethical standards.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Direct Farmer Linkage",
    description: "Each investor is linked to a specific farmer, ensuring transparency and accountability in how your funds are utilized.",
  },
  {
    icon: <Coins className="w-5 h-5" />,
    title: "Direct Farm Funding",
    description: "Your investment funds are used directly for farming activities including seeds, feed, equipment, and labor.",
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "Active Monitoring",
    description: "CES monitors each farmer to ensure strict adherence to farming timelines and production targets.",
  },
];

const returnStructure = [
  { recipient: "Investor", description: "Principal + ROI (10-18% depending on package)" },
  { recipient: "Farmer", description: "Agreed portion based on contract terms" },
  { recipient: "CES", description: "Management margin for oversight and coordination" },
];

export const PackageShowcase = () => {
  const [openPackages, setOpenPackages] = useState<number[]>([]);

  const togglePackage = (id: number) => {
    setOpenPackages(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Investment Packages
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
            Invest in Ghana's agricultural future. All packages denominated in Ghana Cedis (GHS).
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

                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="flex items-center gap-2 text-muted-foreground font-body">
                    <Calendar className="h-4 w-4" />
                    Duration
                  </span>
                  <span className="font-heading font-semibold text-lg">{pkg.duration}</span>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Farming Cycle:</span> {pkg.farmingCycle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Location: {pkg.location}
                  </p>
                </div>

                <Badge variant="outline" className="w-full justify-center py-2">
                  {pkg.category}
                </Badge>

                {/* View More Section */}
                <Collapsible open={openPackages.includes(pkg.id)} onOpenChange={() => togglePackage(pkg.id)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full text-sm">
                      {openPackages.includes(pkg.id) ? (
                        <>View Less <ChevronUp className="ml-2 h-4 w-4" /></>
                      ) : (
                        <>How It Works <ChevronDown className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="space-y-3">
                      {cesExplanation.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="text-muted-foreground text-xs">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <p className="font-medium text-sm mb-2">Return Structure</p>
                      <div className="space-y-1">
                        {returnStructure.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{item.recipient}:</span>
                            <span className="text-foreground">{item.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground italic">
                      CES prevents circumvention through continuous supervision, regular reporting, and scheduled farm visits.
                    </p>
                  </CollapsibleContent>
                </Collapsible>
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
