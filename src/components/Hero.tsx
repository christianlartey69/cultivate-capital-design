import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-agriculture.jpg";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Sustainable agriculture fields" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-soil/90 via-soil/70 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-background mb-6 leading-tight fade-in-up">
            Transforming Agriculture Investment
          </h1>
          <p className="text-xl md:text-2xl text-background/90 mb-8 font-body fade-in-up" style={{ animationDelay: '0.1s' }}>
            Driving innovation, building sustainable practices, and delivering exceptional returns through expert agricultural advisory.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button size="lg" asChild className="emboss-hover bg-secondary hover:bg-secondary/90 text-secondary-foreground">
              <Link to="/packages">
                Explore Packages <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-background/10 backdrop-blur-sm border-background text-background hover:bg-background hover:text-soil">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-background/20 fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-secondary" />
                <span className="text-3xl font-heading font-bold text-background">15%+</span>
              </div>
              <p className="text-sm text-background/80 font-body">Average ROI</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-5 w-5 text-secondary" />
                <span className="text-3xl font-heading font-bold text-background">2,500+</span>
              </div>
              <p className="text-sm text-background/80 font-body">Investors</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-5 w-5 text-secondary" />
                <span className="text-3xl font-heading font-bold text-background">100%</span>
              </div>
              <p className="text-sm text-background/80 font-body">Transparent</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
