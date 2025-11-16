import { Target, Lightbulb, TrendingUp, Handshake, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const missions = [
  {
    icon: Users,
    title: "Client Satisfaction",
    description: "User-friendly, trustworthy interface that helps investors clearly understand their investment journey.",
  },
  {
    icon: Target,
    title: "Market Leadership",
    description: "Modern yet heritage-grounded leader in agriculture investment consulting.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Improvement",
    description: "Clean, scalable, future-ready approach to agricultural investment.",
  },
  {
    icon: Lightbulb,
    title: "Expanding Services",
    description: "Supporting future features, analytics, and expanded investment categories.",
  },
  {
    icon: Handshake,
    title: "Strengthening Relationships",
    description: "Long-term investor engagement and transparency through open communication.",
  },
];

export const Mission = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Our Mission & Values
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
            Transforming client operations, driving innovation, and building sustainable practices in agriculture investment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission, index) => {
            const Icon = mission.icon;
            return (
              <Card 
                key={index} 
                className="vintage-border emboss-hover growth-animation bg-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-3 text-foreground">
                    {mission.title}
                  </h3>
                  <p className="text-muted-foreground font-body leading-relaxed">
                    {mission.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
