import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Clock, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 px-4">
          <div className="container mx-auto text-center animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">Contact Us</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're here to help you with your investment journey
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Phone */}
              <Card className="hover:shadow-xl transition-shadow border-border bg-card animate-fade-in-up">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-foreground">Phone</h3>
                  <a href="tel:0596083868" className="block text-muted-foreground hover:text-primary transition-colors mb-1">
                    0596083868
                  </a>
                  <a href="tel:0245590858" className="block text-muted-foreground hover:text-primary transition-colors">
                    0245590858
                  </a>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className="hover:shadow-xl transition-shadow border-border bg-card animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-foreground">Email</h3>
                  <a href="mailto:ces@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                    ces@gmail.com
                  </a>
                </CardContent>
              </Card>

              {/* Office Hours */}
              <Card className="hover:shadow-xl transition-shadow border-border bg-card animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-foreground">Office Hours</h3>
                  <p className="text-muted-foreground mb-1">Monday–Saturday</p>
                  <p className="text-muted-foreground">8am–6pm</p>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="hover:shadow-xl transition-shadow border-border bg-card animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-foreground">Location</h3>
                  <p className="text-muted-foreground">Accra, Ghana</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary/20 to-secondary/20">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Ready to Start Investing?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Reach out to us today and we'll guide you through the investment process
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => window.location.href = 'mailto:ces@gmail.com'}
              >
                Email Us Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.location.href = 'tel:0596083868'}
              >
                Call Us
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
