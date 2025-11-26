import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Target, Eye, Heart, Shield, Leaf, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const values = [
    { icon: Shield, title: "Transparency", description: "Open and honest communication at every step" },
    { icon: TrendingUp, title: "Innovation", description: "Using technology to transform agriculture" },
    { icon: Leaf, title: "Growth", description: "Building wealth for investors and farmers" },
    { icon: Heart, title: "Accountability", description: "Taking responsibility for our commitments" },
    { icon: Target, title: "Sustainability", description: "Creating long-term agricultural value" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
          <div className="container mx-auto text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">About CES Crowdfarming</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Pioneering agricultural investment through innovation, transparency, and trust
            </p>
          </div>
        </section>

        {/* Who We Are */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Who We Are</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                CES Crowdfarming is a pioneering agribusiness investment company that introduced Ghanaians to the concept of Crowdfarming—investing together in real agricultural projects. We help everyday people grow their wealth through modern, insured, and professionally managed farm investments.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Mission */}
              <div className="bg-card p-8 rounded-lg shadow-lg border border-border hover:shadow-xl transition-shadow animate-fade-in-up">
                <div className="flex items-center mb-4">
                  <Target className="w-10 h-10 text-primary mr-4" />
                  <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Make agriculture profitable and accessible</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Empower farmers through funding and training</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Build sustainable wealth for investors</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Use technology to transform traditional farming</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span>Promote agricultural development across Ghana</span>
                  </li>
                </ul>
              </div>

              {/* Vision */}
              <div className="bg-card p-8 rounded-lg shadow-lg border border-border hover:shadow-xl transition-shadow animate-fade-in-up">
                <div className="flex items-center mb-4">
                  <Eye className="w-10 h-10 text-primary mr-4" />
                  <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To become Africa's most trusted and innovative Crowdfarming platform, connecting thousands of investors to real farm opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground animate-fade-in-up">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-card p-6 rounded-lg shadow-md border border-border hover:shadow-xl hover:scale-105 transition-all text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <value.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h4 className="font-bold text-lg mb-2 text-foreground">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary/20 to-secondary/20">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Ready to Start Your Investment Journey?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of investors building wealth through agriculture
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/invest")}>
                Start Investing
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/")}>
                Explore Packages
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
