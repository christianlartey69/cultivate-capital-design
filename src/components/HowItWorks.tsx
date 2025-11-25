import { Card, CardContent } from "@/components/ui/card";
import step1Image from "@/assets/step-1-buy-asset.jpg";
import step2Image from "@/assets/step-2-growth.jpg";
import step3Image from "@/assets/step-3-profit.jpg";

const steps = [
  {
    number: "1",
    title: "Buy the Asset",
    description: "You buy the asset (livestock or plant-based) from the farmer, through CES Consult.",
    image: step1Image,
  },
  {
    number: "2",
    title: "Asset Grows",
    description: "The asset grows in the farmer's care with professional management and regular updates.",
    image: step2Image,
  },
  {
    number: "3",
    title: "Earn Returns",
    description: "The farmer buys back the asset once it has fully grown at harvest. You, the investor, earn 15% ROI from the sale.",
    image: step3Image,
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            How It Works on the Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-4">
            Buy & Own Real Farm Assets
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our Crowdfarming™ platform connects you with approved farmers who already have goats, pigs, and other assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="relative overflow-hidden border-2 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center z-10">
                <span className="text-2xl font-bold text-primary-foreground">{step.number}</span>
              </div>
              <div className="aspect-video overflow-hidden">
                <img 
                  src={step.image} 
                  alt={step.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-success/10 border-2 border-success rounded-lg p-6">
            <p className="text-2xl font-bold text-success">
              15% ROI Guaranteed
            </p>
            <p className="text-muted-foreground mt-2">
              Earn consistent returns on your agricultural investments
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
