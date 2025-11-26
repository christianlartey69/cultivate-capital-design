import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Quote, Star } from "lucide-react";

const Testimonials = () => {
  const navigate = useNavigate();

  const testimonials = [
    {
      name: "Ama",
      location: "Accra",
      message: "CES helped me grow my savings with peace of mind. The updates are very reassuring.",
      rating: 5
    },
    {
      name: "Francis",
      location: "Kumasi",
      message: "My goat investment was handled professionally from start to finish. Highly recommended.",
      rating: 5
    },
    {
      name: "Olivia",
      location: "UK",
      message: "Finally a trusted agricultural platform I can invest in from abroad.",
      rating: 5
    },
    {
      name: "Kofi",
      location: "Tema",
      message: "The insurance alone makes CES stand out. My returns were delivered as promised.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
          <div className="container mx-auto text-center animate-fade-in-up">
            <Quote className="w-16 h-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">What Our Investors Say</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Real stories from investors who trust CES Crowdfarming
            </p>
          </div>
        </section>

        {/* Testimonials Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-xl transition-shadow border-border bg-card animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-8">
                    <Quote className="w-10 h-10 text-primary/30 mb-4" />
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6 italic">
                      "{testimonial.message}"
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground text-lg">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="animate-fade-in-up">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">500+</div>
                <p className="text-muted-foreground">Happy Investors</p>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">15%</div>
                <p className="text-muted-foreground">Average ROI</p>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground">Insured Assets</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Join Our Growing Community</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your investment journey and become part of our success stories
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

export default Testimonials;
