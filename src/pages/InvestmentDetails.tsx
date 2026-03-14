import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, TrendingUp, DollarSign, Calendar, MapPin, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import maizeFarmHero from "@/assets/maize-farm-hero.jpg";
import pigFarmHero from "@/assets/pig-farm-hero.jpg";
import goatFarmHero from "@/assets/goat-farm-hero.jpg";

const packageData: Record<string, {
  name: string;
  tagline: string;
  heroImage: string;
  category: string;
  location: string;
  minInvestment: string;
  roi: string;
  duration: string;
  overview: string;
  steps: { title: string; description: string }[];
  fundUsage: string[];
  flowSteps: string[];
}> = {
  "1": {
    name: "Kade Maize Package",
    tagline: "Invest in sustainable maize farming in Kade, Eastern Region",
    heroImage: maizeFarmHero,
    category: "Crop Farming",
    location: "Kade, Eastern Region",
    minInvestment: "GHS 2,000",
    roi: "15%",
    duration: "4–5 months",
    overview:
      "The Kade Maize Package allows investors to fund maize farming operations. The capital is used to cultivate maize, harvest it, sell it in the market, and distribute profits to investors.",
    steps: [
      { title: "Contribute Capital", description: "Investor contributes capital to the maize farming project." },
      { title: "Farm Operations", description: "Funds are used for land preparation, seeds, fertilizers, and labour." },
      { title: "Growing Season", description: "Maize is planted and grown during the farming season." },
      { title: "Harvest & Sale", description: "The maize is harvested and sold to buyers and markets." },
      { title: "Profit Distribution", description: "Revenue from the sale is calculated and profit is distributed." },
    ],
    fundUsage: [
      "Land preparation",
      "Improved maize seeds",
      "Fertilizers and agro-chemicals",
      "Labour and farm management",
    ],
    flowSteps: ["Investor Capital", "Maize Farming Production", "Harvest", "Market Sales", "Investor Profit (15%)"],
  },
  "2": {
    name: "Anum Pig Farm Package",
    tagline: "Premium pig farming investment in Anum with high meat demand",
    heroImage: pigFarmHero,
    category: "Livestock Farming",
    location: "Anum, Eastern Region",
    minInvestment: "GHS 5,000",
    roi: "18%",
    duration: "6–7 months",
    overview:
      "The Pig Farm Investment Package allows investors to participate in commercial pig production for the meat market.",
    steps: [
      { title: "Fund Operations", description: "Investor funds pig farming operations." },
      { title: "Acquire & Manage", description: "Funds are used for piglets, feeding, veterinary care, and labour." },
      { title: "Growth Phase", description: "Pigs are raised and fattened to market weight." },
      { title: "Market Sales", description: "Mature pigs are sold to meat processors and markets." },
      { title: "Profit Distribution", description: "Revenue is calculated and profits are distributed." },
    ],
    fundUsage: [
      "Purchase of piglets",
      "Feeding and nutrition",
      "Veterinary care",
      "Farm labour and management",
    ],
    flowSteps: ["Investor Capital", "Purchase Piglets", "Feeding & Growth", "Market Sales", "Investor Profit (18%)"],
  },
  "3": {
    name: "Goat Farming Package",
    tagline: "Sustainable goat farming with growing market demand",
    heroImage: goatFarmHero,
    category: "Livestock Farming",
    location: "Various Locations, Ghana",
    minInvestment: "GHS 3,000",
    roi: "16%",
    duration: "8–10 months",
    overview:
      "The Goat Farm Package allows investors to support goat farming operations for commercial meat production.",
    steps: [
      { title: "Provide Capital", description: "Investor provides capital for goat farming." },
      { title: "Acquire & Feed", description: "Funds are used for purchasing goats, feeding, and veterinary care." },
      { title: "Growth Phase", description: "Goats are raised and matured." },
      { title: "Market Sales", description: "Goats are sold to markets and meat buyers." },
      { title: "Profit Distribution", description: "Profit is calculated and distributed to investors." },
    ],
    fundUsage: [
      "Purchasing goats",
      "Feeding and pasture management",
      "Veterinary care",
      "Farm management",
    ],
    flowSteps: ["Investor Capital", "Purchase Goats", "Growth & Care", "Market Sale", "Investor Profit (16%)"],
  },
};

const InvestmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const pkg = id ? packageData[id] : null;

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-4">Package Not Found</h1>
          <Button asChild><Link to="/packages">Back to Packages</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <img src={pkg.heroImage} alt={pkg.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-10">
          <Button variant="ghost" size="sm" asChild className="w-fit mb-4 text-primary-foreground bg-background/20 backdrop-blur-sm">
            <Link to="/packages"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Packages</Link>
          </Button>
          <Badge className="w-fit mb-3 bg-secondary text-secondary-foreground">{pkg.category}</Badge>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">{pkg.name}</h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl font-body">{pkg.tagline}</p>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, label: "Min. Investment", value: pkg.minInvestment },
            { icon: TrendingUp, label: "Expected ROI", value: pkg.roi, highlight: true },
            { icon: Calendar, label: "Duration", value: pkg.duration },
            { icon: MapPin, label: "Location", value: pkg.location },
          ].map((stat) => (
            <Card key={stat.label} className="border-border">
              <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                <stat.icon className={`h-5 w-5 ${stat.highlight ? "text-success" : "text-primary"}`} />
                <span className="text-xs text-muted-foreground font-body">{stat.label}</span>
                <span className={`font-heading font-bold text-lg ${stat.highlight ? "text-success" : "text-foreground"}`}>
                  {stat.value}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Overview */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">Investment Overview</h2>
        <p className="text-muted-foreground font-body text-lg leading-relaxed max-w-3xl">{pkg.overview}</p>
      </section>

      {/* How It Works Steps */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-10 text-center">
            How the Investment Works
          </h2>
          <div className="grid md:grid-cols-5 gap-6">
            {pkg.steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-lg mb-3">
                  {idx + 1}
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{step.description}</p>
                {idx < pkg.steps.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-primary mt-4 hidden md:block rotate-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fund Usage */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">How Your Funds Are Used</h2>
        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
          {pkg.fundUsage.map((item) => (
            <div key={item} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
              <span className="font-body text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Investor Profit */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">Investor Profit</h2>
          <p className="text-muted-foreground font-body text-lg mb-6">
            Investors receive a <span className="font-bold text-success">{pkg.roi} return</span> on their investment after harvest and sale.
          </p>
        </div>
      </section>

      {/* Investment Flow Diagram */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-10 text-center">
          Investment Flow
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-0">
          {pkg.flowSteps.map((step, idx) => (
            <div key={idx} className="flex flex-col md:flex-row items-center">
              <div
                className={`px-6 py-4 rounded-xl text-center font-heading font-semibold text-sm md:text-base shadow-sm border
                  ${idx === 0 ? "bg-primary text-primary-foreground border-primary" : ""}
                  ${idx === pkg.flowSteps.length - 1 ? "bg-success text-white border-success" : ""}
                  ${idx > 0 && idx < pkg.flowSteps.length - 1 ? "bg-card text-foreground border-border" : ""}
                `}
              >
                {step}
              </div>
              {idx < pkg.flowSteps.length - 1 && (
                <ArrowRight className="h-6 w-6 text-primary my-2 md:mx-2 md:my-0 rotate-90 md:rotate-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20 text-center">
        <Card className="max-w-xl mx-auto border-primary/20">
          <CardContent className="p-8">
            <h3 className="text-xl font-heading font-bold text-foreground mb-2">Ready to Invest?</h3>
            <p className="text-muted-foreground font-body mb-6">
              Start with as little as {pkg.minInvestment} and earn up to {pkg.roi} returns.
            </p>
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to="/packages">Invest Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default InvestmentDetails;
